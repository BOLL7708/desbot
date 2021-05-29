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
                        
            }
        }
    }
    private onError(evt: any) {
        console.error(evt)
    }
}