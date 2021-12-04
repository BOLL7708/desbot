class Settings {
    static TTS_USER_NAMES: string = 'settings_tts_names'
    static TTS_USER_VOICES: string = 'settings_tts_voices'
    static TTS_BLACKLIST: string = 'settings_tts_blacklist'
    static TWITCH_TOKENS: string = 'settings_twitch_tokens'
    static TWITCH_REWARDS: string = 'settings_twitch_rewards'
    static LABELS: string = 'settings_labels'
    static DICTIONARY: string = 'settings_tts_dictionary'
    static LABEL_CHANNEL_TROPHY: string = 'label_channel_trophy'
    static STATS_CHANNEL_TROPHY: string = 'stats_channel_trophy'
    static TWITCH_CLIPS: string = 'twitch_clips_piped'
    static LABEL_WORLD_SCALE: string = 'label_world_scale'

    private static LOG_COLOR: string = 'blue'

    private static _settingsStore:Record<string, any> = {};

    /**
     * Will load settings off disk, to an in-memory cache, that will be used next time.
     * @param setting Key for the settings file that will be loaded.
     * @returns 
     */
    static async loadSettings(setting:string, ignoreCache:boolean = false):Promise<any> {
        if(!ignoreCache && this._settingsStore.hasOwnProperty(setting)) {
            console.log(`Returning cache for: ${setting}`)
            return this._settingsStore[setting]
        }
        Utils.logWithBold(`Loading settings for: <${setting}>`, this.LOG_COLOR)
        let url = this.getUrl(setting)      
        let response = await fetch(url, {
            headers: {password: Utils.encode(Config.controller.phpPassword)}
        })
        let result = response.status >= 300 ? null : await response.json()
        if(result != null) {
            this._settingsStore[setting] = result
        }
        return result
    }

    /**
     * Will save incoming or cached settings to disk.
     * @param setting Key for the settings file that will be saved.
     * @param settings Settings object or array, null to save cache.
     * @returns 
     */
    static async saveSettings(setting:string, settings:any=null):Promise<boolean> {
        let url = this.getUrl(setting)
        if(settings == null) settings = this._settingsStore[setting]
        if(settings != null) {
            let payload = JSON.stringify(settings)
            payload.replace(/\|/g, '').replace(/;/g, '')
            Utils.log(`Saving settings (${payload.length}b): ${setting}`, this.LOG_COLOR)
            let response = await fetch(url, {
                headers: {password: Utils.encode(Config.controller.phpPassword)},
                method: 'post',
                body: payload
            })
            return response.status < 300
        }
        return false
    }

    /**
     * Try to insert a value into a cached settings array and save it to disk.
     * @param setting The setting set we should try to modify.
     * @param field Match this field in the object to replace it.
     * @param value The actual object that will replace something in the array.
     * @Returns The success as a boolean.
     */
    static async pushSetting(setting:string, field:string, value:any):Promise<boolean> {
        Utils.log(`Pushing setting: ${setting}`, this.LOG_COLOR)
        let settings = this._settingsStore[setting]
        if(settings == null || !Array.isArray(settings)) settings = []
        let filteredSettings = settings.filter(s => s[field] != value[field])
        filteredSettings.push(value)
        this._settingsStore[setting] = filteredSettings
        return this.saveSettings(setting)
    }

    static async pushRow(setting:string, value:any):Promise<boolean> {
        Utils.log(`Pushing row: ${setting}`, this.LOG_COLOR)
        let settings = this._settingsStore[setting]
        if(settings == null || !Array.isArray(settings)) settings = []
        settings.push(value)
        this._settingsStore[setting] = settings
        return this.saveSettings(setting)
    }

    static async pushLabel(setting:string, value:string):Promise<boolean> {
        return this.saveSettings(setting, value)
    }

    /**
     * Try to retrieve a value from a cached settings array.
     * @param setting The setting we will try to access.
     * @param field Match this field to retrieve the object.
     * @param key The value field should match.
     * @returns The object or null if failed.
     */
    static async pullSetting(setting:string, field:string, key:any, ignoreCache:boolean=false):Promise<any> {
        let settings = null
        if(!ignoreCache && this._settingsStore.hasOwnProperty(setting)) {
            settings = this._settingsStore[setting]
        } else {
            settings = await this.loadSettings(setting, ignoreCache)
        }
        if(Array.isArray(settings)) return settings.find(s => s[field] == key)
        else return settings
    }

    /**
     * Returns the relative path to the settings file
     * @param setting 
     * @returns
     */
    private static getUrl(setting:string) {
        return `./settings.php?setting=${setting}`
    }

    public static getFullSettings(setting:string):any[] {
        Utils.log(`Pulling full settings: ${setting}`, this.LOG_COLOR)
        return this._settingsStore[setting]
    }
}