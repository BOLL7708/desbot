class GoogleTTS {
    static get TYPE_SAID() { return 0 } // [name] said: [text]
    static get TYPE_ACTION() { return 1 } // [name] [text]
    static get TYPE_ANNOUNCEMENT() { return 2 } // [text]

    // TODO: Split this up into a TTS master class, and separate voice integrations.
    private _apiKey:String = Config.instance.google.apiKey
    private _sentenceQueue:ISentence[] = []
    private _speakIntervalHandle: number
    private _audio:HTMLAudioElement
    private _voices:IGoogleVoice[] = [] // Cache
    private _languages:string[] = [] // Cache

    constructor() {
        this.startSpeakLoop()
        this._audio = new Audio()
    }

    private startSpeakLoop() {
        this._speakIntervalHandle = setInterval(this.trySpeakNext.bind(this), 500)
    }

    enqueueSpeakSentence(sentence:string, userName: string, type:number=0):void {
        this._sentenceQueue.push({text: sentence, userName: userName, type: type})
        console.log(`Enqueued sentence: ${this._sentenceQueue.length}`)
    }

    private async trySpeakNext() {
        if(!this._audio.paused) return
        let sentence = this._sentenceQueue.shift()
        if(typeof sentence == 'undefined') return
        
        let url = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${this._apiKey}`
        let text = sentence.text
        if(text == null) return

        let voice:IUserVoice = await Settings.pullSetting(Settings.USER_VOICES, 'userName', sentence.userName)
        if(voice == null) voice = this.getDefaultVoice(sentence.userName)

        // TODO: Change it so sentence contains variable for various templates for the name, "said" or "/me" or "none"
        // TODO: Skip saying who said it if it's the last as the previous person.
        let cleanName = await Utils.loadCleanName(sentence.userName)
        let cleanText = Utils.cleanText(text)
        switch(sentence.type) {
            case GoogleTTS.TYPE_SAID:
                cleanText = `${cleanName} said: ${cleanText}`
            break;
            case GoogleTTS.TYPE_ACTION: 
                cleanText = `${cleanName} ${cleanText}`
            break;
        }
 
        console.log(text)
        let textVar:number = ((cleanText.length-150)/500) // 500 is the max length message on Twitch
        fetch(url, {
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
                pitch: textVar * 2,
                volumeGainDb: 0.0
            },
            enableTimePointing: [
                "TIMEPOINT_TYPE_UNSPECIFIED"
            ]
          })
        }).then((response) => response.json()).then(json => {
            if (typeof json.audioContent != 'undefined') {
                console.log(`Successfully got speech: [${json.audioContent.length}]`);
                this._audio.src = `data:audio/ogg;base64,${json.audioContent}`;
                this._audio.play();
            } else {
                console.error(`Failed to generate speech: [${json.status}], ${json.error}`);
            }
        });
    }

    async setVoiceForUser(userName:string, input:string) {
        await this.loadVoicesAndLanguages() // Fills member caches
        let voice = await Settings.pullSetting(Settings.USER_VOICES, 'userName', userName)
        if(voice == null) voice = this.getDefaultVoice(userName)
        
        let inputArr = input.split(' ')
        inputArr.forEach(setting => {
            // Match gender
            if(setting.toLowerCase() == 'female') voice.gender = 'FEMALE'
            if(setting.toLowerCase() == 'male') voice.gender = 'MALE'
            
            // Match pitch value (currently not used but still registered)
            let num = parseFloat(setting)
            if(!isNaN(num)) voice.pitch = (num > 20) ? 20 : ((num < -20) ? -20 : num)
            
            // Match country code
            if(setting[2] == '-' && setting.length == 5 && this._languages.includes(setting.toLowerCase())) voice.languageCode = setting
            
            // Match incoming full voice name
            let re = new RegExp(/([a-z]+)-([A-Z]+)-([\w]+)-([A-Z])/)
            let matches = setting.match(re)
            if(matches != null) {
                if(this._voices.find(v => v.name.toLowerCase() == matches[0].toLowerCase())) {
                    voice.voiceName = matches[0]
                    voice.languageCode = `${matches[1]}-${matches[2]}`
                } else console.warn(`Voice not found: ${matches[0]}`)
            }

            // Match reset
            if(setting.toLowerCase() == 'reset') voice = this.getDefaultVoice(userName)
        })
        let success = await Settings.pushSetting(Settings.USER_VOICES, 'userName', voice)
        console.log(`Voice saved: ${success}`)
        this.enqueueSpeakSentence('now sounds like this', userName, GoogleTTS.TYPE_ACTION)
    }

    private async loadVoicesAndLanguages():Promise<boolean> {
        if(this._voices.length == 0) {
            let url = `https://texttospeech.googleapis.com/v1beta1/voices?key=${this._apiKey}`
            return fetch(url).then(response => response?.json()).then(json => {
                console.log("Voices loaded!")
                let voices = json?.voices
                if(voices != null) {
                    voices = voices.filter(voice => voice.name.indexOf('Wavenet') >= 0)
                    this._voices = voices
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

    private getDefaultVoice(userName:string):IUserVoice {
        return {
            userName: userName,
            languageCode: 'en-US',
            voiceName: '',
            pitch: 0.0,
            gender: 'FEMALE'
        }
    }
}