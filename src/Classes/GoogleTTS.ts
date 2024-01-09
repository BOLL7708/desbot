import Dictionary, {IDictionaryEntry} from './Dictionary.js'
import Color from './ColorConstants.js'
import AudioPlayer, {AudioPlayerInstance} from './AudioPlayer.js'
import {IAudioAction} from '../Interfaces/iactions.js'
import {IGoogleVoice} from '../Interfaces/igoogle.js'
import {ITwitchEmotePosition} from '../Interfaces/itwitch_chat.js'
import {IAudioPlayedCallback} from '../Interfaces/iaudioplayer.js'
import Utils from './Utils.js'
import TwitchHelixHelper from './TwitchHelixHelper.js'
import DataBaseHelper from './DataBaseHelper.js'
import {ConfigSpeech} from '../Objects/Config/ConfigSpeech.js'
import {SettingTwitchTokens} from '../Objects/Setting/SettingTwitch.js'
import {SettingUser, SettingUserVoice} from '../Objects/Setting/SettingUser.js'
import TextHelper from './TextHelper.js'
import {SettingDictionaryEntry} from '../Objects/Setting/SettingDictionary.js'
import ConfigChat from '../Objects/Config/ConfigChat.js'
import {ConfigController} from '../Objects/Config/ConfigController.js'
import {ActionAudio} from '../Objects/Action/ActionAudio.js'
import AudioUtils from './AudioUtils.js'
import {OptionTTSType} from '../Options/OptionTTS.js'
import {IDictionary} from '../Interfaces/igeneral.js'
import ArrayUtils from './ArrayUtils.js'

export default class GoogleTTS {
    private _config = new ConfigSpeech()
    private _chatConfig = new ConfigChat()
    private _speakerTimeoutMs: number = 0
    private _audio: AudioPlayerInstance = new AudioPlayerInstance()
    private _voices: IGoogleVoice[] = [] // Cache
    private _randomVoices: IGoogleVoice[] = [] // Cache for randomizing starter voice
    private _languages: string[] = [] // Cache
    private _lastEnqueued: number = 0
    private _lastSpeaker: number = 0
    private _callback: IAudioPlayedCallback = (nonce, status)=>{ console.log(`GoogleTTS: Played callback not set, ${nonce}->${status}`) }
    private _emptyMessageSound: IAudioAction|undefined
    private _count = 0
    private _preloadQueue: {[key:number]: IAudioAction|null} = {} // Can be a string because we keep track on if it is in progress that way.
    private _preloadQueueLoopHandle: number = 0
    private _preloadInfo: {[key:number]: string} = {}
    private _dequeueCount = 0
    private _dequeueMaxTries = 10
    private _dictionary = new Dictionary()

    constructor() {
        this._preloadQueueLoopHandle = setInterval(this.checkForFinishedDownloads.bind(this), 250)
        this.init().then()
    }
    private async init() {
        this._config = await DataBaseHelper.loadMain(new ConfigSpeech())
        this._chatConfig = await DataBaseHelper.loadMain(new ConfigChat())
        this._speakerTimeoutMs = this._config.speakerTimeoutMs
    }

    private checkForFinishedDownloads() {
        let key = Utils.toInt(Object.keys(this._preloadQueue).shift()) // Get the oldest key without removing it
        if(key) {
            const entry = this._preloadQueue[key] // Get stored entry for key
            if(entry === null) { // We are still waiting for a result
                this._dequeueCount++;
                if (this._dequeueCount > this._dequeueMaxTries) {
                    const info = this._preloadInfo[key]
                    // The request for this TTS has timed out
                    delete this._preloadQueue[key]
                    console.error(`GoogleTTS Request [${key}] timed out!`, this._dequeueCount, info)
                    this._dequeueCount = 0;

                    // TODO: Error sound?
                    if(info) this.enqueueEmptyMessageSound(++this._count)
                }
            } else {
                delete this._preloadQueue[key]
                if(entry) { // If not undefined we have a valid audio object
                    // Presumed a successful result, transition queue
                    this._audio.enqueueAudio(entry)
                } else {
                    // The request has failed
                    const info = this._preloadInfo[key]
                    console.error(`GoogleTTS: Request [${key}] failed!`, info)

                    // TODO: Error sound?
                    if(info) this.enqueueEmptyMessageSound(++this._count)
                }
                this._dequeueCount = 0
                delete this._preloadInfo[key]
            }
        }
    }

    setHasSpokenCallback(callback: IAudioPlayedCallback) {
        this._callback = callback
        this._audio.setPlayedCallback(callback)
    }

