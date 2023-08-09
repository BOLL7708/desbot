import DataMap from './DataMap.js'
import {DataRefValues} from './Data.js'

export class DataUtils {
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
}