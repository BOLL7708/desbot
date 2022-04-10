class SuperScreenShotterVR {
    private _socket: WebSockets
    private _messageCounter: number = 0
    private _screenshotRequests: IScreenshotRequestData[] = []
    private _messageCallback: ISSSVRCallback = (requestResponse) => { console.warn('Screenshot: unhandled response') }
    constructor() {
        let config:IScreenshotConfig = Config.screenshots
        this._socket = new WebSockets(`ws://localhost:${config.SSSVRPort}`, 10, true)
        this._socket._onMessage = this.onMessage.bind(this)
        this._socket._onError = this.onError.bind(this)
    }
    init() {
        this._socket.init();
    }
    private onMessage(evt: MessageEvent) {
        let data: ISSSVRResponse = JSON.parse(evt.data)
        this._messageCallback(data)
    }
    private onError(evt: Event) {
        // console.table(evt)
    }
    setScreenshotCallback(callback: ISSSVRCallback) {
        this._messageCallback = callback
    }
    sendScreenshotRequest(rewardKey: string, rewardData:ITwitchRedemptionMessage, delaySeconds:number) {
        this._messageCounter++
        let message:ISSSVRRequest = {
            nonce: `${this._messageCounter}`,
            delay: delaySeconds,
            tag: rewardData.redemption.user.login
        }
        this._screenshotRequests[this._messageCounter] = {
            rewardKey: rewardKey,
            userId: parseInt(rewardData?.redemption?.user?.id),
            userName: rewardData.redemption.user.login,
            userInput: rewardData.redemption.user_input
        }
        this._socket.send(JSON.stringify(message))
    }
    getScreenshotRequest(nonce: number):IScreenshotRequestData|undefined {
        return this._screenshotRequests.splice(nonce, 1).pop()
    }
}