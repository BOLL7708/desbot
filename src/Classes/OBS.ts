import WebSockets from './WebSockets.js'
import {IActionUser, IObsAction} from '../Interfaces/iactions.js'
import Utils from '../ClassesStatic/Utils.js'
import Config from '../ClassesStatic/Config.js'
import {IHelloResponse, IRequestResponse, ISceneChangeCallback, ISourceScreenshotCallback} from '../Interfaces/iobs.js'
import {TKeys} from '../_data/!keys.js'
import {IScreenshotRequestData} from '../Interfaces/iscreenshots.js'

export default class OBS {
    private _socket: WebSockets
    private _config = Config.obs
    private _messageCounter: number = 10
    private _screenshotRequests: Map<string, IScreenshotRequestData> = new Map()
    private readonly _supportedRpcVersion: number = 1
    private _requestQueue: Map<string, (data: IRequestResponse) => void> = new Map();

    constructor() {
        this._socket = new WebSockets(`ws://localhost:${this._config.port}`, 10, false)
        this._socket._onOpen = this.onOpen.bind(this)
        this._socket._onMessage = this.onMessage.bind(this)
        this._socket._onClose = evt => {
            if (evt.code == EWebSocketCloseCode.AuthenticationFailed) {
                console.log('OBS auth: failed')
            }
        }
    }

    init() {
        this._socket.init()
    }

    private onOpen(evt: Event) {
        // this._socket.send(this.buildRequest("GetAuthRequired", '1', {}))
    }

    private async onMessage(evt: MessageEvent) {
        const rawData = JSON.parse(evt.data)
        const id = rawData["message-id"]
        const updateType = rawData['update-type']
        const error = rawData['error']

        const opcode: number = rawData["op"]
        const data: any = rawData["d"]

        console.log(rawData)

        if (error != undefined) return Utils.log(`OBS Return Message Error: ${error}`, 'red')

        switch (opcode) {
            case EWebSocketOpCode.Hello:
                let message = data as IHelloResponse
                let response = {
                    op: EWebSocketOpCode.Identify,
                    d: {
                        rpcVersion: this._supportedRpcVersion,
                        authentication: ''
                    }
                }
                if (message.authentication) {
                    let secret = await Utils.sha256(Config.credentials.OBSPassword + message.authentication.salt)
                    response.d.authentication = await Utils.sha256(secret + message.authentication.challenge)
                }
                this._socket.send(JSON.stringify(response))
                break
            case EWebSocketOpCode.Identified:
                if (data.negotiatedRpcVersion != this._supportedRpcVersion) {
                    console.log('OBS auth: incompatible RPC version.')
                    this._socket.disconnect()
                    break
                }
                console.log('OBS auth: connected')
                break
            case EWebSocketOpCode.RequestResponse: {
                let message = data as IRequestResponse

                if (!message.requestStatus.result) {
                    console.error(`[${message.requestStatus.code}] ${message.requestId}: ${message.requestStatus.comment}`)
                }

                if (this._requestQueue.has(message.requestId)) {
                    let responseData = message.responseData
                    let requestData = this._requestQueue.get(message.requestId)
                    this._requestQueue.delete(message.requestId)

                    if (requestData === undefined) {
                        console.log('OBS request response: something went wrong as there wasn\'t a function call.')
                        return
                    }

                    requestData(message)

                    // if (message.requestId.startsWith('OBSHideSource') && message.requestStatus.code == 100) {
                    //     this.setSceneItemEnabled(requestData.sceneName, responseData.sceneItemId, Utils.getNonce('SetSceneItemEnabled'), requestData.sceneItemEnabled)
                    // }
                }
                break
            }
        }

        // switch (id) {
        //     case '1':
        //         Utils.sha256(Config.credentials.OBSPassword + data.salt).then(secret => {
        //             Utils.sha256(secret + data.challenge).then(authResponse => {
        //                 this._socket.send(this.buildRequest("Authenticate", '2', {auth: authResponse}))
        //             })
        //         })
        //         break
        //     case '2':
        //         console.log(`OBS auth: ${data.status}`)
        //         if (data.status != "ok") this._socket.disconnect()
        //         break
        //     default:
        //         switch (updateType) {
        //             case 'SwitchScenes':
        //                 let sceneName: string = data['scene-name']
        //                 this._sceneChangeCallback(sceneName)
        //                 break
        //             default:
        //                 // Uncomment the below row to get all unhandled messages in the console.
        //                 // console.log(evt.data)
        //                 break
        //         }
        //
        //         if (this._screenshotRequests.has(id)) {
        //             const screenshotRequestData = this._screenshotRequests.get(id)
        //             const img = data.img
        //             if (screenshotRequestData != undefined && img != undefined) {
        //                 this._sourceScreenshotCallback(img, screenshotRequestData, id)
        //             }
        //             this._screenshotRequests.delete(id)
        //         }
        //
        //         break
        // }
    }

