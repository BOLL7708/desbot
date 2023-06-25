import {LOCAL_STORAGE_AUTH_KEY} from './DataUtils.js'
import Utils from './Utils.js'
import Color from './ColorConstants.js'
import Data from '../Objects/Data.js'
import {INumberDictionary, IStringDictionary} from '../Interfaces/igeneral.js'
import {ConfigEditor} from '../Objects/Config/ConfigEditor.js'
import DataMap from '../Objects/DataMap.js'

/*
TODO
 1. [OK] Vi borde ta emot det nya formatet från databas-funktionerna i PHP, MEN, sen lagra det på samma sätt här.
 2. [OK] Däremot så skapar vi två nya tabeller, Class+Id -> ID, ID -> Class+Id, så vi kan slå upp saker åt båda hållen.
 3. [] Gör så att ladda ut en enhet inte returnerar en class man läser data ur, utan instansen direkt.
 4. [] Testa så att allt fungerar... har ändrat på när saker fylls med fillReferences o_O
 */

export default class DataBaseHelper {
    static readonly OBJECT_MAIN_KEY: string = 'Main'
    private static readonly LOG_GOOD_COLOR: string = Color.BlueViolet
    private static readonly LOG_BAD_COLOR: string = Color.DarkRed

    // Main storage
    private static _dataStore: Map<string, { [key:string]: any }> = new Map() // Used for storing keyed entries in memory before saving to disk

    // Editor specific storage
    private static _idKeyLabelStore: Map<[string, number], IDataBaseListItems> = new Map() // Used to store ID reference lists used in the editor

