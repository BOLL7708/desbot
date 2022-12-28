import {LOCAL_STORAGE_AUTH_KEY} from './DataUtils.js'
import Utils from './Utils.js'
import Color from './ColorConstants.js'
import BaseDataObject from './BaseDataObject.js'

export default class DataBaseHelper {
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
     * Load a dictionary of settings from the database, this will retain keys.
     * @param emptyInstance Instance of the class to load.
     * @param ignoreCache Will not use the in-memory cache.
     */
    static async loadSettingsDictionary<T>(emptyInstance: T&BaseDataObject, ignoreCache: boolean = false): Promise<{ [key: string]: T }|undefined> {
        const className = emptyInstance.constructor.name
        if(this.checkAndReportClassError(className, 'loadDictionary')) return undefined

        // Cache
        if(!ignoreCache && this._settingsDictionaryStore.has(className)) {
            return this._settingsDictionaryStore.get(className) as { [key: string]: T }
        }

        // DB
        let url = this.getSettingsUrl(className)
        const response = await fetch(url, {
            headers: await this.getAuthHeader()
        })
        const result = response.ok ? await response.json() as { [key: string]: T } : undefined;
        if(result) {
            // Convert plain objects to class instances and cache them
            for(const [key, setting] of Object.entries(result)) {
                result[key] = emptyInstance.__new(setting)
            }
            this._settingsDictionaryStore.set(className, result)
        }
        return result
    }

    /**
     * Loads an array of settings from the database, this will throw away keys.
     * @param emptyInstance Instance of the class to load.
     * @param ignoreCache Will not use the in-memory cache.
     */
    static async loadSettingsArray<T>(emptyInstance: T&BaseDataObject, ignoreCache: boolean = false): Promise<T[]|undefined> {
        const className = emptyInstance.constructor.name
        if(this.checkAndReportClassError(className, 'loadArray')) return undefined

        // Cache
        if(!ignoreCache && this._settingsArrayStore.has(className)) {
            return this._settingsArrayStore.get(className) as T[]
        }

        // DB
        let url = this.getSettingsUrl(className, undefined, true)
        const response = await fetch(url, {
            headers: await this.getAuthHeader()
        })
        let result = response.ok ? await response.json() as T[]|{ [key:string]: T }: undefined
        if(result && !Array.isArray(result)) result = Object.values(result) as T[]
        if(result) {
            // Convert plain objects to class instances and cache them
            for(let i=0; i<result.length; i++) {
                result[i] = emptyInstance.__new(result[i])
            }
            this._settingsArrayStore.set(className, result)
        }
        return result
    }

    /**
     * Load one specific setting from the database, is using dictionary cache.
     * @param emptyInstance Instance of the class to load.
     * @param key The key for the row to load.
     * @param ignoreCache Will not use the in-memory cache.
     */
    static async loadSetting<T>(emptyInstance: T&BaseDataObject, key: string, ignoreCache: boolean = false): Promise<T|undefined> {
        const className = emptyInstance.constructor.name
        if (this.checkAndReportClassError(className, 'loadSingle')) return undefined

        // Cache
        if (!ignoreCache && this._settingsDictionaryStore.has(className)) {
            const dictionary = this._settingsDictionaryStore.get(className) as { [key: string]: T }
            if (dictionary && Object.keys(dictionary).indexOf(key) !== -1) {
                return dictionary[key]
            }
        }

        // DB
        let url = this.getSettingsUrl(className, key)
        const response = await fetch(url, {
            headers: await this.getAuthHeader()
        })
        let result: T | undefined = response.ok ? await response.json() as T : undefined
        if (result) {
            // Convert plain object to class instance
            if (!Utils.isEmptyObject(result)) {
                result = emptyInstance.__new(result)
            }
            if (!this._settingsDictionaryStore.has(className)) {
                const newDic: { [key: string]: T } = {}
                this._settingsDictionaryStore.set(className, newDic)
            }
            const dictionary = this._settingsDictionaryStore.get(className)
            if (dictionary && !Utils.isEmptyObject(result)) dictionary[key] = result
        }
        return Utils.isEmptyObject(result) ? undefined : result
    }

