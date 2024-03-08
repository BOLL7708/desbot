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
    IOpenVR2WSStatusCallback,
    IOpenVRWSCommandMessage
} from '../Interfaces/iopenvr2ws.js'
import Color from './ColorConstants.js'
import WebSockets from './WebSockets.js'
import Utils from './Utils.js'
import DataBaseHelper from './DataBaseHelper.js'
import {ConfigOpenVR2WS} from '../Objects/Config/ConfigOpenVR2WS.js'
import {ActionMoveVRSpace} from '../Objects/Action/ActionMoveVRSpace.js'
import {ActionSettingVR} from '../Objects/Action/ActionSettingVR.js'

export default class OpenVR2WS {
    static get OVERLAY_LIV_MENU_BUTTON() { return 'VIVR_OVERLAY_MAIN_MENU_BUTTON' }

    private _config = new ConfigOpenVR2WS()
    private _socket: WebSockets|undefined = undefined
    private _resetLoopHandle: number = 0
    private _resetSettingMessages: Map<string, IOpenVRWSCommandMessage> = new Map()
    private _resetSettingTimers: Map<string, number> = new Map()
    private _currentAppId?: string // Updated every time an ID is received
    private _password: string = ''
    public isConnected: boolean = false
    
    constructor() {}

    async init() { // Init function as we want to set the callbacks before the first messages arrive.
        this._config = await DataBaseHelper.loadMain(new ConfigOpenVR2WS())
        this._password = await Utils.sha256(this._config.password)
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
            value: this._password,
            value2: category,
            value3: setting,
            value4: value
        }
        this.sendMessage(message)
        console.log(`OpenVR2WS: Setting ${category} : ${setting} to ${value}`)
        const settingKey = `${category}|${setting}`
        if(action.duration > 0) {
            // Registers a new resetting timer for this specific setting category.
            message.value4 = defaultValue
            this._resetSettingTimers.set(settingKey, action.duration)
            this._resetSettingMessages.set(settingKey, message)
        } else {
            // Resets a specific setting category reset timer in case a new one was triggered.
            this._resetSettingTimers.set(settingKey, -1)
            this._resetSettingMessages.delete(settingKey)
        }
    }

    public moveSpace(action: ActionMoveVRSpace) {
        const message: IOpenVRWSCommandMessage = {
            key: 'MoveSpace',
            value: this._password,
            value2: (action.x ?? 0).toString(),
            value3: (action.y ?? 0).toString(),
            value4: (action.z ?? 0).toString(),
            value5: (action.moveChaperone ?? true).toString()
        }
        this.sendMessage(message)
        console.log(`OpenVR2WS: Moving space: ${JSON.stringify(action)}`)
        if(action.duration) {
            message.value2 = (-(action.x ?? 0)).toString()
            message.value3 = (-(action.y ?? 0)).toString()
            message.value4 = (-(action.z ?? 0)).toString()
            setTimeout(() => {
                this.sendMessage(message)
            }, action.duration*1000)
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
                if(message) {
                    console.log(`OpenVR2WS: Resetting ${message.value2} : ${message.value3} to ${message.value4}`)
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
            value: overlayKey
        })
    }
}