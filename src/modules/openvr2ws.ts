class OpenVR2WS {
    static get TYPE_WORLDSCALE() { return 1 }

    private _socket: WebSockets
    private _resetLoopHandle: number = 0
    private _resetMessages: Record<number, IOpenVRWSCommandMessage> = {}
    private _resetTimers: Record<number, number> = {}
    _currentAppId: string // Updated every time an ID is received
    _lastAppId: string // Updated only when a new valid ID is received
    
    constructor() {
        const port = Config.instance.openvr2ws.port
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

    private _appIdCallback: IOpenVR2WSAppIdCallback = (appId) => {
        // console.log(`Game ID callback: ${appId}`)
    }
    setAppIdCallback(callback: IOpenVR2WSAppIdCallback) {
        this._appIdCallback = callback
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
        const password = await Utils.sha256(Config.instance.openvr2ws.password)
        const appId = this._currentAppId.toString()
        switch(config.type) {
            case OpenVR2WS.TYPE_WORLDSCALE:
                const message:IOpenVRWSCommandMessage = {
                    key: 'RemoteSetting',
                    value: password,
                    value2: appId,
                    value3: 'worldScale',
                    value4: config.value.toString()
                }
                this.sendMessage(message)
                message.value4 = (1).toString() // Reset to 100%
                const duration = config.duration ?? -1
                this._resetTimers[config.type] = duration
                this._resetMessages[config.type] = duration > 0 ? message : undefined
                break
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