    setEmptyMessageSound(audio:IAudioAction|undefined) {
        this._emptyMessageSound = audio
    }

    private enqueueEmptyMessageSound(serial: number) {
        if(this._emptyMessageSound != null) this._preloadQueue[serial] = this._emptyMessageSound
        else delete this._preloadQueue[serial]
    }

    stopSpeaking(andClearQueue: boolean = false) {
        this._audio.stop(andClearQueue)
    }

    setDictionary(dictionary?: IDictionary<SettingDictionaryEntry>) {
        if(dictionary !== undefined) {
            const dictionaryEntries = Object.entries(dictionary).map(([key, entry])=>{
                return { original: key, substitute: entry.substitute } as IDictionaryEntry
            })
            this._dictionary.set(dictionaryEntries)
        }
    }
    /**
     * Will enqueue 
     * @param input The text to be spoken
     * @param userId The id of the user speaking
     * @param type The type: TYPE_SAID, TYPE_ACTION, TYPE_ANNOUNCEMENT, TYPE_CHEER
     * @param nonce Unique value that will be provided in the done speaking callback
     * @param meta Used to provide bit-count for cheering messages (at least)
     * @param clearRanges Used to clear out Twitch emojis from the text
     * @param skipDictionary Will skip replacing words in the text, enables dictionary additions to be read out properly.
     * @returns
     */
    async enqueueSpeakSentence(
        input: string|string[],
        userId: number = 0,
        type: number = OptionTTSType.Announcement,
        nonce: string = '',
        meta: any = null,
        clearRanges: ITwitchEmotePosition[]=[],
        skipDictionary: boolean = false
    ) {
        if(userId == 0) userId = (await DataBaseHelper.load(new SettingTwitchTokens(), 'Chatbot'))?.userId ?? 0
        const serial = ++this._count
        this._preloadQueue[serial] = null
        const user = await DataBaseHelper.loadOrEmpty(new SettingUser(), userId.toString())

        // Check blacklist
        if(user.mute.active) {
            console.warn(`GoogleTTS: User ${userId} blacklisted, skipped!`, input)
            delete this._preloadQueue[serial]
            return
        }

        // Randomize input
        if(Array.isArray(input)) input = Utils.randomFromArray<string>(input)

        // Empty message sound
        if(input.trim().length == 0) {
            console.warn(`GoogleTTS: User ${userId} sent empty message!`, input)
            this.enqueueEmptyMessageSound(serial)
            return
        }

        // Will not even make empty message sound, so secret!
        const controllerConfig = await DataBaseHelper.loadMain(new ConfigController())
        if(Utils.matchFirstChar(input, controllerConfig.secretChatSymbols)) {
            console.warn(`GoogleTTS: User ${userId} sent secret message!`, input)
            delete this._preloadQueue[serial]
            return
        }

        const sentence = {text: input, userId: userId, type: type, meta: meta}
        let url = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${this._config.googleApiKey}`
        let text = sentence.text

        // Another empty check, I'm not sure why.
        if(text == null || text.length == 0) {
            console.error(`GoogleTTS: User ${userId} text was null or empty!`, input)
            this.enqueueEmptyMessageSound(serial)
            return
        }

        // Get voice
        let voice = user.voice
        if(!Utils.hasValidProps(user.voice)) {
            voice = await this.getDefaultVoice()
            user.voice = voice
            await DataBaseHelper.save(user, userId.toString())
        }

        // Get username
        const userData = await TwitchHelixHelper.getUserById(sentence.userId)
        let cleanName = await TextHelper.loadCleanName(userData?.id ?? sentence.userId)

        // Clean input text
        const cleanTextConfig = Utils.clone(this._config.cleanTextConfig) // TODO: Apparently not a class instance as no __clone available?
        cleanTextConfig.removeBitEmotes = sentence.type == OptionTTSType.Cheer
        let cleanText = await TextHelper.cleanText(
            text, 
            cleanTextConfig,
            clearRanges,
        )

        // Check if cleaned text is empty
        if(cleanText.length == 0) {
            console.warn(`GoogleTTS: User ${userId} clean text empty, skipping!`, input)
            this.enqueueEmptyMessageSound(serial)
            return
        }

        // If announcement the dictionary can be skipped.
        if(
            type == OptionTTSType.Announcement
            && this._config.dictionaryConfig.skipForAnnouncements
        ) skipDictionary = true

        // Apply dictionary
        if(!skipDictionary) cleanText = this._dictionary.apply(cleanText)

        // Build message depending on type
        if(Date.now() - this._lastEnqueued > this._speakerTimeoutMs) this._lastSpeaker = 0
        switch(sentence.type) {
            case OptionTTSType.Said:
                const speech = this._chatConfig.speechTemplate
                cleanText = (this._lastSpeaker == sentence.userId || this._config.skipSaid)
                    ? cleanText 
                    : TextHelper.replaceTags(speech, {userNick: cleanName, userInput: cleanText})
                break
            case OptionTTSType.Action:
                cleanText = `${cleanName} ${cleanText}`
                break
            case OptionTTSType.Cheer:
                let bitText = sentence.meta > 1 ? 'bits' : 'bit'
                cleanText = `${cleanName} cheered ${sentence.meta} ${bitText}: ${cleanText}`
                break
        }
        this._lastSpeaker = sentence.userId

        // Surround in speak tags to make the SSML parse if we have used audio tags.
        if(this._config.dictionaryConfig.replaceWordsWithAudio) {
            cleanText = `<speak>${cleanText}</speak>`
        }
        // console.log('GoogleTTS', cleanText)

        // Fetch audio
        let textVar: number = ((cleanText.length-150)/500) // 500 is the max length message on Twitch
        this._preloadInfo[serial] = `${userId} | ${cleanName} | ${input}`
        // console.log('GoogleTTS', serial, this._preloadInfo[serial])
        const voiceConfig: {[key: string]: string} = {}
        voiceConfig['languageCode'] = voice.languageCode ?? 'en-US' // Needs to exist, then either voice NAME or GENDER
        if(voice.voiceName.length > 0) voiceConfig['name'] = voice.voiceName
        else voiceConfig['ssmlGender'] = (voice.gender.length > 0 ? voice.gender : ArrayUtils.getRandom(['male', 'female']) ?? 'male').toUpperCase()
        // TODO: Even if gender is provided as specified it seems to not work.
        //  Not sure if we should stop supporting gender entirely and only do specific voices?
        const response = await fetch(url, {
            method: 'post',
            body: JSON.stringify({
                input: {
                    ssml: cleanText
                },
                voice: voiceConfig,
                audioConfig: {
                    audioEncoding: "OGG_OPUS",
                    speakingRate: this._config.speakingRateOverride <= 0 ? (1.0 + textVar * 0.25) : this._config.speakingRateOverride, // Should probably make this a curve
                    pitch: textVar * 1.0,
                    volumeGainDb: 0.0
                },
                enableTimePointing: [
                    "TIMEPOINT_TYPE_UNSPECIFIED"
                ]
            })
        })
        if(response.ok) {
            const json = await response.json()
            if (typeof json?.audioContent === 'string' && json.audioContent.length > 0) {
                this._preloadQueue[serial] = {
                    nonce: nonce,
                    srcEntries: `data:audio/ogg;base64,${json.audioContent}`,
                }
                this._lastEnqueued = Date.now()
                console.log(`GoogleTTS: User ${userId} speech OK: [${json.audioContent.length}], enqueued!`, input)
            } else {
                this.enqueueEmptyMessageSound(serial)
                this._lastSpeaker = 0
                this._callback?.call(this, nonce, AudioPlayer.STATUS_ERROR)
                console.warn(`GoogleTTS: User ${userId} speech INVALID: [${json.status}], ${json.error}`, input)
            }
        } else {
            this.enqueueEmptyMessageSound(serial)
            console.error(`GoogleTTS: User ${userId} speech ERROR: [${response.status}], ${response.statusText}`, input)
        }
    }

    enqueueSoundEffect(actionAudio: ActionAudio|undefined) {
        if(actionAudio) {
            this._preloadQueue[++this._count] = AudioUtils.configAudio(actionAudio)
        }
    }

    async setVoiceForUser(userId: number, input:string, nonce:string=''):Promise<string> {
        await this.loadVoicesAndLanguages() // Fills caches
        const user = await DataBaseHelper.loadOrEmpty(new SettingUser(), userId.toString())
        const defaultVoice = await this.getDefaultVoice()
        let voice = defaultVoice
        if(Utils.hasValidProps(user.voice)) voice = user.voice
        
        const inputArr = input.split(' ')
        let changed = false
        inputArr.forEach(setting => {
            setting = setting.toLowerCase()

            // Match gender // TODO: Gender does not work with Google anymore, will have to do our own support.
            // if((setting == 'female' || setting == 'male')) {
            //     voice.voiceName = '' // Gender is not respected if we have a name
            //     voice.gender = setting
            //     changed = true
            //     Utils.log(`GoogleTTS: Matched gender: ${setting}`, Color.BlueViolet)
            //     return
            // }
                       
            // Match country code
            if((setting.includes('-') && setting.split('-').length == 2) || setting.length <= 3) {
                if(this._languages.find(lang => lang.toLowerCase() == setting)) {
                    if(voice.languageCode.toLowerCase() != setting) {
                        voice.voiceName = '' // Language is not respected if we have a name
                        voice.languageCode = setting
                        changed = true
                        Utils.log(`GoogleTTS: Matched full language code: ${setting}`, Color.BlueViolet)
                        return
                    }
                } else {
                    const validCode = 
                        this._languages.find(lang => lang.toLowerCase().startsWith(setting))
                        ?? this._languages.find(lang => lang.toLowerCase().endsWith(setting))
                    if(validCode && validCode.toLowerCase() != voice.languageCode.toLowerCase()) {
                        voice.voiceName = '' // Language is not respected if we have a name
                        voice.languageCode = validCode
                        changed = true
                        Utils.log(`GoogleTTS: Matched partial language code: ${setting}`, Color.BlueViolet)
                        return
                    }
                }
            }
            
            // Match incoming full voice name
            let re = new RegExp(/([a-zA-Z]+)-([a-zA-Z]+)-(\w+)-([a-zA-Z])/)
            const matches = setting.match(re)
            if(matches != null) {
                if(this._voices.find(v => v.name.toLowerCase() == matches[0])) {
                    if(voice.voiceName.toLowerCase() != matches[0]) {
                        voice.voiceName = matches[0]
                        voice.languageCode = `${matches[1]}-${matches[2]}` // This is always needed
                        voice.gender = '' // This can be a mismatch and prevent synthesizing
                        changed = true
                        Utils.log(`GoogleTTS: Matched voice name: ${setting}`, Color.BlueViolet)
                        return
                    }
                }
            }

            // Match reset
            if(setting == 'reset' || setting == 'x') {
                voice = defaultVoice
                changed = true
                Utils.log(`GoogleTTS: Matched reset: ${setting}`, Color.BlueViolet)
                return 
            }

            // Randomize among ALL voices
            if(setting == 'random' || setting == 'rand' || setting == '?') {
                Utils.log(`GoogleTTS: Matched random: ${setting}`, Color.BlueViolet)
                const randomVoice = ArrayUtils.getRandom(this._voices)
                voice = this.buildVoice(randomVoice)
                changed = true
                return
            }
        })
        user.voice = voice
        user.voice.datetime = Utils.getISOTimestamp()
        let success = await DataBaseHelper.save(user, userId.toString())
        Utils.log(`GoogleTTS: Voice saved: ${success}`, Color.BlueViolet)
        return voice.voiceName
    }

    private async loadVoicesAndLanguages():Promise<boolean> {
        if(this._voices.length == 0) {
            let url = `https://texttospeech.googleapis.com/v1beta1/voices?key=${this._config.googleApiKey}`
            return fetch(url).then(response => response?.json()).then(json => {
                console.log("Voices loaded!")
                let voices: IGoogleVoice[] = json?.voices
                if(voices != null) {
                    voices = voices.filter(voice => voice.name.includes('Wavenet') || voice.name.includes('Neural') || voice.name.includes('News') || voice.name.includes('Studio'))
                    this._voices = voices
                    this._randomVoices = voices.filter(voice => voice.languageCodes.find(code => code.indexOf(this._config.randomizeVoiceLanguageFilter) == 0))
                    voices.forEach(voice => {
                        voice.languageCodes.forEach(code => {
                            code = code.toLowerCase()
                            if(this._languages.indexOf(code) == -1) this._languages.push(code)
                        })
                    })
                    return true
                }
                else return false
            })
        } else return true
    }

    private async getDefaultVoice():Promise<SettingUserVoice> {
        await this.loadVoicesAndLanguages() // Fills caches
        let defaultVoice = this._voices.find(voice => voice.name.toLowerCase() == this._config.defaultVoice)
        let randomVoice: IGoogleVoice|undefined = this._randomVoices.length > 0
            ? this._randomVoices[Math.floor(Math.random()*this._randomVoices.length)]
            : undefined
        return this._config.randomizeVoice && randomVoice != null
            ? this.buildVoice(randomVoice)
            : this.buildVoice(defaultVoice)
    }

    private buildVoice(voice: IGoogleVoice|undefined):SettingUserVoice {
        const setting = new SettingUserVoice()
        setting.languageCode = voice?.languageCodes.shift() ?? 'en-US'
        setting.voiceName = voice?.name ?? ''
        setting.gender = voice?.ssmlGender ?? 'FEMALE'
        return setting
    }
}