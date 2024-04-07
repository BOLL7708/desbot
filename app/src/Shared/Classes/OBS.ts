import WebSockets from './WebSockets.js'
import ConfigOBS from '../Objects/Config/ConfigOBS.js'
import {IScreenshotRequestData} from '../Interfaces/iscreenshots.js'
import DataBaseHelper from './DataBaseHelper.js'
import Utils from './Utils.js'
import {ActionOBS} from '../Objects/Action/ActionOBS.js'
import ArrayUtils from './ArrayUtils.js'
import {DataUtils} from '../Objects/DataUtils.js'
import {IActionUser} from '../Objects/Action.js'
import {OptionScreenshotFileType} from '../Options/OptionScreenshotFileType.js'

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
        const messageId = data['message-id'] ?? '' // TODO: I have no idea why this has changed.
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
                */

                if(this._screenshotRequests.has(messageId)) {
                    const screenshotRequestData = this._screenshotRequests.get(messageId)
                    const img = data.img
                    if(screenshotRequestData != undefined && img != undefined) {
                        this._sourceScreenshotCallback(img, screenshotRequestData, messageId)
                    }
                    this._screenshotRequests.delete(messageId)
                }
                break
		}
    }

    show(action: ActionOBS, ignoreDuration: boolean = false) {
        if(action.sceneEntries) {
            for(const scene of ArrayUtils.getAsType(DataUtils.ensureDataArray(action.sceneEntries) ?? [], action.sceneEntries_use)) {
                // TODO: Implement
                console.log(`Should switch to specific OBS scene: ${scene?.sceneName}`)
            }
        }
        if(action.sourceEntries) {
            for(const group of ArrayUtils.getAsType(action.sourceEntries, action.sourceEntries_use)) {
                const scene = DataUtils.ensureData(group.scenePreset)
                const source = DataUtils.ensureData(group.sourcePreset)
                if(scene && source) {
                    this._socket?.send(this.buildRequest("SetSceneItemProperties", Utils.getNonce('OBSShowSource'), {
                        "scene-name": scene.sceneName,
                        "item": source.sourceName,
                        "visible": true
                    }))
                }
            }
        }
        if(action.filterEntries) {
            for(const group of ArrayUtils.getAsType(action.filterEntries, action.filterEntries_use)) {
                const source = DataUtils.ensureData(group.sourcePreset)
                const filter = DataUtils.ensureData(group.filterPreset)
                if(source && filter) {
                    this._socket?.send(this.buildRequest("SetSourceFilterVisibility", Utils.getNonce('OBSShowFilter'), {
                        "sourceName": source.sourceName,
                        "filterName": filter.filterName,
                        "filterEnabled": true
                    }))
                }
            }
        }
        if(action.durationMs > 0 && !ignoreDuration) {
            setTimeout(() => {
                this.hide(action)
            }, action.durationMs)
        }
    }
    hide(action: ActionOBS) {
        if(action.sceneEntries) {
            // TODO: Implement? Actually not sure if this should do anything at all, we cannot hide a scene, just switch to a new one.
        }
        if(action.sourceEntries) {
            for(const group of ArrayUtils.getAsType(action.sourceEntries, action.sourceEntries_use)) {
                const scene = DataUtils.ensureData(group.scenePreset)
                const source = DataUtils.ensureData(group.sourcePreset)
                if(scene && source) {
                    this._socket?.send(this.buildRequest("SetSceneItemProperties", Utils.getNonce('OBSShowSource'), {
                        "scene-name": scene.sceneName,
                        "item": source.sourceName,
                        "visible": false
                    }))
                }
            }
        }
        if(action.filterEntries) {
            for(const group of ArrayUtils.getAsType(action.filterEntries, action.filterEntries_use)) {
                const source = DataUtils.ensureData(group.sourcePreset)
                const filter = DataUtils.ensureData(group.filterPreset)
                if(source && filter) {
                    this._socket?.send(this.buildRequest("SetSourceFilterVisibility", Utils.getNonce('OBSShowFilter'), {
                        "sourceName": source.sourceName,
                        "filterName": filter.filterName,
                        "filterEnabled": false
                    }))
                }
            }
        }
    }

    toggle(config: ActionOBS, visible: boolean) {
        if(visible) this.show(config) 
        else this.hide(config)
    }

    /**
     * Triggers the screenshot capture of an OBS source
     * @param eventKey The key for the event that triggered the screenshot
     * @param userData Data from the Twitch reward
     * @param sourceName What source in OBS to capture
     * @param delaySeconds Amount of time to delay the capture
     * @returns The message ID that is referenced in the result callback
     */
    takeSourceScreenshot(eventKey: string, userData: IActionUser, sourceName: string, delaySeconds: number = 0): string {
        const requestData: IScreenshotRequestData = { 
            eventKey: eventKey,
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
                    "embedPictureFormat": OptionScreenshotFileType.PNG,
                    "saveToFilePath": Utils.ensureTrailingSlash(this._config.saveScreenshotsToFilePath)+`${time}_${ms}${user}.${OptionScreenshotFileType.PNG}`
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

// Callbacks
export interface ISceneChangeCallback {
    (sceneName: string): void
}
export interface ISourceScreenshotCallback {
    (img: string, data: IScreenshotRequestData, nonce: string): void
}