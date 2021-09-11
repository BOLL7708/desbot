class OpenVR2WS {
    static get TYPE_WORLDSCALE() { return 1 }

    private _socket: WebSockets
    _currentAppId: string
    
    constructor() {
        const port = Config.instance.openvr2ws.port
        this._socket = new WebSockets(
            `ws://localhost:${port}`,
            10,
            false
        )
        this._socket._onMessage = this.onMessage.bind(this),
        this._socket._onError = this.onError.bind(this)
        this._socket.init();
    }

    private _inputCallback: IOpenVR2WSInputCallback = (key, data) => { 
        // console.warn('OpenVR2WS: Unhandled input message') // This would spam
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
                        console.log(`Application Info: ${data.data.id}`)
                        this._currentAppId = data.data.id
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

    private _settingCounter = 0

    public async setSetting(config: IOpenVR2WSSetting) {
        const password = await Utils.sha256(Config.instance.openvr2ws.password)
        const appId = this._currentAppId.toString()
        switch(config.type) {
            case OpenVR2WS.TYPE_WORLDSCALE:
                this._settingCounter++
                const message = {
                    key: 'RemoteSetting',
                    value: password,
                    value2: appId,
                    value3: 'worldScale',
                    value4: config.value.toString()
                }
                this.sendMessage(message)
                if(config.duration != undefined) {
                    setTimeout(() => {
                        if(--this._settingCounter <= 0) {
                            this._settingCounter = 0
                            message.value4 = (1).toString() // Reset to 100%
                            this.sendMessage(message)
                        }
                    }, config.duration);                    
                }
                break
        }
    }
}