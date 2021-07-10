class Pipe {
    private _socket:WebSockets
    constructor() {
        let config:IPipeConfig = Config.instance.pipe
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
    
    sendBasic(title: string, message:string, image?:string) {
        if(image != null) {
            this._socket.send(JSON.stringify({
                title: title,
                message: message,
                image: image
            }))
        } else {
            this._socket.send(JSON.stringify({
                title: title,
                message: message,
            }))
        }
    }

    sendCustom(message:IPipeCustomMessage) {
        this._socket.send(JSON.stringify(message))
    }

    static getEmptyCustomMessage():IPipeCustomMessage {
        return {
            image: null,
            custom: true,
            properties: {
                headset: false,
                horizontal: true,
                channel: 0,
                hz: -1,
                duration: 1000,
                width: 1,
                distance: 1,
                pitch: 0, 
                yaw: 0
            },
            transition: {
                scale: 1,
                opacity: 0,
                vertical: 0,
                distance: 0,
                horizontal: 0,
                spin: 0,
                tween: 0,
                duration: 100
            },
            transition2: {
                scale: 1,
                opacity: 0,
                vertical: 0,
                distance: 0,
                horizontal: 0,
                spin: 0,
                tween: 0,
                duration: 100
            }
        }
    }
}