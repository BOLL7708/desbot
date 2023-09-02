import DataMap from './DataMap.js'
import {DataRefValues, IData} from './Data.js'

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
    // endregion

    // region Validation
    static ensureEntries<T>(value: number|number[]|IData<T>): IData<T>|undefined {
        if(typeof value !== 'object' || value === null || Array.isArray(value)) return undefined
        else return value
    }
    static ensureValues<T>(value: number|number[]|IData<T>): T[]|undefined {
        const data = DataUtils.ensureEntries(value)
        if(!data) return undefined
        else return Object.values(data)
    }
    static ensureKeys<T>(value: number|number[]|IData<T>): number[]|undefined {
        const data = DataUtils.ensureEntries(value)
        if(!data) return undefined
        else return Object.keys(data).map(v => parseInt(v))
    }

    static ensureEntry<T>(value: number|number[]|IData<T>): {id: number, data: T}|undefined {
        if(typeof value !== 'object' || value === null || Array.isArray(value)) return undefined
        else {
            const entries = Object.entries(value)
            if(entries.length === 0) return undefined
            const id = parseInt(entries[0][0])
            const data = entries[0][1]
            return {id, data}
        }
    }
    static ensureValue<T>(value: number|number[]|IData<T>): T|undefined {
        const data = DataUtils.ensureEntry(value)
        if(!data) return undefined
        else return data.data
    }
    static ensureKey<T>(value: number|number[]|IData<T>): number|undefined {
        const data = DataUtils.ensureEntry(value)
        if(!data) return undefined
        else return data.id
    }
    // endregion
}