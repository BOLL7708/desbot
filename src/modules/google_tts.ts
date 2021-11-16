class GoogleTTS {
    static get TYPE_SAID() { return 0 } // [name] said: [text]
    static get TYPE_ACTION() { return 1 } // [name] [text]
    static get TYPE_ANNOUNCEMENT() { return 2 } // [text]
    static get TYPE_CHEER() { return 3 } // [name] cheered: [text]

    // TODO: Split this up into a TTS master class, and separate voice integrations.
    private _config: IGoogleConfig = Config.google;
    private _speakerTimeoutMs: number = Config.google.speakerTimeoutMs
    private _audio: AudioPlayer = new AudioPlayer()
    private _voices: IGoogleVoice[] = [] // Cache
    private _randomVoices: IGoogleVoice[] = [] // Cache for randomizing starter voice
    private _languages: string[] = [] // Cache
    private _lastEnqueued: number = 0
    private _lastSpeaker: string = ''
    private _callback: IAudioPlayedCallback
    private _emptyMessageSound: IAudio|null
    private _dictionary: Record<string, string> = {}

    private _count = 0
    private _preloadEmptyKey: string = 'This request has not finished or failed yet.'
    private _preloadQueue: Record<number, IAudio|null|string> = {}
    private _preloadQueueLoopHandle: number = 0
    private _dequeueCount = 0
    private _dequeueMaxTries = 10

    constructor() {
        this._preloadQueueLoopHandle = setInterval(this.checkForFinishedDownloads.bind(this), 250)
    }

    private checkForFinishedDownloads() {
        const key = Object.keys(this._preloadQueue).shift() // Get oldest key
        if(key != undefined) {
            const entry = this._preloadQueue[key] // Get stored entry for key
            if(entry !== this._preloadEmptyKey) { // If not empty we have had a result
                if(entry != null) { 
                    // Presumed a successful result, transition queue
                    delete this._preloadQueue[key]
                    this._audio.enqueueAudio(entry)
                } else {
                    // The request has failed
                    delete this._preloadQueue[key]
                    Utils.log(`TTS request [${key}] failed.`, Color.DarkRed)
                }
                this._dequeueCount = 0
            } else { // We are still waiting for this request to finish
                this._dequeueCount++;
                if(this._dequeueCount > this._dequeueMaxTries) {
                    // The request for this TTS has timed out
                    delete this._preloadQueue[key]
                    this._dequeueCount = 0;
                    Utils.log(`TTS request [${key}] timed out. (${this._dequeueCount})`, Color.DarkRed)
                }
            }
        }
    }

    setHasSpokenCallback(callback: IAudioPlayedCallback) {
        this._callback = callback
        this._audio.setPlayedCallback(callback)
    }

    setEmptyMessageSound(audio:IAudio|null) {
        this._emptyMessageSound = audio
    }

    private enqueueEmptyMessageSound(serial: number) {
        if(this._emptyMessageSound != null) this._preloadQueue[serial] = this._emptyMessageSound
        else delete this._preloadQueue[serial]
    }

    stopSpeaking(andClearQueue: boolean = false) {
        this._audio.stop(andClearQueue)
    }

    setDictionary(dictionary: IDictionaryPair[]) {
        if(dictionary != null) {
            dictionary.forEach(pair => {
                if(pair.original && pair.substitute) this._dictionary[pair.original] = pair.substitute
            })
        }
    }

    private applyDictionary(text: string):string {
        const words = text.split(' ')
        words.forEach((word, i) => {
            // Ignore these symbols at the start and end of a word
            const symbols = Config.google.symbolsToIgnoreForDictionary
            let wordKey = word.toLowerCase()
            let startSymbol = ''
            let endSymbol = ''
            
            // Math start symbol
            if(symbols.indexOf(wordKey[0]) > -1) {
                startSymbol = wordKey[0]
                wordKey = wordKey.substr(1)
            }

            // Match end symbol
            if(symbols.indexOf(wordKey[wordKey.length-1]) > -1) {
                endSymbol = wordKey[wordKey.length-1]
                wordKey = wordKey.substr(0, wordKey.length-1)
            }
            
            // Actual replacement
            if(this._dictionary.hasOwnProperty(wordKey)) {
                let replaceWith = this._dictionary[wordKey]
                if(replaceWith.indexOf(',') > -1) { // Randomize if we find a list of words
                    replaceWith = Utils.randomFromArray(replaceWith.split(','))
                }
                words[i] = `${startSymbol}${replaceWith}${endSymbol}` // Rebuild with replacement word
            }
        })
        return words.join(' ')
    }

    async enqueueSpeakSentence(
        input: string|string[], 
        userName: string, 
        type: number=0, 
        nonce: string='', 
        meta: any=null, 
        clearRanges: ITwitchEmotePosition[]=[],
        useDictionary: boolean = true
    ) {
        const serial = ++this._count
        this._preloadQueue[serial] = null

        const blacklist = await Settings.pullSetting(Settings.TTS_BLACKLIST, 'userName', userName)
        if(blacklist != null && blacklist.active) return
        if(Array.isArray(input)) input = Utils.randomFromArray<string>(input)
        if(input.trim().length == 0) return this.enqueueEmptyMessageSound(serial)
        if(Utils.matchFirstChar(input, this._config.doNotSpeak)) return // Will not even make empty message sound, so secret!

        const sentence = {text: input, userName: userName, type: type, meta: meta}      
        let url = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${this._config.apiKey}`
        let text = sentence.text
        if(text == null || text.length == 0) {
            this.enqueueEmptyMessageSound(serial)
            console.error("TTS: Sentence text was null or empty")
            return 
        }
        let voice:IUserVoice = await Settings.pullSetting(Settings.TTS_USER_VOICES, 'userName', sentence.userName)
        if(voice == null) {
            voice = await this.getDefaultVoice(sentence.userName)
            Settings.pushSetting(Settings.TTS_USER_VOICES, 'userName', voice)
        }
        
        let cleanName = await Utils.loadCleanName(sentence.userName)
        let cleanText = await Utils.cleanText(text, sentence.type == GoogleTTS.TYPE_CHEER, false, clearRanges, true)
        if(cleanText.length == 0) {
            this.enqueueEmptyMessageSound(serial)
            console.warn("TTS: Clean text had zero length, skipping")
            return
        }
        
        if(useDictionary) cleanText = this.applyDictionary(cleanText)

        if(Date.now() - this._lastEnqueued > this._speakerTimeoutMs) this._lastSpeaker = ''
        switch(sentence.type) {
            case GoogleTTS.TYPE_SAID:
                cleanText = this._lastSpeaker == sentence.userName ? cleanText : `${cleanName} said: ${cleanText}`
                break
            case GoogleTTS.TYPE_ACTION: 
                cleanText = `${cleanName} ${cleanText}`
                break
            case GoogleTTS.TYPE_CHEER:
                let bitText = sentence.meta > 1 ? 'bits' : 'bit'
                cleanText = `${cleanName} cheered ${sentence.meta} ${bitText}: ${cleanText}`
                break
        }
        this._lastSpeaker = sentence.userName

        let textVar:number = ((cleanText.length-150)/500) // 500 is the max length message on Twitch
        return fetch(url, {
            method: 'post',
            body: JSON.stringify({
            input: {
                text: cleanText
            },
            voice: {
                languageCode: voice.languageCode,
                name: voice.voiceName,
                ssmlGender: voice.gender
            },
            audioConfig: {
                audioEncoding: "OGG_OPUS",
                speakingRate: 1.0 + textVar * 0.25, // Should probably make this a curve
                pitch: textVar * 1.0,
                volumeGainDb: 0.0
            },
            enableTimePointing: [
                "TIMEPOINT_TYPE_UNSPECIFIED"
            ]
          })
        }).then((response) => response.json()).then(json => {
            if (typeof json.audioContent != 'undefined' && json.audioContent.length > 0) {
                console.log(`TTS: Successfully got speech: [${json.audioContent.length}]`);
                this._preloadQueue[serial] = {
                    nonce: nonce,
                    src: `data:audio/ogg;base64,${json.audioContent}`
                }
                this._lastEnqueued = Date.now() // TODO: Fix this shit not working now
            } else {
                delete this._preloadQueue[serial]
                this._lastSpeaker = ''
                console.error(`TTS: Failed to generate speech: [${json.status}], ${json.error}`);
                this._callback?.call(this, nonce, AudioPlayer.STATUS_ERROR)
            }
        });
    }

    enqueueSoundEffect(audio: IAudio) {
        const serial = ++this._count
        this._preloadQueue[serial] = audio
    }

    async setVoiceForUser(userName:string, input:string, nonce:string='') {
        await this.loadVoicesAndLanguages() // Fills caches
        let voice = await Settings.pullSetting(Settings.TTS_USER_VOICES, 'userName', userName)
        const defaultVoice = await this.getDefaultVoice(userName)
        if(voice == null) voice = defaultVoice
        
        const inputArr = input.split(' ')
        let error = ''
        inputArr.forEach(setting => {
            setting = setting.toLowerCase()

            // Match gender
            if(setting == 'female' || setting == 'male') {
                voice.voiceName = '' // Gender is not respected if we have a name
                voice.gender = setting
                return
            }
                       
            // Match country code
            if(setting.indexOf('-') > 0 && setting.split('-').length == 2) {
                if(this._languages.find(lang => lang.toLowerCase() == setting)) {
                    voice.voiceName = '' // Language is not respected if we have a name
                    voice.languageCode = setting
                    return 
                } else error = 'messed up a language code'
            }
            
            // Match incoming full voice name
            let re = new RegExp(/([a-z]+)-([a-z]+)-([\w]+)-([a-z])/)
            let matches = setting.match(re)
            if(matches != null) {
                if(this._voices.find(v => v.name.toLowerCase() == matches[0])) {
                    voice.voiceName = matches[0]
                    voice.languageCode = `${matches[1]}-${matches[2]}`
                    return
                } else {
                    console.warn(`Voice not found: ${matches[0]}`)
                    error = 'messed up a voice name'
                }
            }

            // Match reset
            if(setting == 'reset' || setting == 'x') {
                voice = defaultVoice
                return 
            }

            // Randomize among ALL voices
            if(setting == 'random' || setting == '?') {
                const randomVoice = this._voices[Math.floor(Math.random()*this._voices.length)]
                voice = this.buildVoice(userName, randomVoice)
                return
            }
        })
        let success = await Settings.pushSetting(Settings.TTS_USER_VOICES, 'userName', voice)
        console.log(`TTS: Voice saved: ${success}`)
        this.enqueueSpeakSentence(error.length > 0 ? error : 'now sounds like this', userName, GoogleTTS.TYPE_ACTION, nonce)
    }

    private async loadVoicesAndLanguages():Promise<boolean> {
        if(this._voices.length == 0) {
            let url = `https://texttospeech.googleapis.com/v1beta1/voices?key=${this._config.apiKey}`
            return fetch(url).then(response => response?.json()).then(json => {
                console.log("Voices loaded!")
                let voices = json?.voices
                if(voices != null) {
                    voices = voices.filter(voice => voice.name.indexOf('Wavenet') > -1)
                    this._voices = voices
                    this._randomVoices = voices.filter(voice => voice.languageCodes.find(code => code.indexOf(this._config.randomizeVoiceLanguageFilter) == 0))
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

    private async getDefaultVoice(userName:string):Promise<IUserVoice> {
        await this.loadVoicesAndLanguages() // Fills caches
        let defaultVoice = this._voices.find(voice => voice.name.toLowerCase() == this._config.defaultVoice)
        let randomVoice:IGoogleVoice = this._randomVoices.length > 0
            ? this._randomVoices[Math.floor(Math.random()*this._randomVoices.length)]
            : null
        return this._config.randomizeVoice && randomVoice != null
            ? this.buildVoice(userName, randomVoice) 
            : this.buildVoice(userName, defaultVoice)
    }

    private buildVoice(userName: string, voice: IGoogleVoice):IUserVoice {
        return {
            userName: userName,
            languageCode: voice?.languageCodes.shift() ?? 'en-US',
            voiceName: voice?.name ?? '',
            gender: voice?.ssmlGender ?? 'FEMALE'
        }
    }
}