class IkeaTradfri {
    private _config = Config.ikeatradfri
    private _settings?: IIkeaTradfriSettings
    private _initialized: boolean = false

    constructor() {
        let settings = Settings.getFullSettings<IIkeaTradfriSettings>(Settings.IKEA_TRADFRI)

        console.warn(settings)
        if (settings != undefined) this._settings = settings[0]
    }

    init() {
        let settings = Settings.getFullSettings<IIkeaTradfriSettings>(Settings.IKEA_TRADFRI)

        console.warn(settings)

        if (settings != undefined) {
            this._settings = settings[0]
            this._initialized = true
        }
    }

    getDevices() {
        return new Promise<Array<any>>((resolve, reject) => {
            const commandStr = `..\\ikea\\IkeaCoapTest.exe devices -h ${this._config.serverPath} -p ${this._settings?.clientPsk} -c ${this._settings?.clientId}`
            const command64 = Utils.encode(commandStr)
            const passwordB64 = Utils.encode(Config.credentials.PHPPassword)

            console.warn(commandStr)

            fetch(`exec/passthru.php?command=${command64}`, {headers: {password: passwordB64}})
                .then(r => r.json())
                .then(data => {
                    if (data.Message) {
                        reject(data)
                    }
                    resolve(data)
                })
                .catch(reject)
        })
    }
}