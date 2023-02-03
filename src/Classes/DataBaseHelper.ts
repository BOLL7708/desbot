import {LOCAL_STORAGE_AUTH_KEY} from './DataUtils.js'
import Utils from './Utils.js'
import Color from './ColorConstants.js'
import BaseDataObject from '../Objects/BaseDataObject.js'
import EditorHandler from '../Pages/Editor/EditorHandler.js'

export default class DataBaseHelper {
    private static LOG_GOOD_COLOR: string = Color.BlueViolet
    private static LOG_BAD_COLOR: string = Color.DarkRed

    private static _dataStore: Map<string, { [key:string]: any }> = new Map() // Used for storing keyed entries in memory before saving to disk

    static async testConnection(): Promise<boolean> {
        const response = await fetch(this.getUrl(), {
            method: 'HEAD',
            headers: {
                Authorization: Utils.getAuth()
            }
        })
        return response.ok
    }

    // region Json Store
    static async loadJson(groupClass: string, groupKey: string|undefined = undefined): Promise<any|undefined> {
        let url = this.getUrl()
        const response = await fetch(url, {
            headers: await this.getHeader(groupClass, groupKey)
        })
        const responseText = await response.text()
        return responseText.length > 0 ? JSON.parse(responseText) : undefined;
    }

    /**
     * Save to database
     * @param jsonStr Data to store.
     * @param groupClass Main category to load.
     * @param groupKey Specific item to fetch.
     * @param newGroupKey New key to replace old with.
     */
    static async saveJson(
        jsonStr: string,
        groupClass: string,
        groupKey: string|undefined,
        newGroupKey: string|undefined = undefined
    ): Promise<string|undefined> {
        const extras: { [key: string]: string } = {}
        if(newGroupKey && groupKey != newGroupKey) {
            extras['X-New-Group-Key'] = newGroupKey
        }

        let url = this.getUrl()
        const response = await fetch(url, {
            headers: await this.getHeader(groupClass, groupKey, true, extras),
            method: 'POST',
            body: jsonStr
        })
        if(response.ok) {
            const jsonData = await response.json()
            groupKey = jsonData.groupKey
        }
        return response.ok ? groupKey : undefined
    }
    static async deleteJson(groupClass: string, groupKey: string): Promise<boolean> {
        let url = this.getUrl()
        const response = await fetch(url, {
            headers: await this.getHeader(groupClass, groupKey, true),
            method: 'DELETE'
        })
        return response.ok
    }

    // TODO: This should uh... list all the IDs for a group? Also a label field, yeah.
    static async loadJsonList(groupClass: string): Promise<any|undefined> {
        let url = this.getUrl()
        const response = await fetch(url, {
            headers: await this.getHeader(groupClass, undefined, false, {

            })
        })
        const responseText = await response.text()
        return responseText.length > 0 ? JSON.parse(responseText) : undefined;
    }
    // endregion

    // region Instance Functions
    /**
     * Load a dictionary of entries from the database, this will retain keys.
     * @param emptyInstance Instance of the class to load.
     * @param ignoreCache Will not use the in-memory cache.
     */
    static async loadAll<T>(emptyInstance: T&BaseDataObject, ignoreCache: boolean = false): Promise<{ [key: string]: T }|undefined> {
        const className = emptyInstance.constructor.name
        if(this.checkAndReportClassError(className, 'loadDictionary')) return undefined

        // Cache
        if(!ignoreCache && this._dataStore.has(className)) {
            return this._dataStore.get(className) as { [key: string]: T }
        }

        // DB
        const jsonResult = await this.loadJson(className)
        const result = jsonResult ? jsonResult as { [key: string]: T } : undefined
        if(result) {
            // Convert plain objects to class instances and cache them
            for(const [key, setting] of Object.entries(result)) {
                result[key] = emptyInstance.__new(setting as T&object)
            }
            this._dataStore.set(className, result)
        }
        return result
    }

    /**
     * Load a main blob from the database, or cache if it exists.
     * @param emptyInstance Instance of the class to load.
     * @param ignoreCache Will not use the in-memory cache.
     */
    static async loadMain<T>(emptyInstance: T&BaseDataObject, ignoreCache: boolean = false): Promise<T> {
        return await this.load(emptyInstance, EditorHandler.MainKey, ignoreCache) ?? emptyInstance
    }

