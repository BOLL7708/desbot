import ConfigOpenVR2WS from '../Objects/Data/Config/ConfigOpenVR2WS.js'
import WebSockets from './WebSockets.js'
import DataBaseHelper from '../Helpers/DataBaseHelper.js'
import Utils from '../Utils/Utils.js'
import ActionSettingVR from '../Objects/Data/Action/ActionSettingVR.js'
import Color from '../Constants/ColorConstants.js'

export default class OpenVR2WS {
    static get OVERLAY_LIV_MENU_BUTTON() { return 'VIVR_OVERLAY_MAIN_MENU_BUTTON' }

    private _config = new ConfigOpenVR2WS()
    private _socket: WebSockets|undefined = undefined
    private _resetLoopHandle: number|any = 0 // TODO: Transitional node fix
    private _resetSettingMessages: Map<string, IOpenVRWSCommandMessage> = new Map()
    private _resetSettingTimers: Map<string, number> = new Map()
    private _currentAppId?: string // Updated every time an ID is received
    private _password: string = ''
    public isConnected: boolean = false
    
    constructor() {}

    async init() { // Init function as we want to set the callbacks before the first messages arrive.
        this._config = await DataBaseHelper.loadMain(new ConfigOpenVR2WS())
        this._password = await Utils.hashPassword(this._config.password)
        this._socket = new WebSockets(
            `ws://localhost:${this._config.port}`,
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
            JSON.stringify(message), message.Nonce ?? '', 1000
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
                    const appData: IOpenVR2WSApplicationInfoData = data.data
                    if(appData?.hasOwnProperty('appId')) {
                        this._currentAppId = <string> appData.appId
                        if(this._currentAppId.length > 0) this._appIdCallback(this._currentAppId)
                    }
                    break
                case 'Input':
                    const inputData: IOpenVR2WSInputData = data.data
                    this._inputCallback(data.key, inputData)
                    break
                case 'RemoteSetting':
                    if(data.type == 'Error') Utils.log(`OpenVR2WS: ${data.key} failed with ${data.kessage}`, Color.DarkRed)
                    break
                case 'FindOverlay':
                    const overlayResult: IOpenVR2WSFindOverlayData = data.data
                    this._findOverlayCallback(overlayResult.key, overlayResult.handle)
                    break
                case 'MoveSpace':
                    if(data.type ?? 'Error') Utils.log(`OpenVR2WS: ${data.key} failed with: ${data.kessage}`, Color.DarkRed)
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

    public setSetting(action: ActionSettingVR) {
        let [category = '', setting = '', defaultValue = ''] = action.settingPreset.split('|')
        if(action.settingPreset_orCustom.length > 0) setting = action.settingPreset_orCustom
        if(action.settingPreset_inCategory.length > 0) category = action.settingPreset_inCategory
        if(action.resetToValue.length > 0) defaultValue = action.resetToValue
        if(setting.length == 0) return Utils.log(`OpenVR2WS: Invalid setting, was empty.`, Color.Red)
        if(category.length == 0) category = this._currentAppId?.toString() ?? ''
        const value = action.setToValue.length == 0 ? defaultValue : action.setToValue
        const message: IOpenVRWSCommandMessage = {
            key: 'RemoteSetting',
            password: this._password,
            data: {
                Section: category,
                Setting: setting,
                Value: value,
                Type: 'Float' // TODO: Will this need to be other things?
            }
        }
        this.sendMessage(message)
        console.log(`OpenVR2WS: Setting ${category} : ${setting} to ${value}`)
        const settingKey = `${category}|${setting}`
        if(action.duration > 0) {
            // Registers a new resetting timer for this specific setting category.
            message.data.Value = defaultValue
            this._resetSettingTimers.set(settingKey, action.duration)
            this._resetSettingMessages.set(settingKey, message)
        } else {
            // Resets a specific setting category reset timer in case a new one was triggered.
            this._resetSettingTimers.set(settingKey, -1)
            this._resetSettingMessages.delete(settingKey)
        }
    }

    public moveSpace(data: IOpenVR2WSMoveSpace) {
        const message: IOpenVRWSCommandMessage = {
            key: 'MoveSpace',
            password: this._password,
            data: data
        }
        this.sendMessage(message)
        console.log(`OpenVR2WS: Moving space: ${JSON.stringify(data)}`)
    }

    public async requestInputPoseData(): Promise<IOpenVR2WSInputPoseResponseData|undefined> {
        const nonce = Utils.getNonce('InputPose')
        const message: IOpenVRWSCommandMessage = {
            key: 'InputPose',
            Nonce: nonce
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
                if(message) {
                    console.log(`OpenVR2WS: Resetting ${message.key} : ${message.Nonce} to ${message.data}`)
                    this.sendMessage(message)
                }
                this._resetSettingTimers.delete(key)
                this._resetSettingMessages.delete(key)
            }
        }
    }

    public findOverlay(overlayKey: string) {
        this.sendMessage({
            key: 'FindOverlay',
            data: overlayKey
        })
    }
}

// Data
export interface IOpenVR2WSMessage {
    type: string
    key: string
    kessage: string
    data?: any
    nonce?: string
}
export interface IOpenVR2WSInputData {
    source: string
    input: string
    state: boolean
}
export interface IOpenVR2WSFindOverlayData {
    key: string
    handle: number
}
export interface IOpenVR2WSApplicationInfoData {
    appId: string
    sessionStart: number
}
export interface IOpenVR2WSInputPoseResponseData {
    head?: IOpenVR2WSInputPoseResponseDataPose
    leftHand?: IOpenVR2WSInputPoseResponseDataPose
    rightHand?: IOpenVR2WSInputPoseResponseDataPose
}
export interface IOpenVR2WSInputPoseResponseDataPose {
    rotationMatrix: number[]
    position: Vec3
    velocity: Vec3
    angularVelocity: Vec3
    orientation: Vec3
    isConnected: boolean
    isTracking: boolean
}
export interface Vec3 {
    x: number
    y: number
    z: number
}
export interface IOpenVRWSCommandMessage {
    key: string
    data?: any
    Nonce?: string
    password?: string
}
export interface IOpenVR2WSMoveSpace {
    durationMs: number
    easeInType: string
    easeInMode: string
    easeInMs: number
    easeOutType: string
    easeOutMode: string
    easeOutMs: number
    resetSpaceBeforeRun: boolean
    resetOffsetAfterRun: boolean
    correction: string
    entries: IOpenVR2WSMoveSpaceEntry[]
}
export interface IOpenVR2WSMoveSpaceEntry {
    easeType: string
    easeMode: string
    offsetX: number
    offsetY: number
    offsetZ: number
    rotate: number
    startOffsetMs: number
    endOffsetMs: number
    pingPong: boolean
    repeat: number
    accumulate: boolean
}

// Callbacks
export interface IOpenVR2WSStatusCallback {
    (status: boolean): void
}
export interface IOpenVR2WSInputCallback {
    (key: string, data: IOpenVR2WSInputData): void
}
export interface IOpenVR2WSInputPoseCallback {
    (pose: IOpenVR2WSInputPoseResponseData): void
}
export interface IOpenVR2WSAppIdCallback {
    (appId: string): void
}
export interface IOpenVR2WSFindOverlayCallback {
    (overlayKey: string, overlayHandle: number): void
}