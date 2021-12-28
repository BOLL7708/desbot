class Pipe {
    static get TYPE_OVERRIDE() { return -1 }
    static get TYPE_NOTIFICATION() { return 0 }
    static get TYPE_ALERT() { return 1 }

    private _socket:WebSockets
    private _config:IPipeConfig = Config.pipe
    constructor() {
        this._socket = new WebSockets(`ws://localhost:${this._config.port}`, 10, true)
        this._socket._onMessage = this.onMessage.bind(this)
        this._socket._onError = this.onError.bind(this)
    }
    init() {
        this._socket.init()
    }
    private onMessage(evt) {
        console.log(evt.data)
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

    // Matches the defaults in OpenVRNotificationPipe
    static getEmptyCustomMessage():IPipeCustomMessage { 
        return {
            image: null,
            custom: true,
            properties: {
                headset: false,
                horizontal: true,
                level: false,
                channel: 0,
                hz: -1,
                duration: 1000,
                width: 1,
                distance: 1,
                pitch: 0, 
                yaw: 0
            },
            transitions: [
                {
                    scale: 1,
                    opacity: 0,
                    vertical: 0,
                    distance: 0,
                    horizontal: 0,
                    spin: 0,
                    tween: 0,
                    duration: 100
                },
                {
                    scale: 1,
                    opacity: 0,
                    vertical: 0,
                    distance: 0,
                    horizontal: 0,
                    spin: 0,
                    tween: 0,
                    duration: 100
                }
            ],
            textAreas: []
        }
    }

    // Templates
    async showPreset(preset: IPipeMessagePreset) {
        const imagePath = Array.isArray(preset.imagePath) ? Utils.randomFromArray(preset.imagePath) : preset.imagePath
        switch(preset.type) {
            case Pipe.TYPE_OVERRIDE:
                this.showCustom(imagePath, preset.durationMs, preset.override)
                break;
            case Pipe.TYPE_NOTIFICATION:
                this.showNotificationImage(imagePath, preset.durationMs, preset.top, preset.left)
                break;
            case Pipe.TYPE_ALERT:
                this.showAlertMessage(imagePath, preset.durationMs)
                break;
        }
    }

    async showCustom(imagePath: string, duration: number, override: IPipeCustomMessage) {
        const imageb64:string = await ImageLoader.getBase64(imagePath)
        if(imageb64 != null) {
            if(duration > -1) override.properties.duration = duration;
            override.image = imageb64
            this.sendCustom(override)
        } else {
            console.warn('Pipe: Show Custom, could not find image!')
        }
    }

    async showNotificationImage(imagePath: string, duration: number, top: boolean = false, left: boolean = true) {
        const imageb64:string = await ImageLoader.getBase64(imagePath)
        if(imageb64 != null) {
            const msg = Pipe.getEmptyCustomMessage()
            msg.properties.headset = true
            msg.properties.horizontal = false
            msg.properties.channel = 100
            msg.properties.duration = duration-1000
            msg.properties.width = 0.025
            msg.properties.distance = 0.25
            msg.properties.yaw = 30 * (left ? -1 : 1)
            msg.properties.pitch = 30 * (top ? 1 : -1)
            msg.transitions[0].opacity = msg.transitions[1].opacity = 0,
            msg.transitions[0].duration = msg.transitions[1].duration = 500
            msg.image = imageb64
            this.sendCustom(msg)
        } else {
            console.warn('Pipe: Show Notification Image, could not find image!')
        }
    }
    async showAlertMessage(imagePath: string, duration: number) {
        const imageb64:string = await ImageLoader.getBase64(imagePath)
        if(imageb64 != null) {
            const msg = Pipe.getEmptyCustomMessage()
            msg.properties.channel = 200
            msg.properties.level = true
            msg.properties.duration = duration-800
            msg.properties.width = 2
            msg.properties.distance = 2
            msg.transitions[0].scale = msg.transitions[1].scale = 0
            msg.transitions[0].vertical = 3
            msg.transitions[1].vertical = -3
            msg.transitions[0].tween = 7
            msg.transitions[1].tween = 6
            msg.transitions[0].duration = 300
            msg.transitions[1].duration = 500
            msg.image = imageb64
            this.sendCustom(msg)
        } else {
            console.warn('Pipe: Show Alert Image, could not find image!')
        }
    }
}