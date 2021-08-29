class OpenVR2WS {
    private _socket: WebSockets
    private _isConnected: boolean = false
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
                default:
                    // console.log(data)
                    break
            }
        }
    }
    private onError(evt: any) {
        console.error(evt)
    }
}