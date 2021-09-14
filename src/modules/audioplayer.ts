class AudioPlayer {
    static get STATUS_OK() { return 0 }
    static get STATUS_ERROR() { return 1 }
    static get STATUS_ABORTED() { return 2 }

    private _audio:HTMLAudioElement = new Audio()
    private _queueLoopHandle:number = 0
    private _queue:IAudio[] = []
    private _isPlaying:boolean = false
    private _currentNonce:string // Actually used but does not reference back through .call()
    private _callback: IAudioPlayedCallback // Actually used but does not reference back through .call()

    constructor() {
        this.startQueueLoop()
        this._audio.addEventListener('error', (evt)=>{
            doCallback.call(this, AudioPlayer.STATUS_ERROR)
        })
        this._audio.addEventListener('ended', (evt)=>{
            doCallback.call(this, AudioPlayer.STATUS_OK)
        })
        this._audio.addEventListener('pause', (evt)=>{
            // doCallback.call(this, AudioPlayer.STATUS_ABORTED) // TODO: Appears to do false negatives
        })
        this._audio.addEventListener('canplaythrough', (evt) => {
            this._audio.play()
        })

        function doCallback(status: number) {
            if(this._callback != null && this._currentNonce != null) this._callback(this._currentNonce, status)
            // console.log(`AudioPlayer: Finished playing audio: ${this._currentNonce}, status: ${status}`)
            this._currentNonce = null
            this._isPlaying = false
        }
    }

    public setPlayedCallback(callback: IAudioPlayedCallback) {
        this._callback = callback
    }

    private startQueueLoop() {
        this._queueLoopHandle = setInterval(this.tryPlayNext.bind(this), 500)
    }

    private tryPlayNext() {
        if(this._isPlaying) return

        const audio = this._queue.shift()
        if(typeof audio == 'undefined') return // The queue is empty

        let src = audio.src
        if(Array.isArray(src)) {
            src = Utils.randomFromArray<string>(src)
        }

        if (audio.src != null) {
            this._isPlaying = true
            this._currentNonce = audio.nonce
            this._audio.volume = audio.volume || 1.0
            this._audio.src = src
        } else {
            console.warn('AudioPlayer: Dequeued audio but had no src value')
        }
    }

    enqueueAudio(audio: IAudio) {
        console.log(`AudioPlayer: Enqueued audio with nonce: ${audio.nonce}`)
        if(audio.repeat != undefined) {
            for(let i=0; i<audio.repeat; i++) this._queue.push(audio)
        } else {
            this._queue.push(audio)
        }
    }

    stop(andClearQueue: boolean = false) {
        this._audio.pause()
        if(andClearQueue) this._queue = []
    }

    deinit() {
        clearInterval(this._queueLoopHandle)
    }
}