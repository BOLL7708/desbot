class OBS {
    private _socket: WebSockets
    private _config = Config.obs;
    private _messageCounter: number = 10;
    private _screenshotRequests: IScreenshotRequestData[] = []
    constructor() {
        this._socket = new WebSockets(`ws://localhost:${this._config.port}`, 10, false)
        this._socket._onOpen = this.onOpen.bind(this)
        this._socket._onMessage = this.onMessage.bind(this)
    }
    init() {
        this._socket.init()
    }
    private onOpen(evt: Event) {
        this._socket.send(this.buildRequest("GetAuthRequired", 1, {}))
    }
    private onMessage(evt: MessageEvent) {
        const data = JSON.parse(evt.data)
		const id = parseInt(data["message-id"])
        const updateType = data['update-type'];
        const error = data['error']

        if(error != undefined) return Utils.log(`OBS Return Message Error: ${error}`, 'red')

        switch(id) {
			case 1:
                Utils.sha256(Config.credentials.OBSPassword + data.salt).then(secret => {
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
                        // Uncomment the below row to get all unhandled messages in the console.
                        // console.log(evt.data)
                        break
                }
                const screenshotRequestData = this._screenshotRequests[id]
                const img = data.img
                if(screenshotRequestData != undefined && img != undefined) {
                    this._sourceScreenshotCallback(img, screenshotRequestData)
                }
                break
		}
    }

    // TODO: Add support for an array of configs to toggle many things at once
    show(config: IObsSourceConfig, ignoreDuration: boolean = false) {
        if(config.sceneNames != undefined) {
            const group = Config.obs.sourceGroups.find(group => group.includes(config.key ?? ''))
            if(group) {
                for(const k of group) {
                    if(k != config.key) this.hide(Config.obs.configs[k])
                }
            }
            config.sceneNames.forEach(sceneName => {
                this._socket.send(this.buildRequest("SetSceneItemProperties", ++this._messageCounter, {
                    "scene-name": sceneName,
                    "item": config.sourceName,
                    "visible": true
                }))
            })
        } else 
        if(config.filterName != undefined) {
            const group = Config.obs.filterGroups.find(group => group.includes(config.key ?? ''))
            if(group) {
                for(const k of group) {
                    if(k != config.key) this.hide(Config.obs.configs[k])
                }
            }
            this._socket.send(this.buildRequest("SetSourceFilterVisibility", ++this._messageCounter, {
                "sourceName": config.sourceName,
                "filterName": config.filterName,
                "filterEnabled": true
            })) 
        }
        if(config.durationMs != undefined && !ignoreDuration) {
            setTimeout(() => {
                this.hide(config)
            }, config.durationMs)
        }
    }
    hide(config: IObsSourceConfig) {
        if(config.sceneNames != undefined) {
            config.sceneNames.forEach(sceneName => {
                this._socket.send(this.buildRequest("SetSceneItemProperties", ++this._messageCounter, {
                    "scene-name": sceneName,
                    "item": config.sourceName,
                    "visible": false
                }));
            });
        } else
        if (config.filterName != undefined) {
            this._socket.send(this.buildRequest("SetSourceFilterVisibility", ++this._messageCounter, {
                "sourceName": config.sourceName,
                "filterName": config.filterName,
                "filterEnabled": false
            }));            
        }
    }

    toggle(config: IObsSourceConfig, visible: boolean) {
        if(visible) this.show(config) 
        else this.hide(config)
    }

    takeSourceScreenshot(requestData:IScreenshotRequestData) {
        const date = new Date()
        const time = date.toLocaleString("sv-SE").replace(' ', '_').replace(/\:/g, '').replace(/\-/g, '')
        const ms = date.getMilliseconds()
        const id = ++this._messageCounter;
        const user = requestData.userName.length > 0 ? `_${requestData.userName}` : ''
        this._screenshotRequests[id] = requestData
        this._socket.send(this.buildRequest("TakeSourceScreenshot", id, {
            "sourceName": this._config.sourceScreenshotConfig.sourceName,
            "embedPictureFormat": this._config.sourceScreenshotConfig.embedPictureFormat,
            "saveToFilePath": this._config.sourceScreenshotConfig.saveToFilePath+`${time}_${ms}${user}.${this._config.sourceScreenshotConfig.embedPictureFormat}`
        }));
    }

    buildRequest(type: string, id: number, options: object) {
        const request: { [x: string]: string } = {
            "request-type": type,
            "message-id": `${id}`
        }
        for (const [key, value] of Object.entries(options)) {
            request[key] = value
        }
        return JSON.stringify(request)
    }

    private _sceneChangeCallback: ISceneChangeCallback = (sceneName) => { console.log(`OBS: No callback set for scene changes (${sceneName})`) }
    registerSceneChangeCallback(callback:ISceneChangeCallback) {
        this._sceneChangeCallback = callback
    }

    private _sourceScreenshotCallback: ISourceScreenshotCallback = (img, requestData) => { console.log('OBS: No callback set for source screenshots') }
    registerSourceScreenshotCallback(callback:ISourceScreenshotCallback) {
        this._sourceScreenshotCallback = callback
    }
}