class AudioPlayer {
    static get STATUS_OK() { return 0 }
    static get STATUS_ERROR() { return 1 }
    static get STATUS_ABORTED() { return 2 }

    private _audio?: HTMLAudioElement
    private _queueLoopHandle: number = 0
    private _queue: IAudio[] = []
    private _isPlaying: boolean = false
    private _currentNonce?: string // Actually used but does not reference back through .call()
    private _callback: IAudioPlayedCallback = (nonce, status)=>{ console.log(`AudioPlayer: Played callback not set, ${nonce}->${status}`) } // Actually used but does not reference back through .call()

    constructor() {
        this._queueLoopHandle = setInterval(this.tryPlayNext.bind(this), 250)
        this.initAudio()
    }

    private initAudio() {
        this._isPlaying = false
        this._currentNonce = undefined
        if(this._audio != null) {
            this._audio.pause()
            delete this._audio
        }
        this._audio = new Audio()
        this._audio.volume = 1.0
        this._audio.addEventListener('error', (evt)=>{
            doCallback(this, AudioPlayer.STATUS_ERROR)
        })
        this._audio.addEventListener('ended', (evt)=>{
            doCallback(this, AudioPlayer.STATUS_OK)
        })
        this._audio.addEventListener('pause', (evt)=>{
            // doCallback.call(this, AudioPlayer.STATUS_ABORTED) // TODO: Appears to do false negatives
        })
        this._audio.addEventListener('canplaythrough', (evt) => {
            this._audio?.play()
        })

        function doCallback(self: AudioPlayer, status: number) {
            if(self._callback != null && self._currentNonce != null) self._callback(self._currentNonce, status)
            // console.log(`AudioPlayer: Finished playing audio: ${this._currentNonce}, status: ${status}`)
            self._currentNonce = undefined
            self._isPlaying = false
        }
    }

    public setPlayedCallback(callback: IAudioPlayedCallback) {
        this._callback = callback
    }

    private tryPlayNext() {
        if(this._isPlaying) return

        const audio = this._queue.shift()
        if(audio == undefined) return // The queue is empty

        let src = audio.src
        if(Array.isArray(src)) {
            src = Utils.randomFromArray<string>(src)
        }

        if (audio.src != null) {
            this._isPlaying = true
            this._currentNonce = audio.nonce
            if(this._audio) {
                this._audio.volume = audio.volume || 1.0
                this._audio.src = src
            }
        } else {
            console.warn('AudioPlayer: Dequeued audio but had no src value')
        }
    }

    enqueueAudio(audio: IAudio|undefined) {
        if(audio) {
            console.log(`AudioPlayer: Enqueued audio with nonce: ${audio.nonce}`)
            if(audio.repeat != undefined) {
                for(let i=0; i<audio.repeat; i++) this._queue.push(audio)
            } else {
                this._queue.push(audio)
            }
        }
    }

    stop(andClearQueue: boolean = false) {
        this.initAudio()
        if(andClearQueue) this._queue = []
    }

    deinit() {
        clearInterval(this._queueLoopHandle)
    }
}