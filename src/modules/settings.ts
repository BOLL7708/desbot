class Settings {
    static SETTING_VOICE:string = 'settings_voices'
    static SETTING_TWITCH:string = 'settings_twitch'

    static async loadSettings(setting:string) {
        let url = this.getUrl(setting)
        return fetch(url).then(response => response.status >= 300 ? null : response.json());
    }

    static async saveSettings(setting:string, settings:Array<Array<any>>) {
        let url = this.getUrl(setting)
        return fetch(url, {
                method: 'post',
                body: JSON.stringify(settings)
            }
        ).then(response => response.status >= 300)
    }

    private static getUrl(setting:string) {
        return `./settings.php?setting=${setting}`
    }
}