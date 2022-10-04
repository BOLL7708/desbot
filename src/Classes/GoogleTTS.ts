import Dictionary, {IDictionaryEntry} from './Dictionary.js'
import {ETTSType} from '../Widget/Enums.js'
import Config from '../ClassesStatic/Config.js'
import Color from '../ClassesStatic/colors.js'
import AudioPlayer, {AudioPlayerInstance} from './AudioPlayer.js'
import {IAudioAction} from '../Interfaces/iactions.js'
import {IGoogleVoice} from '../Interfaces/igoogle.js'
import {ITwitchEmotePosition} from '../Interfaces/itwitch_chat.js'
import {IAudioPlayedCallback} from '../Interfaces/iaudioplayer.js'
import Utils from '../ClassesStatic/Utils.js'
import {SettingTwitchTokens, SettingUserMute, SettingUserVoice} from './_Settings.js'
import TwitchHelix from '../ClassesStatic/TwitchHelix.js'
import DB from '../ClassesStatic/DB.js'

export default class GoogleTTS {
    static get PRELOAD_EMPTY_KEY() {return 'This request has not finished or failed yet.' } // Reference of a request still in progress.
    // TODO: Split this up into a TTS master class, and separate voice integrations.
    private _speakerTimeoutMs: number = Config.google.speakerTimeoutMs
    private _audio: AudioPlayerInstance = new AudioPlayerInstance()
    private _voices: IGoogleVoice[] = [] // Cache
    private _randomVoices: IGoogleVoice[] = [] // Cache for randomizing starter voice
    private _languages: string[] = [] // Cache
    private _lastEnqueued: number = 0
    private _lastSpeaker: number = 0
    private _callback: IAudioPlayedCallback = (nonce, status)=>{ console.log(`GoogleTTS: Played callback not set, ${nonce}->${status}`) }
    private _emptyMessageSound: IAudioAction|undefined
    private _count = 0
    private _preloadQueue: Record<number, IAudioAction|string|null> = {} // Can be a string because we keep track on if it is in progress that way.
    private _preloadQueueLoopHandle: number = 0
    private _dequeueCount = 0
    private _dequeueMaxTries = 10
    private _dictionary = new Dictionary()

    constructor() {
        this._preloadQueueLoopHandle = setInterval(this.checkForFinishedDownloads.bind(this), 250)
    }

