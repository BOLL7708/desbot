import {LOCAL_STORAGE_AUTH_KEY} from '../Classes/data.js'
import Utils from '../widget/utils.js'
import Color from './colors.js'

export default class DB {
    private static LOG_GOOD_COLOR: string = Color.BlueViolet
    private static LOG_BAD_COLOR: string = Color.DarkRed

    private static _settingsDictionaryStore: Map<string, { [key:string]: any }> = new Map() // Used for storing keyed settings in memory before saving to disk
    private static _settingsArrayStore: Map<string, any[]> = new Map() // Used for storing a list of settings in memory before saving to disk

    static async testConnection(): Promise<boolean> {
        const response = await fetch(this.getSettingsUrl(), {
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
     * @param emptyInstanceOrClassName Main class to load settings for.
     * @param ignoreCache Will ignore the memory cache.
     */
    static async loadSettingsDictionary<T>(emptyInstanceOrClassName: T&Object|string, ignoreCache: boolean = false): Promise<{ [key:string]: T }|undefined> {
        const className = this.getClassName(emptyInstanceOrClassName)
        if(!ignoreCache && this._settingsDictionaryStore.has(className)) {
            return this._settingsDictionaryStore.get(className) as { [key:string]: T }
        }
        let url = this.getSettingsUrl(className)
        const response = await fetch(url, {
            headers: await this.getAuthHeader()
        })
        const result = response.ok ? await response.json() as { [key:string]: T }: undefined;
        if(result) this._settingsDictionaryStore.set(className, result)
        return result
    }

    /**
     * Loads an entire array of settings.
     * @param emptyInstanceOrClassName
     * @param ignoreCache
     */
    static async loadSettingsArray<T>(emptyInstanceOrClassName: T&Object|string, ignoreCache: boolean = false): Promise<T[]|undefined> {
        const className = this.getClassName(emptyInstanceOrClassName)
        if(!ignoreCache && this._settingsArrayStore.has(className)) {
            return this._settingsArrayStore.get(className) as T[]
        }
        let url = this.getSettingsUrl(className)
        const response = await fetch(url, {
            headers: await this.getAuthHeader()
        })
        let result = response.ok ? await response.json() as T[]|{ [key:string]: T }: undefined
        if(result && !Array.isArray(result)) result = Object.values(result) as T[]
        if(result) this._settingsArrayStore.set(className, result)
        return result
    }

    /**
     * Loads one specific setting from a dictionary of settings.
     * @param emptyInstanceOrClassName
     * @param key Supply a value for this to get one specific post.
     * @param ignoreCache
     */
    static async loadSetting<T>(emptyInstanceOrClassName: T&Object, key: string, ignoreCache: boolean = false) {
        const className = this.getClassName(emptyInstanceOrClassName)
        if(!ignoreCache && this._settingsDictionaryStore.has(className)) {
            const dictionary = this._settingsDictionaryStore.get(className) as { [key:string]: T }
            if(dictionary && Object.keys(dictionary).indexOf(key) !== -1) {
                return dictionary[key]
            }
        }
        let url = this.getSettingsUrl(className, key)
        const response = await fetch(url, {
            headers: await this.getAuthHeader()
        })
        const result: T|undefined = response.ok ? await response.json() as T : undefined
        if(result) {
            if(!this._settingsDictionaryStore.has(className)) this._settingsDictionaryStore.set(className, {})
            const dictionary = this._settingsDictionaryStore.get(className)
            if(dictionary) dictionary[key] = result
        }
        return result
    }

    static async loadSettingClasses(): Promise<string[]> {
        const url = this.getSettingsUrl()
        const response = await fetch(url, {
            headers: await this.getAuthHeader()
        })
        return response.ok ? await response.json() : []
    }

    /**
     * Save a setting to the database.
     * @param setting Should be a class instance to work, as the name of the class is used to categorize the setting.
     * @param key
     */
    static async saveSetting<T>(setting: T&Object, key?: string): Promise<boolean> {
        const className = setting.constructor.name
        let url = this.getSettingsUrl(className, key)
        const response = await fetch(url, {
            headers: await this.getAuthHeader(true),
            method: 'POST',
            body: JSON.stringify(setting)
        })
        Utils.log(response.ok ? `Wrote '${className}' to DB` : `Failed to write '${className}' to DB`, response.ok ? this.LOG_GOOD_COLOR : this.LOG_BAD_COLOR)
        return response.ok
    }

    /**
     * Delete specific setting
     * @param emptyInstanceOrClassName
     * @param key
     */
    static async deleteSetting<T>(emptyInstanceOrClassName: T&Object|string, key: string): Promise<boolean> {
        const className = this.getClassName(emptyInstanceOrClassName)
        let url = this.getSettingsUrl(className, key)
        const response = await fetch(url, {
            headers: await this.getAuthHeader(true),
            method: 'DELETE'
        })
        Utils.log(response.ok ? `Deleted '${className}:${key}' from DB` : `Failed to delete '${className}:${key}' from DB`, response.ok ? this.LOG_GOOD_COLOR : this.LOG_BAD_COLOR)
        return response.ok
    }

    /**
     * Returns the relative path to the settings file
     * @param groupClass Main category to load.
     * @param groupKey Specific item to fetch.
     * @returns
     */
    private static getSettingsUrl(groupClass?: string, groupKey?: string): string {
        let url = './db_settings.php'
        const params: string[] = []
        if(groupClass) params.push(`groupClass=${groupClass}`)
        if(groupKey) params.push(`groupKey=${groupKey}`)
        if(params.length > 0) url += '?' + params.join('&')
        return url
    }

    private static getClassName<T>(emptyInstanceOrClassName: T&Object|string): string {
        return typeof emptyInstanceOrClassName === 'string'
            ? emptyInstanceOrClassName
            : emptyInstanceOrClassName.constructor.name
    }

    // endregion

    // region Helpers

    /**
     * Get authorization header with optional JSON content type.
     * @param addJsonHeader
     * @private
     */
    private static async getAuthHeader(addJsonHeader: boolean = false): Promise<HeadersInit> {
        const headers = new Headers()
        headers.set('Authorization', localStorage.getItem(LOCAL_STORAGE_AUTH_KEY) ?? '')
        if (addJsonHeader) headers.set('Content-Type', 'application/json; charset=utf-8')
        return headers
    }

    // endregion
}