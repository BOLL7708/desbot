class OpenVR2WS {
    static get SETTING_WORLD_SCALE() { return '|worldScale|1' }
    static get SETTING_ANALOG_GAIN() { return 'steamvr|analogGain|1.30' }
    static get SETTING_PREFERRED_REFRESH_RATE() { return 'steamvr|preferredRefreshRate|120' }
    static get SETTING_MIRROR_VIEW_EYE() { return 'steamvr|mirrorViewEye|4' }
    static get SETTING_LEFT_THUMBSTICK_ROTATION_KNUCKLES() { return 'input|leftThumbstickRotation_knuckles|0' }
    static get SETTING_RIGHT_THUMBSTICK_ROTATION_KNUCKLES() { return 'input|rightThumbstickRotation_knuckles|0' }
    static get SETTING_HMD_DISPLAY_COLOR_GAIN_R() { return 'steamvr|hmdDisplayColorGainR|1.0' }
    static get SETTING_HMD_DISPLAY_COLOR_GAIN_G() { return 'steamvr|hmdDisplayColorGainG|1.0' }
    static get SETTING_HMD_DISPLAY_COLOR_GAIN_B() { return 'steamvr|hmdDisplayColorGainB|1.0' }


    private _socket: WebSockets
    private _resetLoopHandle: number = 0
    private _resetMessages: Map<string, IOpenVRWSCommandMessage> = new Map()
    private _resetTimers: Map<string, number> = new Map()
    private _currentAppId?: string // Updated every time an ID is received
    public isConnected: boolean = false
    
    constructor() {
        const port = Config.openvr2ws.port
        this._socket = new WebSockets(
            `ws://localhost:${port}`,
            10,
            false
        )
        this._socket._onMessage = this.onMessage.bind(this),
        this._socket._onOpen = this.onOpen.bind(this)
        this._socket._onClose = this.onClose.bind(this)
        this._socket._onError = this.onError.bind(this)
    }

    init() { // Init function as we want to set the callbacks before the first messages arrive.
        this._socket.init();
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
    
    private _inputCallback: IOpenVR2WSInputCallback = (key, data) => { 
        // console.warn('OpenVR2WS: Unhandled input message')
    }
    setInputCallback(callback: IOpenVR2WSInputCallback) {
        this._inputCallback = callback
    }

    public sendMessage(message: IOpenVRWSCommandMessage) {
        // console.log(JSON.stringify(message))
        this._socket.send(JSON.stringify(message));
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
                    const inputData:IOpenVR2WSInputData = data.data
                    this._inputCallback(data.key, inputData)
                    break
                case 'RemoteSetting':
                    const success = data.data.success
                    if(!success) console.warn(data)
                    break
                default:
                    // console.log(data)
                    break
            }
        }
    }

    private onOpen(evt: any) {
        if(this._statusCallback && this.isConnected !== true) {
            this.isConnected = true
            this._statusCallback(true)
        }
    }
    private onClose(evt: any) {
        if(this._statusCallback && this.isConnected !== false) {
            this.isConnected = false
            this._statusCallback(false)
        }
    }

    private onError(evt: any) {
        console.error(evt)
    }

    public async setSetting(config: IOpenVR2WSSetting|IOpenVR2WSSetting[]) {
        const password = await Utils.sha256(Config.credentials.OpenVR2WSPassword)
        if(!Array.isArray(config)) config = [config]
        for(const cfg of config) {
            const settingArr: string[] = cfg.setting.split('|') ?? []
            if(settingArr.length != 3) return Utils.log(`OpenVR2WS: Malformed setting, did not split into 3 on '|': ${cfg.setting}`, Color.Red)
            if(settingArr[0].length == 0) settingArr[0] = this._currentAppId?.toString() ?? ''
            const message :IOpenVRWSCommandMessage = {
                key: 'RemoteSetting',
                value: password,
                value2: settingArr[0],
                value3: settingArr[1],
                value4: cfg.value.toString()
            }
            this.sendMessage(message)
            console.log(`OpenVR2WS: Setting ${cfg.setting} to ${cfg.value}`)
            if(cfg.duration != null && (cfg.resetToValue != null || settingArr[2].length > 0)) {
                message.value4 = (cfg.resetToValue ?? settingArr[2]).toString()
                this._resetTimers.set(cfg.setting,  cfg.duration)
                this._resetMessages.set(cfg.setting, message)
            } else {
                this._resetTimers.set(cfg.setting, -1)
                this._resetMessages.delete(cfg.setting)
            }
        }
    }

    /**
     * Set to run every second.
     */
    public resetSettings() {
        // Loop over all timers, reduce until 0, then send message
        for(const pair of this._resetTimers) {
            const key = pair[0]
            let timer = pair[1]
            timer--
            this._resetTimers.set(key, timer)
            if(timer <= 0) {
                const message = this._resetMessages.get(key)
                if(message) this.sendMessage(message)
                this._resetTimers.delete(key)
                this._resetMessages.delete(key)
            }
        }
    }
}