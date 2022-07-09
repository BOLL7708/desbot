class OBS {
    private _socket: WebSockets
    private _config = Config.obs;
    private _messageCounter: number = 10;
    private _screenshotRequests: Map<string, IScreenshotRequestData> = new Map()
    constructor() {
        this._socket = new WebSockets(`ws://localhost:${this._config.port}`, 10, false)
        this._socket._onOpen = this.onOpen.bind(this)
        this._socket._onMessage = this.onMessage.bind(this)
    }
    init() {
        this._socket.init()
    }
    private onOpen(evt: Event) {
        this._socket.send(this.buildRequest("GetAuthRequired", '1', {}))
    }
    private onMessage(evt: MessageEvent) {
        const data = JSON.parse(evt.data)
		const id = data["message-id"]
        const updateType = data['update-type'];
        const error = data['error']

        if(error != undefined) return Utils.log(`OBS Return Message Error: ${error}`, 'red')

        switch(id) {
			case '1':
                Utils.sha256(Config.credentials.OBSPassword + data.salt).then(secret => {
                    Utils.sha256(secret + data.challenge).then(authResponse => {
                        this._socket.send(this.buildRequest("Authenticate", '2', {auth: authResponse}));
                    })
                })
				break
			case '2':
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
                
                if(this._screenshotRequests.has(id)) {
                    const screenshotRequestData = this._screenshotRequests.get(id)
                    const img = data.img
                    if(screenshotRequestData != undefined && img != undefined) {
                        this._sourceScreenshotCallback(img, screenshotRequestData, id)
                    }
                    this._screenshotRequests.delete(id)
                }

                break
		}
    }

    // TODO: Add support for an array of configs to toggle many things at once
    // TODO: Actually retain and return nonces, array for multiple sources?
    show(config: IObsSourceConfig|IObsSourceConfig[]|undefined, ignoreDuration: boolean = false) {
        const configArr = Array.isArray(config) ? config : [config]
        for(const cfg of configArr) {
            if(cfg?.sceneNames != undefined) {
                const group = Config.obs.sourceGroups.find(group => group.includes(cfg.key ?? ''))
                if(group) {
                    for(const k of group) {
                        if(k != cfg.key) {
                            const timeline = Utils.getTimelineFromActions(Utils.getEventConfig(k)?.actions)
                            for(const actions of Object.values(timeline)) {
                                this.hide(actions?.obs)
                            }
                        }
                    }
                }
                cfg.sceneNames.forEach(sceneName => {
                    for(const src of Utils.ensureArray(cfg.sourceName)) {
                        this._socket.send(this.buildRequest("SetSceneItemProperties", Utils.getNonce('OBSShowSource'), {
                            "scene-name": sceneName,
                            "item": src,
                            "visible": true
                        }))
                    }
                })
            } else 
            if(cfg?.filterName != undefined) {
                // If this filter is in a group, hide all the other ones, useful for audio filters that should not overlap.
                const group = Config.obs.filterGroups.find(group => group.includes(cfg.key ?? ''))
                if(group) {
                    for(const k of group) {
                        if(k != cfg.key) {
                            const timeline = Utils.getTimelineFromActions(Utils.getEventConfig(k)?.actions)
                            for(const actions of Object.values(timeline)) {
                                this.hide(actions?.obs)
                            }
                        }
                    }
                }
                for(const src of Utils.ensureArray(cfg.sourceName)) {
                    this._socket.send(this.buildRequest("SetSourceFilterVisibility", Utils.getNonce('OBSShowFilter'), {
                        "sourceName": src,
                        "filterName": cfg.filterName,
                        "filterEnabled": true
                    })) 
                }
            }
            if(cfg?.durationMs != undefined && !ignoreDuration) {
                setTimeout(() => {
                    this.hide(config)
                }, cfg.durationMs)
            }
        }
    }
    hide(config: IObsSourceConfig|IObsSourceConfig[]|undefined) {
        const configArr = Array.isArray(config) ? config : [config]
        for(const cfg of configArr) {
            if(cfg?.sceneNames) {
                cfg.sceneNames.forEach(sceneName => {
                    for(const src of Utils.ensureArray(cfg.sourceName)) {
                        this._socket.send(this.buildRequest("SetSceneItemProperties", Utils.getNonce('OBSHideSource'), {
                            "scene-name": sceneName,
                            "item": src,
                            "visible": false
                        }))
                    }
                })
            } else
            if (cfg?.filterName) {
                for(const src of Utils.ensureArray(cfg.sourceName)) {
                    this._socket.send(this.buildRequest("SetSourceFilterVisibility", Utils.getNonce('OBSHideFilter'), {
                        "sourceName": src,
                        "filterName": cfg.filterName,
                        "filterEnabled": false
                    }))
                }
            }
        }
    }

    toggle(config: IObsSourceConfig, visible: boolean) {
        if(visible) this.show(config) 
        else this.hide(config)
    }

    /**
     * Triggers the screenshot capture of an OBS source
     * @param rewardKey The internal key for the reward
     * @param rewardData Data from the Twitch reward
     * @param sourceName What source in OBS to capture
     * @param delaySeconds Amount of time to delay the capture
     * @returns The message ID that is referenced in the result callback
     */
    takeSourceScreenshot(rewardKey: string, userData: IActionUser, sourceName: string, delaySeconds: number = 0): string {
        const requestData: IScreenshotRequestData = { 
            rewardKey: rewardKey, 
            userId: Utils.toInt(userData.id, -1), 
            userName: userData.login, 
            userInput: userData.input,
        }

        const date = new Date()
        const time = date.toLocaleString("sv-SE").replace(' ', '_').replace(/\:/g, '').replace(/\-/g, '')
        const ms = date.getMilliseconds()
        const id = Utils.getNonce('OBSScreenshot')
        const user = requestData.userName.length > 0 ? `_${requestData.userName}` : ''
        this._screenshotRequests.set(id, requestData)
        setTimeout(async ()=>{
            this._socket.send(
                this.buildRequest("TakeSourceScreenshot", id, {
                    "sourceName": sourceName,
                    "embedPictureFormat": this._config.sourceScreenshotConfig.embedPictureFormat,
                    "saveToFilePath": this._config.sourceScreenshotConfig.saveToFilePath+`${time}_${ms}${user}.${this._config.sourceScreenshotConfig.embedPictureFormat}`
                })
            )
        }, delaySeconds * 1000)
        return id
    }

    buildRequest(type: string, id: string, options: object) {
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