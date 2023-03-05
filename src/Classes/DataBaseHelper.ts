import {LOCAL_STORAGE_AUTH_KEY} from './DataUtils.js'
import Utils from './Utils.js'
import Color from './ColorConstants.js'
import BaseDataObject from '../Objects/BaseDataObject.js'
import EditorHandler from '../Pages/Editor/EditorHandler.js'
import {INumberDictionary, IStringDictionary} from '../Interfaces/igeneral.js'

/*
TODO
 1. [OK] Vi borde ta emot det nya formatet från databas-funktionerna i PHP, MEN, sen lagra det på samma sätt här.
 2. [OK] Däremot så skapar vi två nya tabeller, Class+Id -> ID, ID -> Class+Id, så vi kan slå upp saker åt båda hållen.
 3. [] Gör så att ladda ut en enhet inte returnerar en class man läser data ur, utan instansen direkt.
 4. [] Testa så att allt fungerar... har ändrat på när saker fylls med fillReferences o_O
 */

export default class DataBaseHelper {
    private static LOG_GOOD_COLOR: string = Color.BlueViolet
    private static LOG_BAD_COLOR: string = Color.DarkRed

    // Main storage
    private static _dataStore: Map<string, { [key:string]: any }> = new Map() // Used for storing keyed entries in memory before saving to disk

    // Editor specific storage
    private static _idKeyStore: Map<string, { [id:string]: string }> = new Map() // Used to store ID reference lists used in the editor
    private static _idLabelStore: Map<string, { [id:string]: string }> = new Map() // Used to store ID reference lists with labels used in the editor

    // Reference maps, if an object has been loaded once, it exists in these maps.
    private static _keyToIdMap: Map<[string, string], number> = new Map()
    private static _idToKeyMap: Map<number, [string, string]> = new Map()

    // Global flags
    private static _fillReferences: boolean = false

    static async testConnection(): Promise<boolean> {
        const response = await fetch(this.getUrl(), {
            method: 'HEAD',
            headers: {
                Authorization: Utils.getAuth()
            }
        })
        return response.ok
    }
    static setFillReferences(fill: boolean) {
        this._fillReferences = fill
    }

