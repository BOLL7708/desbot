class Pipe {
    private _socket:WebSockets
    private _config:IPipeConfig = Config.instance.pipe
    constructor() {
        this._socket = new WebSockets(`ws://localhost:${this._config.port}`, 10, true)
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

    setOverlayTitle(title: string) {
        this._socket.send(JSON.stringify({
            title: title,
            message: "Initializing Notification Pipe for Streaming Widget"
        }))
    }
    
    sendBasic(displayName: string, message:string, image:string=null, hasBits:boolean=false, clearRanges:ITwitchEmotePosition[]=[]) {
        if(Utils.matchFirstChar(message, this._config.doNotShow)) return
        Utils.cleanText(message, hasBits, true, clearRanges, false).then(cleanText => {
            if(cleanText.length == 0) return console.warn("Pipe: Clean text had zero length, skipping")
            const text = displayName.length > 0 ? `${displayName}: ${cleanText}` : cleanText
            if(image != null) {
                this._socket.send(JSON.stringify({
                    title: "",
                    message: text,
                    image: image
                }))
            } else {
                this._socket.send(JSON.stringify({
                    title: "",
                    message: text,
                }))
            }
        })
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

    // Templates
    async showNotificationImage(imagePath: string, duration: number, top: boolean = false, left: boolean = true) {
        const imageb64:string = await ImageLoader.getBase64(imagePath)
        if(imageb64 != null) {
            let msg = Pipe.getEmptyCustomMessage()
            msg.properties.headset = true
            msg.properties.horizontal = false
            msg.properties.channel = 1
            msg.properties.duration = duration-1000
            msg.properties.width = 0.025
            msg.properties.distance = 0.25
            msg.properties.yaw = 30 * (left ? -1 : 1)
            msg.properties.pitch = 30 * (top ? 1 : -1)
            msg.transition.opacity = msg.transition2.opacity = 0,
            msg.transition.duration = msg.transition2.duration = 500
            msg.image = imageb64
            this.sendCustom(msg)
        } else {
            console.warn('Pipe: Show Notification Image, could not find image!')
        }
    }
}