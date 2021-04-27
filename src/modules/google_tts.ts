class GoogleTTS {
    private _apiKey:String = Config.instance.google.apiKey
    private _sentenceQueue:ISentence[] = []
    private _speakIntervalHandle: number;
    private _audio:HTMLAudioElement;
    constructor() {
        this.startSpeakLoop()
        this._audio = new Audio();
    }

    private startSpeakLoop() {
        this._speakIntervalHandle = setInterval(this.trySpeakNext.bind(this), 1000)
    }

    enqueueSpeakSentence(sentence:string, userName: string, userId: number):void {
        this._sentenceQueue.push({text: sentence, userName: userName, userId: userId});       
        console.log(`Enqueued sentence: ${this._sentenceQueue.length}`)
    }

    private trySpeakNext() {
        if(!this._audio.paused) return
        let sentence = this._sentenceQueue.shift()
        if(typeof sentence == 'undefined') return
        
        // TODO: Check stored voice settings for user ID and use those voice settings in the request
        // TODO: Check stored name settings for user ID and use that when generating the string
        let url = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${this._apiKey}`       
        fetch(url, {
        method: 'post',
        body: JSON.stringify({
            input: {
                text: `${sentence.userName} said: ${sentence.text}`
            },
            voice: {
                languageCode: "en-US",
                ssmlGender: "FEMALE"
            },
            audioConfig: {
                audioEncoding: "OGG_OPUS",
                speakingRate: 1.0,
                pitch: 0.0,
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
}