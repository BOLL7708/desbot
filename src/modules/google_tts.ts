class GoogleTTS {
    private _apiKey:String = Config.instance.google.apiKey
    private _sentenceQueue:ISentence[] = []
    private _speakIntervalHandle: number
    private _audio:HTMLAudioElement
    private _voices:IGoogleVoice[] = [] // Cache

    constructor() {
        this.startSpeakLoop()
        this._audio = new Audio()
    }

    private startSpeakLoop() {
        this._speakIntervalHandle = setInterval(this.trySpeakNext.bind(this), 1000)
    }

    enqueueSpeakSentence(sentence:string, userName: string, userId: number):void {
        this._sentenceQueue.push({text: sentence, userName: userName, userId: userId})
        console.log(`Enqueued sentence: ${this._sentenceQueue.length}`)
    }

    private async trySpeakNext() {

        if(!this._audio.paused) return
        let sentence = this._sentenceQueue.shift()
        if(typeof sentence == 'undefined') return
        
        let url = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${this._apiKey}`
        let cleanName = sentence.userName != null ? await this.loadCleanName(sentence.userId, sentence.userName) : null
        let text = cleanName != null ? `${cleanName} said: ${sentence.text}` : sentence.text

        let voice:IUserVoice = await Settings.pullSetting(Settings.USER_VOICES, 'userId', sentence.userId)
        if(voice == null) voice = this.getDefaultVoice(sentence.userId)

        console.log(text)
        fetch(url, {
            method: 'post',
            body: JSON.stringify({
            input: {
                text: text
            },
            voice: {
                languageCode: voice.languageCode,
                name: voice.voiceName,
                ssmlGender: voice.gender
            },
            audioConfig: {
                audioEncoding: "OGG_OPUS",
                speakingRate: 1.0,
                pitch: voice.pitch,
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

    private async loadCleanName(id:number, name:string):Promise<string> {
        let cleanNameSetting:IUserName = await Settings.pullSetting(Settings.USER_NAMES, 'id', id)
        let cleanName = cleanNameSetting?.short
        if(cleanName == null) {
            cleanName = this.cleanName(name)
            cleanNameSetting = {id: id, name: name, short: cleanName}
            Settings.pushSetting(Settings.USER_NAMES, 'id', cleanNameSetting)
        }
        return cleanName
    }

    private cleanName(name:string):string {
        let nameArr = name.toLowerCase().split('_')
        let namePart = nameArr.reduce((a, b) => a.length > b.length ? a : b)
        namePart = namePart.replace(/[0-9]{2,}/g, '')
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
        let result = namePart.replace(re, function(matched){
            return numToChar[matched];
        });
        return result.length > 0 ? result : name
    }

    async setVoiceForUser(userId:number, userName:string, input:string) {
        let voices = await this.loadVoices()
        let voice = await Settings.pullSetting(Settings.USER_VOICES, 'userId', userId)
        if(voice == null) voice = this.getDefaultVoice(userId)
        
        let inputArr = input.split(' ')
        inputArr.forEach(setting => {
            // Match gender
            if(setting.toLowerCase() == 'female') voice.gender = 'FEMALE'
            if(setting.toLowerCase() == 'male') voice.gender = 'MALE'
            
            // Match pitch value
            let num = parseFloat(setting)
            if(!isNaN(num)) voice.pitch = (num > 20) ? 20 : ((num < -20) ? -20 : num)
            
            // Match country code
            if(setting[2] == '-' && setting.length == 5) voice.languageCode = setting
            
            // Match incoming full voice name
            let re = new RegExp(/([a-z]+)-([A-Z]+)-([\w]+)-([A-Z])/)
            let matches = setting.match(re)
            if(matches != null) {
                if(voices.find(v => v.name.toLowerCase() == matches[0].toLowerCase())) {
                    voice.voiceName = matches[0]
                    voice.languageCode = `${matches[1]}-${matches[2]}`
                } else console.warn(`Voice not found: ${matches[0]}`)
            }

            // Match reset
            if(setting.toLowerCase() == 'reset') voice = this.getDefaultVoice(userId)
        })
        let success = await Settings.pushSetting(Settings.USER_VOICES, 'userId', voice)
        console.log(`Voice saved: ${success}`)
        this.enqueueSpeakSentence(`${this.cleanName(userName)} now sounds like this.`, null, userId)        
    }

    private async loadVoices():Promise<IGoogleVoice[]> {
        if(this._voices.length == 0) {
            let url = `https://texttospeech.googleapis.com/v1beta1/voices?key=${this._apiKey}`
            return fetch(url).then(response => response?.json()).then(json => {
                let voices = json?.voices
                if(voices != null) this._voices = voices
                return voices
            })
        } else return this._voices
    }

    private getDefaultVoice(id:number):IUserVoice {
        return {
            userId: id,
            languageCode: 'en-US',
            voiceName: '',
            pitch: 0.0,
            gender: 'FEMALE'
        }
    }
}