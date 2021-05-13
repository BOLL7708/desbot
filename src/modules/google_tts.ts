class GoogleTTS {
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
        this._speakIntervalHandle = setInterval(this.trySpeakNext.bind(this), 1000)
    }

    enqueueSpeakSentence(sentence:string, userName: string):void {
        this._sentenceQueue.push({text: sentence, userName: userName})
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

        let cleanText = this.cleanText(text)
 
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

    async loadCleanName(userName:string):Promise<string> {
        let cleanNameSetting:IUserName = await Settings.pullSetting(Settings.USER_NAMES, 'userName', userName)
        let cleanName = cleanNameSetting?.shortName
        if(cleanName == null) {
            cleanName = this.cleanName(userName)
            cleanNameSetting = {userName: userName, shortName: cleanName}
            Settings.pushSetting(Settings.USER_NAMES, 'userName', cleanNameSetting)
        }
        return cleanName
    }

    private cleanName(name:string):string {
        let nameArr = name.toLowerCase().split('_') // Split on _
        let namePart = nameArr.reduce((a, b) => a.length > b.length ? a : b) // Reduce to longest word
        namePart = namePart.replace(/[0-9]{2,}/g, '') // Replace big number groups (len: 2+)
        let numToChar:any = {
            0: 'o',
            1: 'i',
            3: 'e',
            4: 'a',
            5: 's',
            6: 'g',
            7: 't'
        }
        var re = new RegExp(Object.keys(numToChar).join("|"),"gi");
        let result = namePart.replace(re, function(matched){ // Replace leet speak with chars
            return numToChar[matched];
        });
        return result.length > 0 ? result : name // If name ended up empty, return original
    }

    private cleanText(text:string):string {
        text = text.toLowerCase()
        let matches = text.match(/(\D)\1{2,}/g) // 2+ len group of non-digits https://stackoverflow.com/a/6306113
        matches.forEach(match => text = text.replace(match, match.slice(0,2))) // Limit to 2 chars
        return text
            .replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') // Links: https://stackoverflow.com/a/23571059/2076423
            .replace(/[^\p{L}\p{N}\p{P}\p{Z}{\^\$}]/gu, ''); // Emojis: https://stackoverflow.com/a/63464318/2076423
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
        let cleanName = await this.loadCleanName(userName)
        this.enqueueSpeakSentence(`${cleanName} now sounds like this.`, userName)        
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