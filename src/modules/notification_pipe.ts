class NotificationPipe {
    private _socket:WebSockets
    constructor() {
        let config = Config.instance.pipe;
        this._socket = new WebSockets(`ws://localhost:${config.port}`, 10, true);
        this._socket._onMessage = this.onMessage.bind(this);
        this._socket.init();
    }
    private onMessage(evt) {
        console.log(evt.data);
    }
    sendBasic(title: string, message:string) {
        this._socket.send(JSON.stringify({
            title: title,
            message: message
        }))
    }
    sendCustom() {
        // TODO: Implement
    }
}