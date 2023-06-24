import WebSockets from './WebSockets.js'
import Config from './Config.js'
import {ISSSVRCallback, ISSSVRRequest, ISSSVRResponse} from '../Interfaces/isssvr.js'
import {IScreenshotConfig, IScreenshotRequestData} from '../Interfaces/iscreenshots.js'
import {TKeys} from '../_data/!keys.js'
import ConfigScreenshots from '../Objects/Config/Screenshots.js'
import DataBaseHelper from './DataBaseHelper.js'
import {IActionUser} from '../Objects/Action.js'

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
        const data: ISSSVRResponse = JSON.parse(evt.data)
        const id = parseInt(data?.nonce ?? '')    
        const requestData = this._screenshotRequests.get(id)
        if(data != undefined) {
            this._messageCallback(requestData, data)
            this._screenshotRequests.delete(id)
        }
    }
    private onError(evt: Event) {
        // console.table(evt)
    }
    setScreenshotCallback(callback: ISSSVRCallback) {
        this._messageCallback = callback
    }
    sendScreenshotRequest(rewardKey: TKeys, userData: IActionUser, delaySeconds: number = 0) {
        this._messageCounter++
        this._screenshotRequests.set(this._messageCounter, {
            rewardKey: rewardKey,
            userId: userData.id,
            userName: userData.login,
            userInput: userData.input
        })
        const message:ISSSVRRequest = {
            nonce: `${this._messageCounter}`,
            delay: delaySeconds,
            tag: userData.login
        }
        this._socket?.send(JSON.stringify(message))
    }
}