import WebSockets from './WebSockets.js'
import {IActionUser, IObsAction} from '../Interfaces/iactions.js'
import Utils from './Utils.js'
import {ISceneChangeCallback, ISourceScreenshotCallback} from '../Interfaces/iobs.js'
import {TKeys} from '../_data/!keys.js'
import {IScreenshotRequestData} from '../Interfaces/iscreenshots.js'
import ConfigOBS from '../Objects/Config/OBS.js'
import DataBaseHelper from './DataBaseHelper.js'
import {EnumScreenshotFileType} from '../Enums/EnumScreenshotFileType.js'

export default class OBS {
    private _socket?: WebSockets
    private _config = new ConfigOBS()
    private _messageCounter: number = 10
    private _screenshotRequests: Map<string, IScreenshotRequestData> = new Map()
    constructor() {

    }
    async init() {
        this._config = await DataBaseHelper.loadMain(new ConfigOBS())
        this._socket = new WebSockets(`ws://localhost:${this._config.port}`, 10, false)
        this._socket._onOpen = this.onOpen.bind(this)
        this._socket._onMessage = this.onMessage.bind(this)
        this._socket.init()
    }
    private onOpen(evt: Event) {
        // this._socket?.send(this.buildRequest("GetAuthRequired", '1', {}))
    }
    private async onMessage(evt: MessageEvent) {
        const data = JSON.parse(evt.data)
		const op = data['op'] as number
        const d = data['d']
        // const updateType = data['update-type'];
        const error = data['error']

        if(error != undefined) return Utils.log(`OBS Return Message Error: ${error}`, 'red')

        switch(op) {
			case 0: {
                const opData = d as IObsOp0
                let authResponse: IObsOp<IObsOp1> = { op: 1, d: {
                        rpcVersion: opData.rpcVersion,
                        eventSubscriptions: 33
                    }
                }
                if(opData.authentication) {
                    const base64secret = await Utils.sha256(this._config.password+opData.authentication.salt)
                    const authentication = await Utils.sha256(base64secret + opData.authentication.challenge)
                    authResponse.d.authentication = authentication
                }
                this._socket?.send(JSON.stringify(authResponse))
				break
            }
			case 2: {
                const opData = d as IObsOp2
				console.log(`OBS auth RPC version: ${opData.negotiatedRpcVersion}`)
				if(opData.negotiatedRpcVersion <= 0) this._socket?.disconnect()
				break
            }
			default:
                /*
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
                
                if(this._screenshotRequests.has(op)) {
                    const screenshotRequestData = this._screenshotRequests.get(op)
                    const img = data.img
                    if(screenshotRequestData != undefined && img != undefined) {
                        this._sourceScreenshotCallback(img, screenshotRequestData, op)
                    }
                    this._screenshotRequests.delete(op)
                }
                */
                break
		}
    }

    show(config: IObsAction|undefined, ignoreDuration: boolean = false) {
        if(config?.sceneNames != undefined) { // If we have scenes, it would be sources we toggle.
            // TODO: Make this work with the keys for events, not the old keys.
            const group = Object.values(this._config.sourceEventGroups).find(group => group.members.includes(config.key ?? 'Unknown'))
            if(group) { // If this source is in a group, hide all other sources in the group. Useful for sources sharing a single position on screen.
                for(const k of group.members) {
                    if(k != config.key) {
                        const actionsArr = Utils.ensureArray(Utils.getEventConfig(k as TKeys)?.actionsEntries)
                        for(const actions of actionsArr) {
                            this.hide(actions?.obs)
                        }
                    }
                }
            }
            for(const sceneName of config.sceneNames) {
                for(const src of Utils.ensureArray(config.sourceName)) {
                    this._socket?.send(this.buildRequest("SetSceneItemProperties", Utils.getNonce('OBSShowSource'), {
                        "scene-name": sceneName,
                        "item": src,
                        "visible": true
                    }))
                }
            }
        } else if(config?.filterName != undefined) {
            // If this filter is in a group, hide all the other ones, useful for audio filters that should not overlap.
            // TODO: Make this work with the keys for events, not the old keys.
            const group = Object.values(this._config.filterEventGroups).find(group => group.members.includes(config.key ?? 'Unknown'))
            if(group) {
                for(const k of group.members) {
                    if(k != config.key) {
                        const actionsArr = Utils.ensureArray(Utils.getEventConfig(k as TKeys)?.actionsEntries)
                        for(const actions of actionsArr) {
                            this.hide(actions?.obs)
                        }
                    }
                }
            }
            for(const src of Utils.ensureArray(config.sourceName)) {
                this._socket?.send(this.buildRequest("SetSourceFilterVisibility", Utils.getNonce('OBSShowFilter'), {
                    "sourceName": src,
                    "filterName": config.filterName,
                    "filterEnabled": true
                }))
            }
        }
        if(config?.durationMs != undefined && !ignoreDuration) {
            setTimeout(() => {
                this.hide(config)
            }, config.durationMs)
        }
    }
    hide(config: IObsAction|undefined) {
        if(config?.sceneNames) {
            for(const sceneName of config.sceneNames) {
                for(const src of Utils.ensureArray(config.sourceName)) {
                    this._socket?.send(this.buildRequest("SetSceneItemProperties", Utils.getNonce('OBSHideSource'), {
                        "scene-name": sceneName,
                        "item": src,
                        "visible": false
                    }))
                }
            }
        } else if (config?.filterName) {
            for(const src of Utils.ensureArray(config.sourceName)) {
                this._socket?.send(this.buildRequest("SetSourceFilterVisibility", Utils.getNonce('OBSHideFilter'), {
                    "sourceName": src,
                    "filterName": config.filterName,
                    "filterEnabled": false
                }))
            }
        }
    }

    toggle(config: IObsAction, visible: boolean) {
        if(visible) this.show(config) 
        else this.hide(config)
    }

    /**
     * Triggers the screenshot capture of an OBS source
     * @param rewardKey The internal key for the reward
     * @param userData Data from the Twitch reward
     * @param sourceName What source in OBS to capture
     * @param delaySeconds Amount of time to delay the capture
     * @returns The message ID that is referenced in the result callback
     */
    takeSourceScreenshot(rewardKey: TKeys, userData: IActionUser, sourceName: string, delaySeconds: number = 0): string {
        const requestData: IScreenshotRequestData = { 
            rewardKey: rewardKey, 
            userId: userData.id,
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
            this._socket?.send(
                this.buildRequest("TakeSourceScreenshot", id, {
                    "sourceName": sourceName,
                    "embedPictureFormat": EnumScreenshotFileType.PNG,
                    "saveToFilePath": Utils.ensureTrailingSlash(this._config.saveScreenshotsToFilePath)+`${time}_${ms}${user}.${EnumScreenshotFileType.PNG}`
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

interface IObsOp<T> {
    op: number
    d: T
}

interface IObsOp0 {
    authentication?: {
        challenge: string
        salt: string
    }
    obsWebSocketVersion: string
    rpcVersion: number
}
interface IObsOp1 {
    rpcVersion: number
    authentication?: string
    eventSubscriptions: number
}
interface IObsOp2 {
    negotiatedRpcVersion: number
}