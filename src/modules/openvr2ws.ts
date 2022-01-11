class OpenVR2WS {
    static get TYPE_WORLDSCALE() { return 1 }
    static get TYPE_BRIGHTNESS() { return 2 }
    static get TYPE_REFRESHRATE() { return 3 }
    static get TYPE_VRVIEWEYE() { return 4 }

    private _socket: WebSockets
    private _resetLoopHandle: number = 0
    private _resetMessages: Record<number, IOpenVRWSCommandMessage> = {}
    private _resetTimers: Record<number, number> = {}
    _currentAppId: string // Updated every time an ID is received
    _lastAppId: string // Updated only when a new valid ID is received
    
    constructor() {
        const port = Config.openvr2ws.port
        this._socket = new WebSockets(
            `ws://localhost:${port}`,
            10,
            false
        )
        this._socket._onMessage = this.onMessage.bind(this),
        this._socket._onError = this.onError.bind(this)
    }

    init() { // Init function as we want to set the callbacks before the first messages arrive.
        this._socket.init();

        this._resetTimers[OpenVR2WS.TYPE_WORLDSCALE] = 0
        this.startResetLoop()
    }

    private startResetLoop() {
        this._resetLoopHandle = setInterval(this.resetSettings.bind(this), 1000)
    }

    private _appIdCallback: IOpenVR2WSAppIdCallback = (appId) => {}
    setAppIdCallback(callback: IOpenVR2WSAppIdCallback) {
        callback.call(undefined) // To disable game specific rewards
        this._appIdCallback = callback
    }
    triggerAppIdCallback(appId: string) {
        this._appIdCallback(appId)
    }

    private _inputCallback: IOpenVR2WSInputCallback = (key, data) => { 
        // console.warn('OpenVR2WS: Unhandled input message')
    }
    setInputCallback(callback: IOpenVR2WSInputCallback) {
        this._inputCallback = callback
    }

    public sendMessage(message: IOpenVRWSCommandMessage) {
        this._socket.send(JSON.stringify(message));
    }

    private onMessage(evt: MessageEvent) {
        let data:IOpenVR2WSMessage = null
        try {
            data = JSON.parse(evt?.data)
        } catch(err) {
            console.error(err.message)
        }
        if(data != null) {
            switch(data.key) {
                case 'ApplicationInfo':
                    if(data.data.hasOwnProperty('id')) {
                        this._currentAppId = data.data.id
                        if(this._currentAppId.length > 0 && this._currentAppId != this._lastAppId) {
                            this._lastAppId = this._currentAppId
                            this._appIdCallback(this._lastAppId)
                        }
                    }
                    break
                case 'Input':
                    const inputData:IOpenVR2WSInputData = data.data
                    this._inputCallback(data.key, inputData)
                    break
                case 'RemoteSetting':
                    const success = data.data.success
                    if(!success) console.warn(data)
                    break
                default:
                    // console.log(data)
                    break
            }
        }
    }

    private onError(evt: any) {
        console.error(evt)
    }

    public async setSetting(config: IOpenVR2WSSetting) {
        const password = await Utils.sha256(Config.credentials.OpenVR2WSPassword)
        const appId = this._currentAppId.toString()
        const message :IOpenVRWSCommandMessage = {
            key: 'RemoteSetting',
            value: password,
            value2: 'steamvr',
            value3: '',
            value4: ''
        }
        const duration = config.duration ?? -1
        switch(config.type) {
            case OpenVR2WS.TYPE_WORLDSCALE:
                message.value2 = appId
                message.value3 = 'worldScale'
                message.value4 = config.value.toString()
                this.sendMessage(message)
                message.value4 = (1).toString() // Reset to 100%
                this._resetTimers[config.type] = duration
                this._resetMessages[config.type] = duration > 0 ? message : undefined
                break
            case OpenVR2WS.TYPE_BRIGHTNESS:
                message.value3 = 'analogGain'
                message.value4 = config.value.toString()
                this.sendMessage(message)
                message.value4 = (1.30).toString() // Reset to 130%
                this._resetTimers[config.type] = duration
                this._resetMessages[config.type] = duration > 0 ? message : undefined
                break
            case OpenVR2WS.TYPE_REFRESHRATE:
                message.value3 = 'preferredRefreshRate'
                message.value4 = config.value.toString()
                this.sendMessage(message)
                message.value4 = (120).toString() // Reset to 120 Hz
                this._resetTimers[config.type] = duration
                this._resetMessages[config.type] = duration > 0 ? message : undefined
                break;
            case OpenVR2WS.TYPE_VRVIEWEYE:
                message.value3 = 'mirrorViewEye'
                message.value4 = config.value.toString()
                this.sendMessage(message)
                break;
        }
    }

    public resetSettings() {
        this._resetTimers[OpenVR2WS.TYPE_WORLDSCALE]--
        if(this._resetTimers[OpenVR2WS.TYPE_WORLDSCALE] == 0) {
            const message = this._resetMessages[OpenVR2WS.TYPE_WORLDSCALE]
            if(message != undefined) this.sendMessage(message)
            // TODO: Also trigger some callback so we can play a sound effect?
        }
    }
}