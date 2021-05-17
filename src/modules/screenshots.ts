class Screenshots {
    private _socket:WebSockets
    private _messageCounter = 0
    constructor() {
        let config:IScreenshotConfig = Config.instance.screenshots
        this._socket = new WebSockets(`ws://localhost:${config.port}`, 10, true)
        this._socket._onMessage = this.onMessage.bind(this)
        this._socket._onError = this.onError.bind(this)
        this._socket.init();
    }
    private onMessage(evt) {
        console.log(evt.data);
    }
    private onError(evt) {
        // console.table(evt)
    }
    sendScreenshotRequest(userName:string, delaySeconds:number) {
        this._messageCounter++
        let message:IScreenshotRequest = {
            nonce: this._messageCounter,
            delaySeconds: delaySeconds,
            userName: userName
        }
        this._socket.send(JSON.stringify(message))
    }
}