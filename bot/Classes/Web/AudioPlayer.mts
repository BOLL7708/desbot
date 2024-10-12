import Utils from '../../Utils/Utils.mts'
import ActionAudio from '../Objects/Data/Action/ActionAudio.mts'
import DataUtils from '../Objects/Data/DataUtils.mts'
import PresetAudioChannel from '../Objects/Data/Preset/PresetAudioChannel.mts'

export default class AudioPlayer {
    static get STATUS_OK() { return 0 }
    static get STATUS_ERROR() { return 1 }
    static get STATUS_ABORTED() { return 2 }
    private _mainCallback: IAudioPlayedCallback = (nonce, status)=>{ console.log(`AudioPlayer: Played callback not set, ${nonce}->${status}`) } // Actually used but does not reference back through .call()
    public setMainPlayedCallback(callback: IAudioPlayedCallback) {
        this._mainCallback = callback
    }
    private _pool: Map<number, AudioPlayerInstance> = new Map()

    enqueueAudio(audio: ActionAudio|undefined) {
        if(audio) {
            const channelPreset = DataUtils.ensureData<PresetAudioChannel>(audio.channel)
            const channel = channelPreset?.channel ?? 0
            if(!this._pool.has(channel)) {
                const player = new AudioPlayerInstance()
                this._pool.set(channel, player)
                player.setPlayedCallback(this.runMainPlayedCallback.bind(this))
            }
            this._pool.get(channel)?.enqueueAudio(audio)
        }
    }

    stop(channel: number, andClearQueue: boolean = false) {
        const player = this._pool.get(channel)
        player?.stop(andClearQueue)
    }

    private runMainPlayedCallback(nonce: string, status: number) {
        this._mainCallback(nonce, status)
    }
}

export class AudioPlayerInstance {
    private readonly _queueLoopHandle: number = 0
    private _audio?: HTMLAudioElement
    private _queue: ActionAudio[] = []
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
            this._audio?.play().then()
        })

        function doCallback(self: AudioPlayerInstance, status: number) {
            // console.log(`Audio Player: Finished playing audio: ${self._currentNonce}, status: ${status}`)
            if(self._callback != null && self._currentNonce != null) self._callback(self._currentNonce, status)
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

        let src = Utils.ensureValue(audio.srcEntries)
        if (src) {
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

    enqueueAudio(audio: ActionAudio|undefined) {
        if(audio) {
            console.log(`AudioPlayer: Enqueued audio with nonce: ${audio.nonce}`)
            const clone = Utils.clone(audio)
            for(const src of Utils.ensureArray(audio.srcEntries)) {
                clone.srcEntries = [src]
                if(audio.repeat != undefined) {
                    for(let i=0; i<audio.repeat; i++) this._queue.push(clone)
                } else {
                    this._queue.push(clone)
                }
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

export interface IAudioPlayedCallback {
    (nonce: string, status: number): void
}