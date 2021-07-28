class AudioPlayer {
    static get STATUS_OK() { return 0 }
    static get STATUS_ERROR() { return 1 }
    static get STATUS_ABORTED() { return 2 }

    private _audio:HTMLAudioElement = new Audio()
    private _queueLoopHandle:number = 0
    private _queue:IAudio[] = []
    private _isPlaying:boolean = false
    private _currentNonce:string
    private _callback:(nonce:string, status:number)=>void

    constructor() {
        this.startQueueLoop()
        this._audio.addEventListener('error', (evt)=>{
            doCallback.call(this, AudioPlayer.STATUS_ERROR)
        })
        this._audio.addEventListener('ended', (evt)=>{
            doCallback.call(this, AudioPlayer.STATUS_OK)
        })
        this._audio.addEventListener('pause', (evt)=>{
            doCallback.call(this, AudioPlayer.STATUS_ABORTED)
        })
        this._audio.addEventListener('canplaythrough', (evt) => {
            this._audio.play()
        })

        function doCallback(status: number) {
            if(this._callback != null && this._currentNonce != null) this._callback(this._currentNonce, status)
            console.log(`AudioPlayer: Finished playing audio: ${this._currentNonce}, status: ${status}`)
            this._currentNonce = null
            this._isPlaying = false
        }
    }

    public setPlayedCallback(callback:(nonce:string, status:number)=>void) {
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
            src = src[Math.floor(Math.random()*src.length)]
        }

        if (audio.src != null) {
            this._isPlaying = true
            this._currentNonce = audio.nonce
            this._audio.src = src
        } else {
            console.warn('AudioPlayer: Dequeued audio but had no src value')
        }
    }

    enqueueAudio(audio: IAudio) {
        console.log(`AudioPlayer: Enqueued audio with nonce: ${audio.nonce}`)
        this._queue.push(audio)
    }

    stop(andClearQueue: boolean = false) {
        this._audio.pause()
        if(andClearQueue) this._queue = []
    }

    deinit() {
        clearInterval(this._queueLoopHandle)
    }
}