    // Reference maps, if an object has been loaded once, it exists in these maps.
    private static _groupKeyTupleToMetaMap: Map<[string, string], IDataBaseItem<any>> = new Map()
    private static _idToMetaMap: Map<number, IDataBaseItem<any>> = new Map()

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
    static async loadJson(
        groupClass: string,
        groupKey?: string,
        parentId?: number,
        noData?: boolean): Promise<any|undefined> {
        let url = this.getUrl()
        const options: IDataBaseHelperHeaders = {groupClass, groupKey, noData}
        if(parentId && !isNaN(parentId) && parentId > 0) {
            options.parentId = parentId
        }
        const response = await fetch(url, {
            headers: await this.getHeader(options)
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
     * @param parentId Optional ID for a parent row.
     */
    static async saveJson(
        jsonStr: string,
        groupClass: string,
        groupKey?: string,
        newGroupKey?: string,
        parentId?: number
    ): Promise<string|undefined> {
        const options: IDataBaseHelperHeaders = {groupClass, groupKey, addJsonHeader: true}
        if(newGroupKey && groupKey != newGroupKey) {
            options.newGroupKey = newGroupKey
        }
        if(parentId && !isNaN(parentId) && parentId > 0) {
            options.parentId = parentId
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
                const newItemResponse = await this.loadJson(groupClass, groupKey, parentId, true)
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

    static async search(searchQuery: string, surroundWithWildcards: boolean = true): Promise<IDataBaseItemRaw[]> {
        if(surroundWithWildcards) searchQuery = `*${searchQuery}*`
        let url = this.getUrl()
        const response = await fetch(url, {
            headers: await this.getHeader({searchQuery}),
            method: 'GET'
        })
        const json = await response.json()
        return json as IDataBaseItemRaw[]
    }
    // endregion

    // region Instance Functions

    /**
     * Register the meta in maps and return a cast object in case data is available.
     * @param item
     * @private
     */
    private static handleDataBaseItem<T>(item: IDataBaseItem<T>):T|undefined {
        const itemClone = Utils.clone<IDataBaseItem<T>>(item)
        itemClone.data = null
        this._idToMetaMap.set(item.id, itemClone)
        this._groupKeyTupleToMetaMap.set([item.class, item.key], itemClone)
        return item.data ? item.data as T : undefined
    }

    /**
     * Load a dictionary of entries from the database, this will retain keys.
     * @param emptyInstance Instance of the class to load.
     * @param parentId Filter on items with this parent id.
     * @param ignoreCache Will not use the in-memory cache.
     */
    static async loadAll<T>(
        emptyInstance: T&Data,
        parentId?: number,
        ignoreCache?: boolean
    ): Promise<{ [key: string]: T }|undefined> {
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
        if(Array.isArray(jsonResult)) {
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
    static async loadMain<T>(emptyInstance: T&Data, ignoreCache: boolean = false): Promise<T> {
        return await this.load(emptyInstance, this.OBJECT_MAIN_KEY, undefined, ignoreCache) ?? emptyInstance
    }

    /**
     * The original load function that now loads the full item but returns only the data.
     * @param emptyInstance
     * @param key
     * @param parentId
     * @param ignoreCache
     */
    static async load<T>(
        emptyInstance: T&Data,
        key: string,
        parentId?: number,
        ignoreCache?: boolean
    ): Promise<T|undefined> {
        const item = await this.loadItem(emptyInstance, key, parentId, ignoreCache)
        if(item) {
            return item.data as T
        }
        return undefined
    }

    static async loadOrEmpty<T>(
        emptyInstance: T&Data,
        key: string,
        parentId?: number,
        ignoreCache?: boolean
    ): Promise<T> {
        return await this.load(emptyInstance, key, parentId, ignoreCache) ?? emptyInstance
    }

    /**
     * Load one specific blob from the database, or from the cache if it already exists.
     * @param emptyInstance Instance of the class to load.
     * @param key The key for the row to load.
     * @param parentId Only load the item if it has this parent id.
     * @param ignoreCache Will not use the in-memory cache.
     */
    static async loadItem<T>(
        emptyInstance: T&Data,
        key: string,
        parentId?: number,
        ignoreCache?: boolean
    ): Promise<IDataBaseItem<T>|undefined> {
        const className = emptyInstance.constructor.name
        if (this.checkAndReportClassError(className, 'loadSingle')) return undefined

        // Cache
        if (!ignoreCache && this._dataStore.has(className)) {
            const dictionary = this._dataStore.get(className) as { [key: string]: T }
            if (dictionary && Object.keys(dictionary).indexOf(key) !== -1) {
                const data = await emptyInstance.__new(dictionary[key] ?? undefined, this._fillReferences)
                const item = this._groupKeyTupleToMetaMap.get([className, key])
                if(item) {
                    const itemClone = Utils.clone(item)
                    itemClone.data = data
                    return itemClone
                }
            }
        }

        // DB
        const jsonResult = await this.loadJson(className, key, parentId) as IDataBaseItem<T>[]|undefined
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

    static async loadById(rowId?: string|number, parentId?: number): Promise<IDataBaseItem<unknown>|undefined> {
        if(!rowId) return undefined
        let url = this.getUrl()
        const options: IDataBaseHelperHeaders = {rowIds: rowId}
        if(parentId && !isNaN(parentId) && parentId > 0) {
            options.parentId = parentId
        }
        const response = await fetch(url, {
            headers: await this.getHeader(options)
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
    static async loadIDsWithLabelForClass(groupClass: string, rowIdLabel?: string, parentId?: number): Promise<IDataBaseListItems> {
        const tuple: [string, number] = [groupClass, parentId ?? 0]
        if(this._idKeyLabelStore.has(tuple)) return this._idKeyLabelStore.get(tuple) ?? {}

        const url = this.getUrl()
        const options: IDataBaseHelperHeaders = {
            groupClass,
            rowIdList: true,
            rowIdLabel,
            parentId
        }
        const response = await fetch(url, {
            headers: await this.getHeader(options)
        })
        const json = response.ok ? await response.json() : {}
        this._idKeyLabelStore.set(tuple, json)

        return json
    }

    /**
     * Loads raw JSON a group class and key, will use cache if that is set.
     */
    static async loadRawItem(groupClass: string, groupKey: string): Promise<IDataBaseItem<any>|undefined> {
        const tuple: [string, string] = [groupClass, groupKey]

        // Return cache if it is set
        if(this._groupKeyTupleToMetaMap.has(tuple)) {
            const cachedItem = this._groupKeyTupleToMetaMap.get(tuple)
            if(cachedItem) return cachedItem
        }

        // Load from DB
        const jsonResult = await this.loadJson(groupClass, groupKey, 0, true)
        if(jsonResult && jsonResult.length > 0) {
            const item = jsonResult[0]
            this.handleDataBaseItem(item) // Store cache
            return item
        }
        return undefined
    }

    /**
     * Clears the cache of IDs loaded for a class or all classes so they will be reloaded, to show recent additions or deletions.
     * @param groupClass
     * @param parentId
     */
    static clearReferences(groupClass?: string, parentId?: number): boolean {
        if(groupClass) {
            this._idKeyLabelStore.delete([groupClass, parentId ?? 0])
            return true
        }
        return false
    }

    /**
     * Used to get which classes a reference list of IDs has in the editor.
     * @param idArr
     */
    static async loadIDClasses(idArr: string[]): Promise<IStringDictionary> {
        const output: IStringDictionary = {}
        const toLoad: string[] = []
        for(const idStr of idArr) {
            const id = parseInt(idStr)
            if(this._idToMetaMap.has(id)) {
                const item = this._idToMetaMap.get(id)
                output[id] = item?.class ?? ''
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
     * @param parentId
     */
    static async save<T>(setting: T&Data, key?: string, newKey?: string, parentId?: number): Promise<boolean> {
        const className = setting.constructor.name
        if(this.checkAndReportClassError(className, 'saveSingle')) return false

        // DB
        key = await this.saveJson(JSON.stringify(setting), className, key, newKey, parentId)

        // Cache
        if(key) {
            if(!this._dataStore.has(className)) this._dataStore.set(className, {})
            const dictionary = this._dataStore.get(className)
            if(dictionary) dictionary[key] = setting
        }

        // Result
        Utils.log(
            key ? `Wrote '${className}' with key '${key}' to DB` : `Failed to write '${className}' with key '${key}' to DB`,
            key ? this.LOG_GOOD_COLOR : this.LOG_BAD_COLOR
        )
        return !!key
    }

    static async saveMain<T>(setting: T&Data, parentId?: number): Promise<boolean> {
        return this.save(setting, this.OBJECT_MAIN_KEY, undefined, parentId)
    }

    /**
     * Delete specific setting
     * @param emptyInstance Instance of the class to delete.
     * @param key The key for the row to delete. // TODO: Could do this optional to delete a whole group, but that is scary... wait with adding until we need it.
     */
    static async delete<T>(emptyInstance: T&Data|string, key: string): Promise<boolean> {
        const className = emptyInstance.constructor.name
        if(this.checkAndReportClassError(className, 'deleteSingle')) return false

        // DB
        const ok = await this.deleteJson(className, key)

        // Clear cache
        if(ok) {
            const dictionary = this._dataStore.get(className)
            if(dictionary) delete dictionary[key]
            const tuple: [string, string] = [className, key]
            const id = this._groupKeyTupleToMetaMap.get(tuple)?.id ?? 0
            this._idToMetaMap.delete(id)
            this._groupKeyTupleToMetaMap.delete(tuple)
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
        if(options.parentId !== undefined) headers.set('X-Parent-Id', options.parentId.toString())
        if(options.searchQuery !== undefined) headers.set('X-Search-Query', options.searchQuery)
        if(options.nextGroupKey !== undefined) headers.set('X-Next-Group-Key', options.nextGroupKey ? '1' : '0')
        return headers
    }

    private static checkAndReportClassError(className: string, action: string): boolean {
        // TODO: Add callstack?
        const isProblem = className == 'Object'
        if(isProblem) {
            Utils.log(`DB: "${action}" got class "${className}" which is invalid.`, Color.DarkRed, true, true)
        }
        if(!DataMap.hasInstance(className)) {
            Utils.log(`DB: "${action}" got class "${className}" which does not exist in the DataObjectMap! Is it added to RegisterObjects?`, Color.DarkRed, true, true)
        }
        return isProblem
    }

    static async getNextKey(groupClass: string, parentId: number, shorten: boolean): Promise<IDataBaseNextKeyItem|undefined> {
        const parent = await this.loadById(parentId)
        let tail = groupClass
        if(shorten) tail = Utils.splitOnCaps(groupClass).splice(1).join('')
        let newKey = `${parent?.key ?? 'New'} ${tail}`
        let url = this.getUrl()
        const response = await fetch(url, {
            headers: await this.getHeader({groupClass, groupKey: newKey, nextGroupKey: true})
        })
        return response.ok ? await response.json() : undefined
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
    parentId?: number
    searchQuery?: string
    nextGroupKey?: boolean
}

export interface IDataBaseItem<T> {
    id: number
    class: string
    key: string
    pid: number|null
    data: (T&Data)|null
}
export interface IDataBaseItemRaw extends IDataBaseItem<any> {
    data: string
}
export interface IDataBaseListItems {
    [id: string]: IDataBaseListItem
}
export interface IDataBaseListItem {
    key: string
    label: string
    pid: number|null
}
export interface IDataBaseNextKeyItem {
    key: string
}