    private checkForFinishedDownloads() {
        let key = Utils.toInt(Object.keys(this._preloadQueue).shift(), -1) // Get oldest key
        if(key != undefined && key >= 0) {
            const entry = this._preloadQueue[key] // Get stored entry for key
            if(entry !== GoogleTTS.PRELOAD_EMPTY_KEY) { // If not empty we have had a result
                if(entry != null && typeof entry != 'string') { // If not empty and not a string we have a valid audio object
                    // Presumed a successful result, transition queue
                    delete this._preloadQueue[key]
                    this._audio.enqueueAudio(entry)
                } else {
                    // The request has failed
                    delete this._preloadQueue[key]
                    Utils.log(`GoogleTTS: Request [${key}] failed, "${entry}"`, Color.DarkRed)
                }
                this._dequeueCount = 0
            } else { // We are still waiting for this request to finish
                this._dequeueCount++;
                if(this._dequeueCount > this._dequeueMaxTries) {
                    // The request for this TTS has timed out
                    delete this._preloadQueue[key]
                    this._dequeueCount = 0;
                    Utils.log(`GoogleTTS Request [${key}] timed out. (${this._dequeueCount})`, Color.DarkRed)
                }
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

    setDictionary(dictionary?: IDictionaryEntry[]) {
        if(dictionary) this._dictionary.set(dictionary)
    }
    /**
     * Will enqueue 
     * @param input The text to be spoken
     * @param userId The id of the user speaking
     * @param type The type: TYPE_SAID, TYPE_ACTION, TYPE_ANNOUNCEMENT, TYPE_CHEER
     * @param nonce Unique value that will be provided in the done speaking callback
     * @param meta Used to provide bit count for cheering messages (at least)
     * @param clearRanges Used to clear out Twitch emojis from the text
     * @param skipDictionary Will skip replacing words in the text, enables dictionary additions to be read out properly.
     * @returns
     */
    async enqueueSpeakSentence(
        input: string|string[],
        userId: number = 0,
        type: ETTSType = ETTSType.Announcement,
        nonce: string = '',
        meta: any = null,
        clearRanges: ITwitchEmotePosition[]=[],
        skipDictionary: boolean = false
    ) {
        if(userId == 0) userId = (await DB.loadSetting(new SettingTwitchTokens(), 'Chatbot'))?.userId ?? 0
        const serial = ++this._count
        this._preloadQueue[serial] = null
        const blacklist = await DB.loadSetting(new SettingUserMute(), userId.toString())
        if(blacklist?.active) return
        if(Array.isArray(input)) input = Utils.randomFromArray<string>(input)
        if(input.trim().length == 0) return this.enqueueEmptyMessageSound(serial)
        if(Utils.matchFirstChar(input, Config.controller.secretChatSymbols)) return // Will not even make empty message sound, so secret!

        const sentence = {text: input, userId: userId, type: type, meta: meta}
        let url = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${Config.credentials.GoogleTTSApiKey}`
        let text = sentence.text
        if(text == null || text.length == 0) {
            this.enqueueEmptyMessageSound(serial)
            console.error("GoogleTTS: Sentence text was null or empty")
            return 
        }
        let voice = await DB.loadSetting(new SettingUserVoice(), userId.toString())
        if(voice == null) {
            voice = await this.getDefaultVoice()
            await DB.saveSetting(voice, userId.toString())
        }
        const userData = await TwitchHelix.getUserById(sentence.userId)
        let cleanName = await Utils.loadCleanName(userData?.id ?? sentence.userId)
        const cleanTextConfig = Utils.clone(Config.google.cleanTextConfig)
        cleanTextConfig.removeBitEmotes = sentence.type == ETTSType.Cheer
        let cleanText = await Utils.cleanText(
            text, 
            cleanTextConfig,
            clearRanges,
        )
        if(cleanText.length == 0) {
            this.enqueueEmptyMessageSound(serial)
            console.warn("GoogleTTS: Clean text had zero length, skipping")
            return
        }

        if( // If announcement the dictionary can be skipped.
            type == ETTSType.Announcement
            && Config.google.dictionaryConfig.skipForAnnouncements
        ) skipDictionary = true

        if(!skipDictionary) cleanText = this._dictionary.apply(cleanText)

        if(Date.now() - this._lastEnqueued > this._speakerTimeoutMs) this._lastSpeaker = 0
        switch(sentence.type) {
            case ETTSType.Said:
                const speech = Config.twitchChat.speech ?? '%userNick said: %userInput'
                cleanText = (this._lastSpeaker == sentence.userId || Config.google.skipSaid)
                    ? cleanText 
                    : Utils.replaceTags(speech, {userNick: cleanName, userInput: cleanText})
                break
            case ETTSType.Action:
                cleanText = `${cleanName} ${cleanText}`
                break
            case ETTSType.Cheer:
                let bitText = sentence.meta > 1 ? 'bits' : 'bit'
                cleanText = `${cleanName} cheered ${sentence.meta} ${bitText}: ${cleanText}`
                break
        }
        this._lastSpeaker = sentence.userId

        // Surround in speak tags to make the SSML parse if we have used audio tags.
        if(Config.google.dictionaryConfig.replaceWordsWithAudio) {
            cleanText = `<speak>${cleanText}</speak>`
        }

        let textVar:number = ((cleanText.length-150)/500) // 500 is the max length message on Twitch
        return fetch(url, {
            method: 'post',
            body: JSON.stringify({
            input: {
                ssml: cleanText
            },
            voice: {
                languageCode: voice.languageCode,
                name: voice.voiceName,
                ssmlGender: voice.gender
            },
            audioConfig: {
                audioEncoding: "OGG_OPUS",
                speakingRate: Config.google.speakingRateOverride ?? 1.0 + textVar * 0.25, // Should probably make this a curve
                pitch: textVar * 1.0,
                volumeGainDb: 0.0
            },
            enableTimePointing: [
                "TIMEPOINT_TYPE_UNSPECIFIED"
            ]
          })
        }).then((response) => response.json()).then(json => {
            if (typeof json.audioContent != 'undefined' && json.audioContent.length > 0) {
                console.log(`GoogleTTS: Successfully got speech: [${json.audioContent.length}]`)
                this._preloadQueue[serial] = {
                    nonce: nonce,
                    srcEntries: `data:audio/ogg;base64,${json.audioContent}`
                }
                this._lastEnqueued = Date.now()
            } else {
                delete this._preloadQueue[serial]
                this._lastSpeaker = 0
                console.error(`GoogleTTS: Failed to generate speech: [${json.status}], ${json.error}`)
                this._callback?.call(this, nonce, AudioPlayer.STATUS_ERROR)
            }
        })
    }

    enqueueSoundEffect(audio: IAudioAction|undefined) {
        if(audio) {
            const serial = ++this._count
            this._preloadQueue[serial] = audio
        }
    }

    async setVoiceForUser(userId: number, input:string, nonce:string=''):Promise<string> {
        await this.loadVoicesAndLanguages() // Fills caches
        let loadedVoice = await DB.loadSetting(new SettingUserVoice(), userId.toString())
        const defaultVoice = await this.getDefaultVoice()
        let voice = defaultVoice
        if(loadedVoice != null) voice = loadedVoice
        
        const inputArr = input.split(' ')
        let changed = false
        inputArr.forEach(setting => {
            setting = setting.toLowerCase()

            // Match gender
            if((setting == 'female' || setting == 'male')) {
                voice.voiceName = '' // Gender is not respected if we have a name
                voice.gender = setting
                changed = true
                Utils.log(`GoogleTTS: Matched gender: ${setting}`, Color.BlueViolet)
                return
            }
                       
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
            let re = new RegExp(/([a-z]+)-([a-z]+)-(\w+)-([a-z])/)
            const matches = setting.match(re)
            if(matches != null) {
                if(this._voices.find(v => v.name.toLowerCase() == matches[0])) {
                    if(voice.voiceName.toLowerCase() != matches[0]) {
                        voice.voiceName = matches[0]
                        voice.languageCode = `${matches[1]}-${matches[2]}`
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
                const randomVoice = this._voices.getRandom()
                voice = this.buildVoice(randomVoice)
                changed = true
                return
            }
        })
        let success = await DB.saveSetting(voice, userId.toString())
        Utils.log(`GoogleTTS: Voice saved: ${success}`, Color.BlueViolet)
        return voice.voiceName
    }

    private async loadVoicesAndLanguages():Promise<boolean> {
        if(this._voices.length == 0) {
            let url = `https://texttospeech.googleapis.com/v1beta1/voices?key=${Config.credentials.GoogleTTSApiKey}`
            return fetch(url).then(response => response?.json()).then(json => {
                console.log("Voices loaded!")
                let voices: IGoogleVoice[] = json?.voices
                if(voices != null) {
                    voices = voices.filter(voice => voice.name.indexOf('Wavenet') > -1)
                    this._voices = voices
                    this._randomVoices = voices.filter(voice => voice.languageCodes.find(code => code.indexOf(Config.google.randomizeVoiceLanguageFilter) == 0))
                    voices.forEach(voice => {
                        voice.languageCodes.forEach(code => {
                            code = code.toLowerCase()
                            if(this._languages.indexOf(code) < 0) this._languages.push(code)
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
        let defaultVoice = this._voices.find(voice => voice.name.toLowerCase() == Config.google.defaultVoice)
        let randomVoice: IGoogleVoice|undefined = this._randomVoices.length > 0
            ? this._randomVoices[Math.floor(Math.random()*this._randomVoices.length)]
            : undefined
        return Config.google.randomizeVoice && randomVoice != null
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