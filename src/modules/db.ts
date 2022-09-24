import {LOCAL_STORAGE_AUTH_KEY} from './data.js'
import Utils from '../widget/utils.js'
import Color from '../statics/colors.js'

export default class DB {
    private static LOG_GOOD_COLOR: string = Color.BlueViolet
    private static LOG_BAD_COLOR: string = Color.DarkRed

    private static _settingsDictionaryStore: Map<string, { [key:string]: any }> = new Map() // Used for storing keyed settings in memory before saving to disk
    private static _settingsArrayStore: Map<string, any[]> = new Map() // Used for storing a list of settings in memory before saving to disk

    static async testConnection(): Promise<boolean> {
        const response = await fetch(this.getUrlDB(), {
            method: 'HEAD',
            headers: {
                Authorization: Utils.getAuth()
            }
        })
        return response.ok
    }

    // region Settings

    /**
     * Load settings from the database.
     * @param emptyInstance Main class to load settings for.
     * @param ignoreCache Will ignore the memory cache.
     */
    static async loadSettingsDictionary<T>(emptyInstance: T&Object, ignoreCache: boolean = false): Promise<{ [key:string]: T }|undefined> {
        const className = emptyInstance.constructor.name;
        if(!ignoreCache && this._settingsDictionaryStore.has(className)) {
            return this._settingsDictionaryStore.get(className) as { [key:string]: T }
        }
        let url = this.getUrlDB(className)
        const response = await fetch(url, {
            headers: await this.getAuthHeaderDB()
        })
        const result = response.ok ? await response.json() as { [key:string]: T }: undefined;
        if(result) this._settingsDictionaryStore.set(className, result)
        return result
    }

    /**
     * Loads an entire array of settings.
     * @param emptyInstance
     * @param ignoreCache
     */
    static async loadSettingsArray<T>(emptyInstance: T&Object, ignoreCache: boolean = false): Promise<T[]|undefined> {
        const className = emptyInstance.constructor.name;
        if(!ignoreCache && this._settingsArrayStore.has(className)) {
            return this._settingsArrayStore.get(className) as T[]
        }
        let url = this.getUrlDB(className)
        const response = await fetch(url, {
            headers: await this.getAuthHeaderDB()
        })
        let result = response.ok ? await response.json() as T[]|{ [key:string]: T }: undefined
        if(result && !Array.isArray(result)) result = Object.values(result) as T[]
        if(result) this._settingsArrayStore.set(className, result)
        return result
    }

    /**
     * Loads one specific setting from a dictionary of settings.
     * @param emptyInstance
     * @param key Supply a value for this to get one specific post.
     * @param ignoreCache
     */
    static async loadSetting<T>(emptyInstance: T&Object, key: string, ignoreCache: boolean = false) {
        const className = emptyInstance.constructor.name;
        if(!ignoreCache && this._settingsDictionaryStore.has(className)) {
            const dictionary = this._settingsDictionaryStore.get(className) as { [key:string]: T }
            if(dictionary && Object.keys(dictionary).indexOf(key) !== -1) {
                return dictionary[key]
            }
        }
        let url = this.getUrlDB(className, key)
        const response = await fetch(url, {
            headers: await this.getAuthHeaderDB()
        })
        const result: T|undefined = response.ok ? await response.json() as T : undefined
        if(result) {
            if(!this._settingsDictionaryStore.has(className)) this._settingsDictionaryStore.set(className, {})
            const dictionary = this._settingsDictionaryStore.get(className)
            if(dictionary) dictionary[key] = result
        }
        return result
    }

    /**
     * Save a setting to the database.
     * @param setting Should be a class instance to work, as the name of the class is used to categorize the setting.
     * @param key
     */
    static async saveSettingDB<T>(setting: T&Object, key?: string): Promise<boolean> {
        const className = setting.constructor.name
        let url = this.getUrlDB(className, key)
        const response = await fetch(url, {
            headers: await this.getAuthHeaderDB(true),
            method: 'POST',
            body: JSON.stringify(setting)
        })
        Utils.log(response.ok ? `Wrote '${className}' to DB` : `Failed to write '${className}' to DB`, response.ok ? this.LOG_GOOD_COLOR : this.LOG_BAD_COLOR)
        return response.ok
    }

    // TODO: Add capability to delete a setting.

    /**
     * Returns the relative path to the settings file
     * @param groupClass Main category to load.
     * @param groupKey Specific item to fetch.
     * @returns
     */
    private static getUrlDB(groupClass?: string, groupKey?: string): string {
        let url = './db_settings.php'
        const params: string[] = []
        if(groupClass) params.push(`groupClass=${groupClass}`)
        if(groupKey) params.push(`groupKey=${groupKey}`)
        if(params.length > 0) url += '?' + params.join('&')
        return url
    }

    // endregion

    // region Helpers

    /**
     * Get authorization header with optional JSON content type.
     * @param addJsonHeader
     * @private
     */
    private static async getAuthHeaderDB(addJsonHeader: boolean = false): Promise<HeadersInit> {
        const headers = new Headers()
        headers.set('Authorization', localStorage.getItem(LOCAL_STORAGE_AUTH_KEY) ?? '')
        if (addJsonHeader) headers.set('Content-Type', 'application/json; charset=utf-8')
        return headers
    }

    // endregion
}