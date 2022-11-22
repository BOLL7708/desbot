import WebSockets from './WebSockets.js'
import {IActionUser, IObsAction} from '../Interfaces/iactions.js'
import Utils from '../ClassesStatic/Utils.js'
import Config from '../ClassesStatic/Config.js'
import {
    IEvent,
    IHelloResponse,
    IRequestResponse,
    ISceneChangeCallback,
    ISourceScreenshotCallback
} from '../Interfaces/iobs.js'
import {TKeys} from '../_data/!keys.js'
import {IScreenshotRequestData} from '../Interfaces/iscreenshots.js'

// API Reference: https://github.com/obsproject/obs-websocket/blob/master/docs/generated/protocol.md

export default class OBS {
    private _socket: WebSockets
    private _config = Config.obs
    private _messageCounter: number = 10
    private _screenshotRequests: Map<string, IScreenshotRequestData> = new Map()
    private readonly _supportedRpcVersion: number = 1
    private _requestQueue: Map<string, (data: IRequestResponse) => void> = new Map()
    private _sceneItems: Map<string, number> = new Map()
    private _activeScene?: string

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

    }

    private async onMessage(evt: MessageEvent) {
        const rawData = JSON.parse(evt.data)
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
                    this._requestQueue.delete(message.requestId)
                }

                let requestCallback = this._requestQueue.get(message.requestId)
                if (requestCallback) {
                    this._requestQueue.delete(message.requestId)

                    requestCallback(message)
                }
                break
            }
            case EWebSocketOpCode.Event: {
                let message = data as IEvent

                switch (message.eventType) {
                    case 'SceneItemCreated': {
                        let eventData = message.eventData as {
                            sceneName: string
                            sourceName: string
                            sceneItemId: number
                            sceneItemIndex: number
                        }

                        this._sceneItems.set(eventData.sourceName, eventData.sceneItemId)
                        break
                    }
                    case 'SceneItemRemoved': {
                        let eventData = message.eventData as {
                            sceneName: string
                            sourceName: string
                            sceneItemId: number
                        }

                        this._sceneItems.delete(eventData.sourceName)
                        break
                    }
                    case 'CurrentProgramSceneChanged': {
                        let eventData = message.eventData as {
                            sceneName: string
                        }

                        this._activeScene = eventData.sceneName
                        this._sceneItems.clear()
                        let sceneItems = await this.getSceneItemList(eventData.sceneName)
                        for (let sceneItem of sceneItems) {
                            this._sceneItems.set(sceneItem.sourceName, sceneItem.sceneItemId)
                        }
                        this._sceneChangeCallback(eventData.sceneName)
                    }
                }
                break
            }
        }
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
                    this.setSceneItemEnabled(sceneName, src);
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
                let requestId = Utils.getNonce(`OBSShowFilter`)
                this.setSourceFilterEnabled(src, config.filterName, requestId)
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
                    this.setSceneItemEnabled(sceneName, src, false);
                }
            }
        } else if (config?.filterName) {
            for (const src of Utils.ensureArray(config.sourceName)) {
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

        this._requestQueue.set(id, (data) => {
            const img = data.responseData.imageData
            if (img != undefined) {
                this._sourceScreenshotCallback(img, requestData, id)
            }
        })

        //TODO: Find a way to only take one screenshot

        setTimeout(async () => {
            this.getSourceScreenshot(sourceName, this._config.sourceScreenshotConfig.embedPictureFormat, id)

            if (this._config.sourceScreenshotConfig.saveToFilePath) {
                this.saveSourceScreenshot(sourceName, this._config.sourceScreenshotConfig.embedPictureFormat, this._config.sourceScreenshotConfig.saveToFilePath + `${time}_${ms}${user}.${this._config.sourceScreenshotConfig.embedPictureFormat}`, id)
            }
        }, delaySeconds * 1000)
        return id
    }

    setSceneItemEnabled(sceneName: string, sourceName: string, enabled: boolean = true) {
        let requestId = Utils.getNonce(`OBSHideSource`)

        this.getSceneItemId(sceneName, sourceName).then(sceneItemId => {
            this._setSceneItemEnabled(sceneName, sceneItemId, requestId, enabled)
        })
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

    getSceneItemId(sceneName: string, sourceName: string) { //TODO: Possibly cache all scenes items to avoid calls when using nested scenes.
        return new Promise<number>((resolve, reject) => {
            if (sceneName == this._activeScene && this._sceneItems.has(sourceName)) {
                resolve(this._sceneItems.get(sourceName)!!)
                return
            }

            let requestId = Utils.getNonce(`GetSceneItemId`)

            this._requestQueue.set(requestId, (data) => {
                if (data.responseData.sceneItemId) resolve(data.responseData.sceneItemId)
                else reject('Specified scene item could not be found.')
            })

            const request = {
                op: EWebSocketOpCode.Request,
                d: {
                    requestType: 'GetSceneItemId',
                    requestId: requestId,
                    requestData: {
                        sceneName,
                        sourceName
                    },
                }
            }
            this.send(request)
        })
    }

    /**
     * Saves a screenshot of a source to the filesystem.
     * @param sourceName Name of the source to take a screenshot of
     * @param imageFormat Image compression format to use
     * @param imageFilePath Path to save the screenshot file to
     * @param requestId The ID used to identify the related response
     * @param imageWidth Width to scale the screenshot to (>= 8, <= 4096)
     * @param imageHeight Height to scale the screenshot to (>= 8, <= 4096)
     * @param imageCompressionQuality Compression quality to use. 0 for high compression, 100 for uncompressed (>= -1, <= 100)
     */
    saveSourceScreenshot(sourceName: string, imageFormat: string, imageFilePath: string, requestId: string, imageWidth?: number, imageHeight?: number, imageCompressionQuality: number = -1) {
        const request = {
            op: EWebSocketOpCode.Request,
            d: {
                requestType: 'SaveSourceScreenshot',
                requestId,
                requestData: {
                    sourceName,
                    imageFormat,
                    imageFilePath,
                    imageWidth,
                    imageHeight,
                    imageCompressionQuality,
                },
            }
        }
        this.send(request)
    }

    /**
     * Saves a screenshot of a source to the filesystem.
     * @param sourceName Name of the source to take a screenshot of
     * @param imageFormat Image compression format to use
     * @param requestId The ID used to identify the related response
     * @param imageWidth Width to scale the screenshot to (>= 8, <= 4096)
     * @param imageHeight Height to scale the screenshot to (>= 8, <= 4096)
     * @param imageCompressionQuality Compression quality to use. 0 for high compression, 100 for uncompressed (>= -1, <= 100)
     */
    getSourceScreenshot(sourceName: string, imageFormat: string, requestId: string, imageWidth?: number, imageHeight?: number, imageCompressionQuality: number = -1) {
        const request = {
            op: EWebSocketOpCode.Request,
            d: {
                requestType: 'GetSourceScreenshot',
                requestId,
                requestData: {
                    sourceName,
                    imageFormat,
                    imageWidth,
                    imageHeight,
                    imageCompressionQuality,
                },
            }
        }
        this.send(request)
    }

    getSceneItemList(sceneName: string) {
        return new Promise<Array<{
            sceneName: string
            sourceName: string
            sceneItemId: number
            sceneItemIndex: number
        }>>((resolve) => {
            let requestId = Utils.getNonce(`GetSceneItemList`)
            this._requestQueue.set(requestId, (data) => {
                resolve(data.responseData.sceneItems)
            })

            const request = {
                op: EWebSocketOpCode.Request,
                d: {
                    requestType: 'GetSceneItemList',
                    requestId: requestId,
                    requestData: {
                        sceneName,
                    },
                }
            }
            this.send(request)
        })
    }

    private _setSceneItemEnabled(sceneName: string, sceneItemId: number, id: string, sceneItemEnabled: boolean = true) {
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

    private send(data: object) {
        console.log(data)
        this.sendRaw(JSON.stringify(data))
    }

    private sendRaw(message: string) {
        this._socket.send(message)
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