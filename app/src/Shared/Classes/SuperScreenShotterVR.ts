import WebSockets from './WebSockets.js'
import {IScreenshotRequestData} from '../Objects/Data/Action/ActionScreenshot.js'
import ConfigScreenshots from '../Objects/Data/Config/ConfigScreenshots.js'
import DataBaseHelper from '../Helpers/DataBaseHelper.js'
import {IActionUser} from '../Objects/Data/Action/AbstractAction.js'

export default class SuperScreenShotterVR {
    private _socket?: WebSockets
    private _messageCounter: number = 0
    private _screenshotRequests: Map<number, IScreenshotRequestData> = new Map()
    private _messageCallback: ISSSVRCallback = (requestResponse) => { console.warn('Screenshot: unhandled response') }
    private _config = new ConfigScreenshots()
    constructor() {}
    async init() {
        this._config = await DataBaseHelper.loadMain(new ConfigScreenshots())
        this._socket = new WebSockets(`ws://localhost:${this._config.SSSVRPort}`, 10, true)
        this._socket._onMessage = this.onMessage.bind(this)
        this._socket._onError = this.onError.bind(this)
        this._socket.init();
    }
    private onMessage(evt: MessageEvent) {
        let data: ISSSVRResponse
        try {
            data = JSON.parse(evt.data)
        } catch (e) {
            console.warn('SSSVR: Failed to parse response', evt.data, e)
            return
        }
        const id = parseInt(data?.Nonce ?? '')
        const requestData = this._screenshotRequests.get(id)
        if(data != undefined) {
            if(data.Error) {
                console.error('SSSVR: Screenshot request failed', data.Nonce, data.Message, data.Error)
            } else {
                this._messageCallback(requestData, data)
                this._screenshotRequests.delete(id)
            }
        }
    }
    private onError(evt: Event) {
        // console.table(evt)
    }
    isConnected() {
        return this._socket?.isConnected() ?? false
    }
    setScreenshotCallback(callback: ISSSVRCallback) {
        this._messageCallback = callback
    }
    sendScreenshotRequest(eventKey: string, userData: IActionUser, delaySeconds: number = 0) {
        this._messageCounter++
        this._screenshotRequests.set(this._messageCounter, {
            eventKey: eventKey,
            userId: userData.id,
            userName: userData.login,
            userInput: userData.input
        })
        const message:ISSSVRRequest = {
            Nonce: `${this._messageCounter}`,
            Delay: delaySeconds,
            Tag: userData.login
        }
        this._socket?.send(JSON.stringify(message))
    }
}

// SuperScreenShotterVR
export interface ISSSVRRequest {
    Nonce: string
    Tag: string
    Delay: number
}
export interface ISSSVRResponse {
    Nonce: string
    Image: string
    Width: number
    Height: number
    Message: string
    Error: string
}

// Callbacks
export interface ISSSVRCallback {
    (screenshotRequest: IScreenshotRequestData|undefined, screenshotResponse: ISSSVRResponse): void
}