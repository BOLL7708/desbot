import {
    IOpenVR2WSAppIdCallback,
    IOpenVR2WSFindOverlayCallback,
    IOpenVR2WSFindOverlayData,
    IOpenVR2WSGenericResponseData,
    IOpenVR2WSInputCallback,
    IOpenVR2WSInputData,
    IOpenVR2WSInputPoseCallback,
    IOpenVR2WSInputPoseResponseData,
    IOpenVR2WSMessage,
    IOpenVR2WSMoveSpace,
    IOpenVR2WSSetting,
    IOpenVR2WSStatusCallback,
    IOpenVRWSCommandMessage
} from '../Interfaces/iopenvr2ws.js'
import Config from './Config.js'
import Color from './ColorConstants.js'
import WebSockets from './WebSockets.js'
import Utils from './Utils.js'
import DataBaseHelper from './DataBaseHelper.js'
import {ConfigOpenVR2WS} from './ConfigObjects.js'

export default class OpenVR2WS {
    static get SETTING_WORLD_SCALE() { return '|worldScale|1' }
    static get SETTING_ANALOG_GAIN() { return 'steamvr|analogGain|1.30' }
    static get SETTING_PREFERRED_REFRESH_RATE() { return 'steamvr|preferredRefreshRate|120' }
    static get SETTING_MIRROR_VIEW_EYE() { return 'steamvr|mirrorViewEye|4' }
    static get SETTING_LEFT_THUMBSTICK_ROTATION_KNUCKLES() { return 'input|leftThumbstickRotation_knuckles|0' }
    static get SETTING_RIGHT_THUMBSTICK_ROTATION_KNUCKLES() { return 'input|rightThumbstickRotation_knuckles|0' }
    static get SETTING_HMD_DISPLAY_COLOR_GAIN_R() { return 'steamvr|hmdDisplayColorGainR|1.0' }
    static get SETTING_HMD_DISPLAY_COLOR_GAIN_G() { return 'steamvr|hmdDisplayColorGainG|1.0' }
    static get SETTING_HMD_DISPLAY_COLOR_GAIN_B() { return 'steamvr|hmdDisplayColorGainB|1.0' }

    static get OVERLAY_LIV_MENU_BUTTON() { return 'VIVR_OVERLAY_MAIN_MENU_BUTTON' }

    private _socket: WebSockets|undefined = undefined
    private _resetLoopHandle: number = 0
    private _resetSettingMessages: Map<string, IOpenVRWSCommandMessage> = new Map()
    private _resetSettingTimers: Map<string, number> = new Map()
    private _currentAppId?: string // Updated every time an ID is received
    public isConnected: boolean = false
    
    constructor() {}

    async init() { // Init function as we want to set the callbacks before the first messages arrive.
        const config = await DataBaseHelper.loadMain(new ConfigOpenVR2WS())
        this._socket = new WebSockets(
            `ws://localhost:${config.port}`,
            10,
            false
        )
        this._socket._onMessage = this.onMessage.bind(this)
        this._socket._onOpen = this.onOpen.bind(this)
        this._socket._onClose = this.onClose.bind(this)
        this._socket._onError = this.onError.bind(this)
        this._socket.init()
        this.startResetLoop()
    }

    private startResetLoop() {
        this._resetLoopHandle = setInterval(this.resetSettings.bind(this), 1000)
    }

    private _statusCallback: IOpenVR2WSStatusCallback = (status) => {}
    setStatusCallback(callback: IOpenVR2WSStatusCallback) {
        this._statusCallback = callback
    }

    private _appIdCallback: IOpenVR2WSAppIdCallback = (appId) => {}
    setAppIdCallback(callback: IOpenVR2WSAppIdCallback) {
        this._appIdCallback = callback
    }

    private _findOverlayCallback: IOpenVR2WSFindOverlayCallback = (overlayTag, overlayHandle) => {}
    setFindOverlayCallback(callback: IOpenVR2WSFindOverlayCallback) {
        this._findOverlayCallback = callback
    }
    
    private _inputCallback: IOpenVR2WSInputCallback = (key, data) => { 
        // console.warn('OpenVR2WS: Unhandled input message')
    }
    setInputCallback(callback: IOpenVR2WSInputCallback) {
        this._inputCallback = callback
    }

    private _inputPoseCallback: IOpenVR2WSInputPoseCallback = (pose) => { console.log(pose) }
    setInputPoseCallback(callback: IOpenVR2WSInputPoseCallback) {
        this._inputPoseCallback = callback
    }

    public sendMessage(message: IOpenVRWSCommandMessage) {
        // console.log(JSON.stringify(message))
        this._socket?.send(JSON.stringify(message));
    }
    public sendMessageWithPromise<T>(message: IOpenVRWSCommandMessage): Promise<T|undefined>|undefined {
        return this._socket?.sendMessageWithPromise<T>(
            JSON.stringify(message), message.nonce ?? '', 1000
        )
    }