    show(config: IObsAction | undefined, ignoreDuration: boolean = false) {
        console.log("show")
        if (config?.sceneNames != undefined) { // If we have scenes, it would be sources we toggle.
            const group = Config.obs.sourceGroups.find(group => group.includes(config.key ?? 'Unknown'))
            if (group) { // If this source is in a group, hide all other sources in the group. Useful for sources sharing a single position on screen.
                for (const k of group) {
                    if (k != config.key) {
                        const actionsArr = Utils.ensureArray(Utils.getEventConfig(k)?.actionsEntries)
                        for (const actions of actionsArr) {
                            this.hide(actions?.obs)
                        }
                    }
                }
            }
            for (const sceneName of config.sceneNames) {
                for (const src of Utils.ensureArray(config.sourceName)) {
                    this._socket.send(this.buildRequest("SetSceneItemProperties", Utils.getNonce('OBSShowSource'), {
                        "scene-name": sceneName,
                        "item": src,
                        "visible": true
                    }))
                }
            }
        } else if (config?.filterName != undefined) {
            // If this filter is in a group, hide all the other ones, useful for audio filters that should not overlap.
            const group = Config.obs.filterGroups.find(group => group.includes(config.key ?? 'Unknown'))
            if (group) {
                for (const k of group) {
                    if (k != config.key) {
                        const actionsArr = Utils.ensureArray(Utils.getEventConfig(k)?.actionsEntries)
                        for (const actions of actionsArr) {
                            this.hide(actions?.obs)
                        }
                    }
                }
            }
            for (const src of Utils.ensureArray(config.sourceName)) {
                this._socket.send(this.buildRequest("SetSourceFilterVisibility", Utils.getNonce('OBSShowFilter'), {
                    "sourceName": src,
                    "filterName": config.filterName,
                    "filterEnabled": true
                }))
            }
        }
        if (config?.durationMs != undefined && !ignoreDuration) {
            setTimeout(() => {
                this.hide(config)
            }, config.durationMs)
        }
    }

    hide(config: IObsAction | undefined) {
        if (config?.sceneNames) {
            for (const sceneName of config.sceneNames) {
                for (const src of Utils.ensureArray(config.sourceName)) {
                    let requestId = Utils.getNonce(`OBSHideSource`)
                    this._requestQueue.set(requestId, (data) => {
                        this.setSceneItemEnabled(sceneName, data.responseData.sceneItemId, Utils.getNonce('OBSHideSource'), false)
                    })

                    this.getSceneItemId(sceneName, src, requestId)
                }
            }
        } else if (config?.filterName) {
            for (const src of Utils.ensureArray(config.sourceName)) {
                // this._socket.send(this.buildRequest("SetSourceFilterVisibility", Utils.getNonce('OBSHideFilter'), {
                //     "sourceName": src,
                //     "filterName": config.filterName,
                //     "filterEnabled": false
                // }))
                let requestId = Utils.getNonce(`OBSHideFilter`)
                this.setSourceFilterEnabled(src, config.filterName, requestId, false)
            }
        }
    }

    toggle(config: IObsAction, visible: boolean) {
        if (visible) this.show(config)
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
        setTimeout(async () => {
            this._socket.send(
                this.buildRequest("TakeSourceScreenshot", id, {
                    "sourceName": sourceName,
                    "embedPictureFormat": this._config.sourceScreenshotConfig.embedPictureFormat,
                    "saveToFilePath": this._config.sourceScreenshotConfig.saveToFilePath + `${time}_${ms}${user}.${this._config.sourceScreenshotConfig.embedPictureFormat}`
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

    setSceneItemEnabled(sceneName: string, sceneItemId: number, id: string, sceneItemEnabled: boolean = true) {
        const request = {
            op: EWebSocketOpCode.Request,
            d: {
                requestType: 'SetSceneItemEnabled',
                requestId: id,
                requestData: {
                    sceneName,
                    sceneItemId,
                    sceneItemEnabled
                },
            }
        }
        this._socket.send(JSON.stringify(request))
    }

    setSourceFilterEnabled(sourceName: string, filterName: string, id: string, filterEnabled: boolean = true) {
        const request = {
            op: EWebSocketOpCode.Request,
            d: {
                requestType: 'SetSourceFilterEnabled',
                requestId: id,
                requestData: {
                    sourceName,
                    filterName,
                    filterEnabled
                },
            }
        }
        this._socket.send(JSON.stringify(request))
    }

    getSceneItemId(sceneName: string, sourceName: string, id: string) {
        const request = {
            op: EWebSocketOpCode.Request,
            d: {
                requestType: 'GetSceneItemId',
                requestId: id,
                requestData: {
                    sceneName,
                    sourceName
                },
            }
        }
        this._socket.send(JSON.stringify(request))
    }

    private _sceneChangeCallback: ISceneChangeCallback = (sceneName) => {
        console.log(`OBS: No callback set for scene changes (${sceneName})`)
    }

    registerSceneChangeCallback(callback: ISceneChangeCallback) {
        this._sceneChangeCallback = callback
    }

    private _sourceScreenshotCallback: ISourceScreenshotCallback = (img, requestData) => {
        console.log('OBS: No callback set for source screenshots')
    }

    registerSourceScreenshotCallback(callback: ISourceScreenshotCallback) {
        this._sourceScreenshotCallback = callback
    }
}


export enum EWebSocketOpCode {
    Hello = 0,
    Identify = 1,
    Identified = 2,
    Reidentify = 3,
    Event = 5,
    Request = 6,
    RequestResponse = 7,
    RequestBatch = 8,
    RequestBatchResponse = 9,
}

export enum EWebSocketCloseCode {
    DontClose = 0,
    UnknownReason = 4000,
    MessageDecodeError = 4002,
    MissingDataField = 4003,
    InvalidDataFieldType = 4004,
    InvalidDataFieldValue = 4005,
    UnknownOpCode = 4006,
    NotIdentified = 4007,
    AlreadyIdentified = 4008,
    AuthenticationFailed = 4009,
    UnsupportedRpcVersion = 4010,
    SessionInvalidated = 4011,
    UnsupportedFeature = 4012,
}