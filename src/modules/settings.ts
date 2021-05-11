class Settings {
    static USER_NAMES:string = 'settings_user_names'
    static USER_VOICES:string = 'settings_user_voices'
    static TWITCH_TOKENS:string = 'settings_twitch_tokens'
    private static settingsStore:Record<string, any> = {};

    /**
     * Will load settings off disk, to an in-memory cache, that will be used next time.
     * @param setting Key for the settings file that will be loaded.
     * @returns 
     */
    static async loadSettings(setting:string):Promise<any> {
        if(this.settingsStore.hasOwnProperty(setting)) {
            console.log(`Returning cache for: ${setting}`)
            return this.settingsStore[setting]
        }
        console.log(`Loading settings for: ${setting}`)
        let url = this.getUrl(setting)      
        let response = await fetch(url)
        let result = response.status >= 300 ? null : await response.json()
        if(result != null) {
            this.settingsStore[setting] = result
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
        console.table(settings)
        let url = this.getUrl(setting)
        if(settings == null) settings = this.settingsStore[setting]
        if(settings != null) {
            let payload = JSON.stringify(settings)
            console.log(`Saving settings(${payload.length}) for: ${setting}`)
            let response = await fetch(url, {
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
        console.log(`Pushing setting: ${setting}`)
        let settings = this.settingsStore[setting]      
        if(settings == null || !Array.isArray(settings)) settings = []      
        let filteredSettings = settings.filter(s => s[field] != value[field])
        filteredSettings.push(value)
        this.settingsStore[setting] = filteredSettings
        return this.saveSettings(setting)
    }

    /**
     * Try to retrieve a value from a cached settings array.
     * @param setting The setting we will try to access.
     * @param field Match this field to retrieve the object.
     * @param key The value field should match.
     * @returns The object or null if failed.
     */
    static async pullSetting(setting:string, field:string, key:any):Promise<any> {
        console.log(`Pulling setting: ${setting}`)
        let settings = null
        if(this.settingsStore.hasOwnProperty(setting)) {
            settings = this.settingsStore[setting]
        } else {
            settings = await this.loadSettings(setting)
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
}