    /**
     * Load one specific blob from the database, or cache if it exists.
     * @param emptyInstance Instance of the class to load.
     * @param key The key for the row to load.
     * @param ignoreCache Will not use the in-memory cache.
     */
    static async load<T>(emptyInstance: T&BaseDataObject, key: string, ignoreCache: boolean = false): Promise<T|undefined> {
        const className = emptyInstance.constructor.name
        if (this.checkAndReportClassError(className, 'loadSingle')) return undefined

        // Cache
        if (!ignoreCache && this._dataStore.has(className)) {
            const dictionary = this._dataStore.get(className) as { [key: string]: T }
            if (dictionary && Object.keys(dictionary).indexOf(key) !== -1) {
                return dictionary[key]
            }
        }

        // DB
        const jsonResult = await this.loadJson(className, key)
        let result: T|undefined = jsonResult ? jsonResult as T : undefined
        if (result) {
            // Convert plain object to class instance
            if (!Utils.isEmptyObject(result)) {
                result = emptyInstance.__new(result as T&object)
            }
            if (!this._dataStore.has(className)) {
                const newDic: { [key: string]: T } = {}
                this._dataStore.set(className, newDic)
            }
            const dictionary = this._dataStore.get(className)
            if (dictionary && !Utils.isEmptyObject(result)) dictionary[key] = result
        }
        return Utils.isEmptyObject(result) ? undefined : result
    }

    /**
     * Load all available settings classes registered in the database.
     */
    static async loadClasses(like: string): Promise<{[group:string]: number}> {
        const url = this.getUrl()
        const response = await fetch(url, {
            headers: await this.getHeader(like+'*')
        })
        return response.ok ? await response.json() : []
    }

    /**
     * Save a setting to the database.
     * @param setting Instance of the class to save.
     * @param key Optional key for the setting to save, will upsert if key is set, else insert.
     * @param newKey
     */
    static async save<T>(setting: T&BaseDataObject, key?: string, newKey?: string): Promise<boolean> {
        const className = setting.constructor.name
        if(this.checkAndReportClassError(className, 'saveSingle')) return false

        // DB
        key = await this.saveJson(JSON.stringify(setting), className, key, newKey)

        // Cache
        if(key) {
            if(!this._dataStore.has(className)) this._dataStore.set(className, {})
            const dictionary = this._dataStore.get(className)
            if(dictionary) dictionary[key] = setting
        }

        // Result
        Utils.log(
            key ? `Wrote '${className}' to DB` : `Failed to write '${className}' to DB`,
            key ? this.LOG_GOOD_COLOR : this.LOG_BAD_COLOR
        )
        return !!key
    }

    /**
     * Delete specific setting
     * @param emptyInstance Instance of the class to delete.
     * @param key The key for the row to delete. // TODO: Could do this optional to delete a whole group, but that is scary... wait with adding until we need it.
     */
    static async delete<T>(emptyInstance: T&BaseDataObject|string, key: string): Promise<boolean> {
        const className = emptyInstance.constructor.name
        if(this.checkAndReportClassError(className, 'deleteSingle')) return false

        // DB
        const ok = await this.deleteJson(className, key)

        // Cache
        if(ok) {
            const dictionary = this._dataStore.get(className)
            if(dictionary) delete dictionary[key]
        }

        // Result
        Utils.log(
            ok ? `Deleted '${className}:${key}' from DB` : `Failed to delete '${className}:${key}' from DB`,
            ok ? this.LOG_GOOD_COLOR : this.LOG_BAD_COLOR
        )
        return ok
    }

    /**
     * Returns the relative path to the PHP file, this used to have functionality.
     * @returns string
     */
    private static getUrl(): string {
        return './db.php'
    }

    // endregion

    // region Helpers

    /**
     * Get authorization header with optional JSON content type.
     * @param groupClass
     * @param groupKey
     * @param addJsonHeader
     * @param extras
     * @private
     */
    private static async getHeader(
        groupClass: string|undefined = undefined,
        groupKey: string|undefined = undefined,
        addJsonHeader: boolean = false,
        extras: {[key:string]:string} = {}
    ): Promise<HeadersInit> {
        const headers = new Headers()
        headers.set('Authorization', localStorage.getItem(LOCAL_STORAGE_AUTH_KEY+Utils.getCurrentFolder()) ?? '')
        if(groupClass !== undefined) headers.set('X-Group-Class', groupClass)
        if(groupKey !== undefined) headers.set('X-Group-Key', groupKey)
        if(addJsonHeader) headers.set('Content-Type', 'application/json; charset=utf-8')
        if(Object.keys(extras).length > 0) {
            for(const [key, value] of Object.entries(extras)) {
                headers.set(key, value)
            }
        }
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