    private onMessage(evt: MessageEvent) {
        let data: IOpenVR2WSMessage|undefined = undefined
        try {
            data = JSON.parse(evt?.data)
        } catch(err) {
            console.error(err)
        }
        if(data != undefined) {
            switch(data.key) {
                case 'ApplicationInfo':
                    if(data.data?.hasOwnProperty('id') ?? '') {
                        this._currentAppId = <string> data.data.id
                        if(this._currentAppId.length > 0) this._appIdCallback(this._currentAppId)
                    }
                    break
                case 'Input':
                    const inputData: IOpenVR2WSInputData = data.data
                    this._inputCallback(data.key, inputData)
                    break
                case 'RemoteSetting':
                    const remoteSettingData: IOpenVR2WSGenericResponseData = data.data
                    if(!remoteSettingData?.success) Utils.log(`OpenVR2WS: ${data.key} failed with ${remoteSettingData?.message}`, Color.DarkRed)
                    break
                case 'FindOverlay':
                    const overlayResult: IOpenVR2WSFindOverlayData = data.data
                    this._findOverlayCallback(overlayResult.key, overlayResult.handle)
                    break
                case 'MoveSpace':
                    const moveSpaceData: IOpenVR2WSGenericResponseData = data.data
                    if(!moveSpaceData?.success) {
                        Utils.log(`OpenVR2WS: ${data.key} failed with: ${moveSpaceData?.message}`, Color.DarkRed)
                    }
                    break
                case 'InputPose':
                    const inputPose: IOpenVR2WSInputPoseResponseData = data.data
                    if(data.nonce) {
                        this._socket?.resolvePromise(data.nonce, inputPose)
                    } else {
                        this._inputPoseCallback(inputPose)
                    }
                default:
                    // console.log(data)
                    break
            }
        }
    }

    private onOpen(evt: any) {
        if(this._statusCallback && !this.isConnected) {
            this.isConnected = true
            this._statusCallback(true)
        }
    }
    private onClose(evt: any) {
        if(this._statusCallback && this.isConnected) {
            this.isConnected = false
            this._statusCallback(false)
        }
    }

    private onError(evt: any) {
        console.error(evt)
        this._statusCallback(false)
    }

    public async setSetting(config: IOpenVR2WSSetting) {
        const password = await Utils.sha256(Config.credentials.OpenVR2WSPassword)
        const settingArr: string[] = config.setting.split('|') ?? []
        if(settingArr.length != 3) return Utils.log(`OpenVR2WS: Malformed setting, did not split into 3 on '|': ${config.setting}`, Color.Red)
        if(settingArr[0].length == 0) settingArr[0] = this._currentAppId?.toString() ?? ''
        const message: IOpenVRWSCommandMessage = {
            key: 'RemoteSetting',
            value: password,
            value2: settingArr[0],
            value3: settingArr[1],
            value4: config.value?.toString() ?? settingArr[2].toString() ?? ''
        }
        this.sendMessage(message)
        console.log(`OpenVR2WS: Setting ${config.setting} to ${config.value}`)
        if(config.duration && (config.resetToValue != null || settingArr[2].length > 0)) {
            message.value4 = (config.resetToValue ?? settingArr[2]).toString()
            this._resetSettingTimers.set(config.setting,  config.duration)
            this._resetSettingMessages.set(config.setting, message)
        } else {
            this._resetSettingTimers.set(config.setting, -1)
            this._resetSettingMessages.delete(config.setting)
        }
    }

    public async moveSpace(config: IOpenVR2WSMoveSpace) {
        const password = await Utils.sha256(Config.credentials.OpenVR2WSPassword)
        const message: IOpenVRWSCommandMessage = {
            key: 'MoveSpace',
            value: password,
            value2: (config.x ?? 0).toString(),
            value3: (config.y ?? 0).toString(),
            value4: (config.z ?? 0).toString(),
            value5: (config.moveChaperone ?? true).toString()
        }
        this.sendMessage(message)
        console.log(`OpenVR2WS: Moving space: ${JSON.stringify(config)}`)
        if(config.duration) {
            message.value2 = (-(config.x ?? 0)).toString()
            message.value3 = (-(config.y ?? 0)).toString()
            message.value4 = (-(config.z ?? 0)).toString()
            setTimeout(() => {
                this.sendMessage(message)
            }, config.duration*1000)
        }
    }

    public async requestInputPoseData(): Promise<IOpenVR2WSInputPoseResponseData|undefined> {
        const nonce = Utils.getNonce('InputPose')
        const message: IOpenVRWSCommandMessage = {
            key: 'InputPose',
            nonce: nonce
        }
        return this.sendMessageWithPromise<IOpenVR2WSInputPoseResponseData>(message)
    }

    /**
     * Set to run every second.
     */
    public resetSettings() {
        // Loop over all timers, reduce until 0, then send message
        for(const pair of this._resetSettingTimers) {
            const key = pair[0]
            let timer = pair[1]
            timer--
            this._resetSettingTimers.set(key, timer)
            if(timer <= 0) {
                const message = this._resetSettingMessages.get(key)
                if(message) this.sendMessage(message)
                this._resetSettingTimers.delete(key)
                this._resetSettingMessages.delete(key)
            }
        }
    }

    public findOverlay(overlayKey: string) {
        this.sendMessage({
            key: 'FindOverlay',
            value: overlayKey
        })
    }
}