class Settings {
    static USER_VOICES:string = 'settings_user_voices'
    static TWITCH_TOKENS:string = 'settings_twitch_tokens'
    private static settingsStore = {};
    static async loadSettings(setting:string) {
        if(this.settingsStore.hasOwnProperty(setting)) {
            console.log(`Returning cache for: ${setting}`)
            return this.settingsStore[setting]
        }
        console.log(`Loading settings for: ${setting}`)
        let url = this.getUrl(setting)
        return fetch(url).then(response => response.json()).then(json => {
            let result = json.status >= 300 ? null : json
            if(result != null) this.settingsStore[setting] = result
            return result
        });
    }

    static async saveSettings(setting:string, settings:any) {
        console.log(`Saving and updating cache for: ${setting}`)
        this.settingsStore[setting] = Promise.resolve(settings)
        let url = this.getUrl(setting)
        return fetch(url, {
                method: 'post',
                body: JSON.stringify(settings)
            }
        ).then(response => response.status < 300)
    }

    private static getUrl(setting:string) {
        return `./settings.php?setting=${setting}`
    }
}