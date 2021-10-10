class OBS {
    private _socket: WebSockets
    private _config = Config.obs;
    private _messageCounter: number = 10;
    private _screenshotMessageIds: number[] = []
    constructor() {
        this._socket = new WebSockets(`ws://localhost:${this._config.port}`, 10, false)
        this._socket._onOpen = this.onOpen.bind(this)
        this._socket._onMessage = this.onMessage.bind(this)
    }
    init() {
        this._socket.init()
    }
    private onOpen(evt) {
        this._socket.send(this.buildRequest("GetAuthRequired", 1, {}))
    }
    private onMessage(evt) {
        let data = JSON.parse(evt.data)
		let id = parseInt(data["message-id"])
        let updateType = data['update-type'];

        switch(id) {
			case 1:
                Utils.sha256(this._config.password + data.salt).then(secret => {
                    Utils.sha256(secret + data.challenge).then(authResponse => {
                        this._socket.send(this.buildRequest("Authenticate", 2, {auth: authResponse}));
                    })
                })
				break
			case 2:
				console.log(`OBS auth: ${data.status}`)
				if(data.status != "ok") this._socket.disconnect()
				break
			default: 
                switch(updateType) {
                    case 'SwitchScenes':
                        let sceneName:string = data['scene-name']
                        this._sceneChangeCallback(sceneName)
                        break
                    default:
                        // console.log(evt.data)
                        break
                }
                const ssIndex = this._screenshotMessageIds.indexOf(id)
                if(ssIndex > -1) {
                    this._screenshotMessageIds.splice(ssIndex, 1)
                    this._sourceScreenshotCallback(data.img)
                }
                break
		}
    }

    showSource(config: IObsSourceConfig, ignoreDuration: boolean = false) {
        config.sceneNames.forEach(sceneName => {
            this._socket.send(this.buildRequest("SetSceneItemProperties", ++this._messageCounter, {
                "scene-name": sceneName,
                "item": config.sourceName,
                "visible": true
            }));
            if(config.duration != undefined && !ignoreDuration) {
                setTimeout(() => {
                    this.hideSource(config)
                }, config.duration);
            }
        });
    }

    hideSource(config: IObsSourceConfig) {
        config.sceneNames.forEach(sceneName => {
            this._socket.send(this.buildRequest("SetSceneItemProperties", ++this._messageCounter, {
                "scene-name": sceneName,
                "item": config.sourceName,
                "visible": false
            }));
        });
    }

    toggleSource(config: IObsSourceConfig, visible: boolean) {
        if(visible) this.showSource(config) 
        else this.hideSource(config)
    }

    takeSourceScreenshot() {
        const date = new Date()
        const time = date.toLocaleString("sv-SE").replace(' ', '_').replace(/\:/g, '').replace(/\-/g, '')
        const ms = date.getMilliseconds()
        const id = ++this._messageCounter;
        this._screenshotMessageIds.push(id)
        this._socket.send(this.buildRequest("TakeSourceScreenshot", id, {
            "sourceName": this._config.sourceScreenshotConfig.sourceName,
            "embedPictureFormat": this._config.sourceScreenshotConfig.embedPictureFormat,
            "saveToFilePath": this._config.sourceScreenshotConfig.saveToFilePath+`${time}_${ms}.png`
        }));
    }

    buildRequest(type: string, id: number, options: object) {
        let request = {
            "request-type": type,
            "message-id": `${id}`
        }
        for (const [key, value] of Object.entries(options)) {
            request[key] = value
        }
        return JSON.stringify(request)
    }

    private _sceneChangeCallback: ISceneChangeCallback = (sceneName: string) => { console.log(`OBS: No callback set for scene changes (${sceneName})`) }
    registerSceneChangeCallback(callback:ISceneChangeCallback) {
        this._sceneChangeCallback = callback
    }

    private _sourceScreenshotCallback: ISourceScreenshotCallback = (img: string) => { console.log('OBS: No callback set for source screenshots') }
    registerSourceScreenshotCallback(callback:ISourceScreenshotCallback) {
        this._sourceScreenshotCallback = callback
    }
}