class Pipe {
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

    async showPreset(preset: IPipeMessagePreset) {
        // If path exists, load image, in all cases output base64 image data
        let imageb64: string = null
        if(preset.imagePath != undefined) {
            const imagePath = Array.isArray(preset.imagePath) ? Utils.randomFromArray(preset.imagePath) : preset.imagePath
            imageb64 = await ImageLoader.getDataUrl(imagePath)
        } else if (preset.imageData != undefined) {
            imageb64 = preset.imageData
        } else {
            console.warn("Pipe: No image path nor image data found for preset")
        }
        
        // If the above resulted in image data, broadcast it
        const config = Object.assign({}, preset.config)
        if(imageb64 != null) {
            config.image = Utils.removeImageHeader(imageb64)
            config.properties.hz = -1
            config.properties.duration = preset.durationMs;
            if(preset.texts != undefined && preset.texts.length >= config.textAreas.length) {
                for(let i=0; i<preset.texts.length; i++) {
                    config.textAreas[i].text = preset.texts[i]
                }
            }
            this.sendCustom(config)
        } else {
            console.warn('Pipe: Show Custom, could not find image!')
        }
    }
}