    // region Json Store
    static async loadJson(groupClass: string, groupKey: string|undefined = undefined, noData: boolean = false): Promise<any|undefined> {
        let url = this.getUrl()
        const response = await fetch(url, {
            headers: await this.getHeader({groupClass, groupKey, noData})
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
        const options: IDataBaseHelperHeaders = {groupClass, groupKey, addJsonHeader: true}
        if(newGroupKey && groupKey != newGroupKey) {
            options['newGroupKey'] = newGroupKey
        }
        let url = this.getUrl()
        const response = await fetch(url, {
            headers: await this.getHeader(options),
            method: 'POST',
            body: jsonStr
        })
        if(response.ok) {
            const jsonData = await response.json()
            groupKey = jsonData.groupKey
            if(groupKey) { // Load item and store in reference lists
                const newItemResponse = await this.loadJson(groupClass, groupKey, true)
                if(newItemResponse.ok) {
                    const newItemJson = await newItemResponse.json()
                    if(Array.isArray(newItemJson) && newItemJson.length > 0)
                    this.handleDataBaseItem(newItemJson[0])
                }
            }
        }
        return response.ok ? groupKey : undefined
    }
    static async deleteJson(groupClass: string, groupKey: string): Promise<boolean> {
        let url = this.getUrl()
        const response = await fetch(url, {
            headers: await this.getHeader({groupClass, groupKey, addJsonHeader: true}),
            method: 'DELETE'
        })
        return response.ok
    }
    // endregion

    // region Instance Functions

    /**
     * Register the meta in maps and return a cast object in case data is available.
     * @param item
     * @private
     */
    private static handleDataBaseItem<T>(item: IDataBaseItem<T>):T|undefined {
        this._idToKeyMap.set(item.id, [item.class, item.key])
        this._keyToIdMap.set([item.class, item.key], item.id)
        return item.data ? item.data as T : undefined
    }

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
            const cacheDictionary = this._dataStore.get(className) as { [key: string]: T }
            const resultDictionary: { [key:string]: T } = {}
            for(const [key, setting] of Object.entries(cacheDictionary)) {
                resultDictionary[key] = await emptyInstance.__new(setting as T&object, this._fillReferences)
            }
            return resultDictionary
        }

        // DB
        const jsonResult = await this.loadJson(className) as IDataBaseItem<T>[]|undefined
        if(jsonResult && jsonResult.length > 0) {
            const resultDictionary: { [key: string]: T } = {}
            const cacheDictionary: { [key: string]: T } = {}

            // Convert plain objects to class instances and cache them
            for(const item of jsonResult) {
                const plainObject = this.handleDataBaseItem(item) as T&object
                const filledObject = await emptyInstance.__new(plainObject, this._fillReferences)
                if(filledObject) {
                    cacheDictionary[item.key] = await emptyInstance.__new(plainObject)
                    resultDictionary[item.key] = filledObject
                }
            }
            this._dataStore.set(className, cacheDictionary)
            return resultDictionary
        }
        return undefined
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
     * The original load function that now loads the full item but returns only the data.
     * @param emptyInstance
     * @param key
     * @param ignoreCache
     */
    static async load<T>(emptyInstance: T&BaseDataObject, key: string, ignoreCache: boolean = false): Promise<T|undefined> {
        const item = await this.loadItem(emptyInstance, key, ignoreCache)
        if(item) {
            return item.data as T
        }
        return undefined
    }

    /**
     * Load one specific blob from the database, or from the cache if it already exists.
     * @param emptyInstance Instance of the class to load.
     * @param key The key for the row to load.
     * @param ignoreCache Will not use the in-memory cache.
     */
    static async loadItem<T>(emptyInstance: T&BaseDataObject, key: string, ignoreCache: boolean = false): Promise<IDataBaseItem<T>|undefined> {
        const className = emptyInstance.constructor.name
        if (this.checkAndReportClassError(className, 'loadSingle')) return undefined

        // Cache
        if (!ignoreCache && this._dataStore.has(className)) {
            const dictionary = this._dataStore.get(className) as { [key: string]: T }
            if (dictionary && Object.keys(dictionary).indexOf(key) !== -1) {
                const data = await emptyInstance.__new(dictionary[key] ?? undefined, this._fillReferences)
                return {
                    id: this._keyToIdMap.get([className, key]) ?? 0,
                    key: key,
                    class: className,
                    data: data
                }
            }
        }

        // DB
        const jsonResult = await this.loadJson(className, key) as IDataBaseItem<T>[]|undefined
        if(jsonResult && jsonResult.length == 1) {

            // Convert plain object to class instance
            const item = jsonResult[0]
            const plainObject = this.handleDataBaseItem(item) as T&object
            const filledObject = await emptyInstance.__new(plainObject, this._fillReferences)

            // Ensure dictionary exists
            if (!this._dataStore.has(className)) {
                const newDic: { [key: string]: T } = {}
                this._dataStore.set(className, newDic)
            }
            const cacheDictionary = this._dataStore.get(className)

            // Save a new instance in the cache so the returned instance can be modified without affecting the cache.
            if (cacheDictionary) cacheDictionary[key] = await emptyInstance.__new(plainObject)
            item.data = filledObject
            return item
        }
        return undefined
    }

    static async loadById(rowId?: string|number): Promise<IDataBaseItem<unknown>|undefined> {
        if(!rowId) return undefined
        let url = this.getUrl()
        const response = await fetch(url, {
            headers: await this.getHeader({rowIds: rowId})
        })
        const jsonResult = await response.json()
        if(jsonResult && jsonResult.length > 0) {
            const item = jsonResult[0]
            this.handleDataBaseItem(item)
            return item
        }
        return undefined
    }

    /**
     * Load all available group classes registered in the database.
     */
    static async loadClassesWithCounts(like: string): Promise<INumberDictionary> {
        const url = this.getUrl()
        const response = await fetch(url, {
            headers: await this.getHeader({groupClass: like+'*'})
        })
        return response.ok ? await response.json() : {}
    }

    /**
     * Load all available IDs for a group class registered in the database.
     */
    static async loadIDsWithLabelForClass(groupClass: string, rowIdLabel?: string): Promise<IStringDictionary> {
        if(rowIdLabel) {
            if(this._idLabelStore.has(groupClass)) return this._idLabelStore.get(groupClass) ?? {}
        } else {
            if(this._idKeyStore.has(groupClass)) return this._idKeyStore.get(groupClass) ?? {}
        }

        const url = this.getUrl()
        const response = await fetch(url, {
            headers: await this.getHeader({
                groupClass,
                rowIdList: true,
                rowIdLabel
            })
        })
        const json = response.ok ? await response.json() : {}
        if(rowIdLabel) this._idLabelStore.set(groupClass, json)
        else this._idKeyStore.set(groupClass, json)

        return json
    }

    /**
     * Load a single ID for a group class and key, will use cache if that is set.
     */
    static async loadID(groupClass: string, groupKey: string): Promise<number> {
        const tuple: [string, string] = [groupClass, groupKey]

        // Return cache if it is set
        if(this._keyToIdMap.has(tuple)) return this._keyToIdMap.get(tuple) ?? 0

        // Load from DB
        const jsonResult = await this.loadJson(groupClass, groupKey, true)
        if(jsonResult && jsonResult.length > 0) {
            const item = jsonResult[0]
            this.handleDataBaseItem(item) // Store cache
            return item.id ?? 0
        }
        return 0
    }

    /**
     * Clears the cache of IDs loaded for a class or all classes so they will be reloaded, to show recent additions or deletions.
     * @param groupClass
     */
    static clearReferences(groupClass?: string): boolean {
        if(groupClass) {
            this._idKeyStore.delete(groupClass)
            this._idLabelStore.delete(groupClass)
            return true
        }
        return false
    }
    
    static async loadIDClasses(idArr: string[]): Promise<IStringDictionary> {
        const output: IStringDictionary = {}
        const toLoad: string[] = []
        for(const idStr of idArr) {
            const id = parseInt(idStr)
            if(this._idToKeyMap.has(id)) {
                const tuple = this._idToKeyMap.get(id)
                output[id] = Array.isArray(tuple) ? tuple[0] : ''
            } else {
                toLoad.push(idStr)
            }
        }
        if(toLoad.length > 0) {
            const url = this.getUrl()
            const response = await fetch(url, {
                headers: await this.getHeader({
                    rowIds: toLoad.join(','),
                    noData: true
                })
            })
            if(response.ok) {
                const jsonResult = await response.json()
                if(jsonResult && jsonResult.length > 0) {
                    for(const item of jsonResult) {
                        this.handleDataBaseItem(item)
                        if(item) {
                            output[item.id] = item.class
                        }
                    }
                }
            }
        }
        return output
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

        // Clear cache
        if(ok) {
            const dictionary = this._dataStore.get(className)
            if(dictionary) delete dictionary[key]
            const tuple: [string, string] = [className, key]
            const id = this._keyToIdMap.get(tuple) ?? 0
            this._idToKeyMap.delete(id)
            this._keyToIdMap.delete(tuple)
        }

        // Result
        Utils.log(
            ok ? `Deleted '${className}:${key}' from DB` : `Failed to delete '${className}:${key}' from DB`,
            ok ? this.LOG_GOOD_COLOR : this.LOG_BAD_COLOR
        )
        return ok
    }

    // endregion

    // region Helpers

    /**
     * Returns the relative path to the PHP file, this used to have functionality.
     * @returns string
     */
    private static getUrl(): string {
        return '_db.php'
    }

    /**
     * Get authorization header with optional JSON content type.
     * @param options
     * @private
     */
    private static async getHeader(
        options: IDataBaseHelperHeaders
    ): Promise<HeadersInit> {
        const headers = new Headers()
        headers.set('Authorization', localStorage.getItem(LOCAL_STORAGE_AUTH_KEY+Utils.getCurrentFolder()) ?? '')
        if(options.groupClass !== undefined) headers.set('X-Group-Class', options.groupClass)
        if(options.groupKey !== undefined) headers.set('X-Group-Key', options.groupKey)
        if(options.newGroupKey !== undefined) headers.set('X-New-Group-Key', options.newGroupKey)
        if(options.addJsonHeader) headers.set('Content-Type', 'application/json; charset=utf-8')
        if(options.rowIds !== undefined) headers.set('X-Row-Ids', options.rowIds.toString())
        if(options.rowIdList !== undefined) headers.set('X-Row-Id-List', options.rowIdList ? '1' : '0')
        if(options.rowIdLabel !== undefined) headers.set('X-Row-Id-Label', options.rowIdLabel)
        if(options.noData !== undefined) headers.set('X-No-Data', options.noData ? '1' : '0')
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

interface IDataBaseHelperHeaders {
    groupClass?: string
    groupKey?: string
    newGroupKey?: string
    rowIds?: number|string
    rowIdList?: boolean
    rowIdLabel?: string
    noData?: boolean
    addJsonHeader?: boolean
}

export interface IDataBaseItem<T> {
    id: number
    class: string
    key: string
    data: (T&BaseDataObject)|null
}
export interface IDataBaseLabelItem {
    id: number
    key: string
    label: string
}