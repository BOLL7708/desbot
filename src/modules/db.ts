import {LOCAL_STORAGE_AUTH_KEY} from './data.js'
import Utils from '../widget/utils.js'

export default class DB {
    private static LOG_COLOR: string = 'blue'

    private static _settingsStore: Map<string, any[]> = new Map() // Used for storing settings in memory before saving to disk
    private static _settingsCache: Map<string, any[]> = new Map() // Used to periodic writing of settings that accumulate
    private static _cacheWriteIntervalHandle: number = -1

    static async testConnection(): Promise<boolean> {
        const response = await fetch(this.getUrlDB(), {
            method: 'HEAD',
            headers: {
                Authorization: Utils.getAuth()
            }
        })
        return response.ok
    }

    /**
     * Load settings from the database.
     * @param groupClass Main class to load settings for.
     * @param groupKey Supply a value for this to get one specific post.
     * @param ignoreCache Will ignore the memory cache.
     */
    static async loadSettingsDB<T>(groupClass: string, groupKey?: string, ignoreCache: boolean = false): Promise<T[]|T|null|undefined> {
        if(!ignoreCache && this._settingsStore.has(groupClass)) {
            return <T[]> this._settingsStore.get(groupClass)
        }
        let url = this.getUrlDB(groupClass)
        if(groupKey) url += `&groupKey=${groupKey}`
        const response = await fetch(url, {
            headers: await this.getAuthHeaderDB()
        })
        const result: T[]|T|undefined = response.ok ? await response.json() : undefined

        // TODO: Handle getting single settings
        if(result) {
            if(Array.isArray(result)) {
                this._settingsStore.set(groupClass, result)
            } else {
                const currentSettings = this._settingsStore.get(groupClass)
                // TODO: Change the cache to be a record or something, so we can reference things on the groupKey.
                // TODO: Then save single items referenced on the key... I guess?
                // TODO: Not sure how it would work for the arrays that come for multiple items though.
            }
        }

        return result;
    }

    /**
     * Save a setting to the database.
     * @param setting Should be a class instance to work, as the name of the class is used to categorize the setting.
     * @param groupKey
     */
    static async saveSettingDB<T>(setting: T&Object, groupKey?: string): Promise<boolean> {
        let url = this.getUrlDB(setting.constructor.name)
        if(groupKey) url += `&groupKey=${groupKey}`
        const response = await fetch(url, {
            headers: await this.getAuthHeaderDB(true),
            method: 'POST',
            body: JSON.stringify(setting)
        })
        return response.ok
    }

    /**
     * Returns the relative path to the settings file
     * @param groupClass Main category to load.
     * @returns
     */
    private static getUrlDB(groupClass?: string): string {
        let url = './db.php'
        if(groupClass) url += `?groupClass=${groupClass}`
        return url
    }

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
}

// region Data Classes
export class TwitchClient {
    clientId: string = ''
    clientSecret: string = ''
}
export class TwitchToken {
    refreshToken: string = ''
    accessToken: string = ''
    scopes: string = ''
}
// endregion