    /**
     * Load all available settings classes registered in the database.
     */
    static async loadSettingClasses(): Promise<{[group:string]: number}> {
        const url = this.getSettingsUrl()
        const response = await fetch(url, {
            headers: await this.getAuthHeader()
        })
        return response.ok ? await response.json() : []
    }

    /**
     * Save a setting to the database.
     * @param setting Instance of the class to save.
     * @param key Optional key for the setting to save, will upsert if key is set, else insert.
     */
    static async saveSetting<T>(setting: T&BaseDataObject, key?: string): Promise<boolean> {
        const className = setting.constructor.name
        if(this.checkAndReportClassError(className, 'saveSingle')) return false

        // DB
        let url = this.getSettingsUrl(className, key)
        const response = await fetch(url, {
            headers: await this.getAuthHeader(true),
            method: 'POST',
            body: JSON.stringify(setting)
        })

        // Cache
        if(response.ok) {
            if(key) {
                if(!this._settingsDictionaryStore.has(className)) this._settingsDictionaryStore.set(className, {})
                const dictionary = this._settingsDictionaryStore.get(className)
                if(dictionary) dictionary[key] = setting
            } else {
                if(!this._settingsArrayStore.has(className)) this._settingsArrayStore.set(className, [])
                const arr = this._settingsArrayStore.get(className)
                if(arr) arr.push(setting)
            }
        }

        // Result
        Utils.log(
            response.ok ? `Wrote '${className}' to DB` : `Failed to write '${className}' to DB`,
            response.ok ? this.LOG_GOOD_COLOR : this.LOG_BAD_COLOR
        )
        return response.ok
    }

    /**
     * Delete specific setting
     * @param emptyInstance Instance of the class to delete.
     * @param key The key for the row to delete. // TODO: Could do this optional to delete a whole group, but that is scary... wait with adding until we need it.
     */
    static async deleteSetting<T>(emptyInstance: T&BaseDataObject|string, key: string): Promise<boolean> {
        const className = emptyInstance.constructor.name
        if(this.checkAndReportClassError(className, 'deleteSingle')) return false

        // DB
        let url = this.getSettingsUrl(className, key)
        const response = await fetch(url, {
            headers: await this.getAuthHeader(true),
            method: 'DELETE'
        })

        // Cache
        if(response.ok) {
            const dictionary = this._settingsDictionaryStore.get(className)
            if(dictionary) delete dictionary[key]
        }

        // Result
        Utils.log(
            response.ok ? `Deleted '${className}:${key}' from DB` : `Failed to delete '${className}:${key}' from DB`,
            response.ok ? this.LOG_GOOD_COLOR : this.LOG_BAD_COLOR
        )
        return response.ok
    }

    /**
     * Returns the relative path to the settings file
     * @param groupClass Main category to load.
     * @param groupKey Specific item to fetch.
     * @param noGroupKey Load items that have on key.
     * @returns
     */
    private static getSettingsUrl(groupClass: string|undefined = undefined, groupKey: string|undefined = undefined, noGroupKey: boolean = false): string {
        let url = './db_settings.php'
        const params: string[] = []
        if(groupClass) params.push(`groupClass=${groupClass}`)
        if(groupKey) params.push(`groupKey=${groupKey}`)
        params.push(`noGroupKey=${noGroupKey?1:0}`)
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
    private static async getAuthHeader(addJsonHeader: boolean = false): Promise<HeadersInit> {
        const headers = new Headers()
        headers.set('Authorization', localStorage.getItem(LOCAL_STORAGE_AUTH_KEY+Utils.getCurrentFolder()) ?? '')
        if (addJsonHeader) headers.set('Content-Type', 'application/json; charset=utf-8')
        return headers
    }

    private static checkAndReportClassError(className: string, action: string): boolean {
        // TODO: Add callstack?
        const isProblem = className == 'Object'
        if(isProblem) {
            Utils.log(`DB: ${action} got ${className} which is invalid.`, Color.DarkRed, true, true)
        }
        return isProblem
    }

    // endregion
}