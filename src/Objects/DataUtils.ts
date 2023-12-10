import DataMap from './DataMap.js'
import Data, {DataEntries, DataRefValues} from './Data.js'
import {IDictionary, INumberDictionary, IStringDictionary} from '../Interfaces/igeneral.js'
import Trigger from './Trigger.js'
import {IDataBaseItem} from '../Classes/DataBaseHelper.js'
import {SettingDictionaryEntry} from './Setting/SettingDictionary.js'

export class DataUtils {
    // region Referencing
    static getNumberRangeRef(min: number, max: number, step: number = 1): string {
        return `number|range=${min},${max},${step}`
    }
    static getStringFileImageRef() {
        return 'string|file=apng,avif,gif,jpg,jpeg,png,svg,webp'
    }
    static getStringFileAudioRef() {
        return 'string|file=mp3,wav,ogg'
    }
    static getStringFileVideoRef() {
        return 'string|file=mp4,webm'
    }

    static parseRef(refStr: string): DataRefValues {
        const refArr = refStr.split('|')
        const refValues = new DataRefValues()
        refValues.original = refStr
        refValues.class = refArr.shift() ?? ''
        for (const t of refArr) {
            const [k, v] = t.split('=')
            switch (k) {
                case 'id':
                    refValues.isIdReference = true
                    break
                case 'key':
                    refValues.idToKey = true
                    break
                case 'label':
                    refValues.useLabel = true
                    break
                case 'like':
                    refValues.genericLike = v
                    break
                case 'option':
                    refValues.option = true
                    break
                case 'secret':
                    refValues.secret = true
                    break
                case 'file':
                    refValues.file = v.split(',')
                    break
                case 'range':
                    refValues.range = v.split(',').map(v => parseInt(v))
                    break
                case 'code':
                    refValues.code = true
                    break
            }
        }
        return refValues
    }
    // endregion

    // region Conversion
    static convertCollection(className: string, propertyName: string, collection: any): any {
        if (!collection) return collection
        const originalProperty = (DataMap.getMeta(className)?.instance as any)[propertyName]
        const originalIsArray = Array.isArray(originalProperty)
        const propertyIsArray = Array.isArray(collection)
        if (!propertyIsArray && originalIsArray) {
            console.warn('Property is an object but should be an array!')
            collection = Object.values(collection)
        }
        if (propertyIsArray && !originalIsArray) {
            console.warn('Property is an array but should be an object!')
            let i = 0
            collection = Object.fromEntries(
                (collection as []).map(v => [i++, v])
            )
        }
        return collection
    }

    /**
     * Returns a dictionary of all the data referenced by their database key.
     * Filters out empty data entries.
     * @param items
     */
    static getKeyDataDictionary<T>(items: IDictionary<IDataBaseItem<T>>): IDictionary<T> {
        return Object.fromEntries(
            Object.values(items).map(
                item => [item.key, item.filledData]
            ).filter(pair => !!pair[1])
        )
    }
    // endregion

    // region Validation

    /*
     * These functions where made to substitute the old access of these datatypes
     */

    static ensureData<T>(entries: number|DataEntries<T>, filled: boolean = true): T|undefined {
        if(typeof entries === 'number') return undefined
        return filled
            ? (entries.dataSingle.filledData ?? undefined)
            : (entries.dataSingle.data ?? undefined)
    }
    static ensureDataArray<T>(entries: number[]|DataEntries<T>, filled: boolean = true): T[] {
        if(Array.isArray(entries)) return []
        const result: T[] = []
        for(const entry of entries.dataArray) {
            if(filled && entry.filledData) result.push(entry.filledData)
            else if(entry.data) result.push(entry.data)
        }
        return result
    }
    static ensureDataDictionary<T>(entries: INumberDictionary|DataEntries<T>, filled: boolean = true): IDictionary<T> {
        if(entries.constructor.name !== DataEntries.name) return {}
        const result: {[key:string]:T} = {}
        for(const [key, entry] of Object.entries(entries.dataDictionary)) {
            result[key] = filled ? entry.filledData : entry.data
        }
        return result
    }

    static ensureID(entries: number|DataEntries<any>): number|undefined {
        if(typeof entries == 'number') return entries
        return entries.dataSingle.id
    }
    static ensureIDArray(entries: number[]|DataEntries<any>): number[] {
        if(Array.isArray(entries)) return entries
        const result: number[] = []
        for(const entry of entries.dataArray) {
            result.push(entry.id)
        }
        return result
    }
    static ensureIDDictionary(entries: INumberDictionary|DataEntries<any>): INumberDictionary {
        if(entries.constructor.name !== DataEntries.name) return entries as INumberDictionary
        const result: {[key:string]:number} = {}
        for(const [key, entry] of Object.entries(entries.dataDictionary)) {
            result[key] = entry.id
        }
        return result
    }

    static ensureKey(entries: number|DataEntries<any>): string {
        if(typeof entries === 'number') return ''
        return entries.dataSingle.key
    }
    static ensureKeyArray(entries: number[]|DataEntries<any>): string[] {
        if(Array.isArray(entries)) return []
        return entries.dataArray.map(v => v.key)
    }
    static ensureKeyDictionary(entries: INumberDictionary|DataEntries<any>): IStringDictionary {
        if(entries.constructor.name !== DataEntries.name) return {}
        const result: {[key:string]:string} = {}
        for(const [key, entry] of Object.entries(entries.dataDictionary)) {
            result[key] = entry.key
        }
        return result
    }

    static ensureItem<T>(entries: number|DataEntries<T>): DataEntries<T>|undefined {
        if(typeof entries === 'number') return undefined
        else return entries
    }
    static ensureItemArray<T>(entries: number[]|DataEntries<T>): DataEntries<T>|undefined {
        if(Array.isArray(entries)) return undefined
        else return entries
    }
    static ensureItemDictionary<T>(entries: INumberDictionary|DataEntries<T>): DataEntries<T>|undefined {
        if(entries.constructor.name !== DataEntries.name) return undefined
        else return entries as DataEntries<T>
    }
    // endregion

    // region Data

    static buildFakeDataEntries<T>(instance: T&Data): DataEntries<T&Data> {
        const entries = new DataEntries<T&Data>()
        // TODO: Apparently using instance.__class() broke here, so not everything coming in retains the Data class.
        entries.dataSingle = {id: 0, key: '', class: instance.constructor.name, pid: null, data: instance, filledData: instance }
        return entries
    }
}