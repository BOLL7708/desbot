import {IStringDictionary} from '../Interfaces/igeneral.js'
import BaseDataObject from './BaseDataObject.js'

// Types
type TNoFunctions<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T]
type TTypes = 'number'|'boolean'|'string'|string

export default class DataObjectMap {
    private static _instanceMap = new Map<string, BaseDataObject>()
    private static _subInstanceMap = new Map<string, BaseDataObject>()
    private static _metaMap = new Map<string, DataObjectMeta>()
    private static addInstance<T>(
        instance: T&BaseDataObject,
        description: string|undefined = undefined,
        documentation?: Partial<Record<TNoFunctions<T>, string>>,
        types?: Partial<Record<TNoFunctions<T>, TTypes>>,
        isSubClass: boolean = false
    ) {
        const className = instance.constructor.name
        const map = isSubClass ? this._subInstanceMap : this._instanceMap
        map.set(className, instance)

        const meta = new DataObjectMeta(
            description,
            documentation as IStringDictionary|undefined,
            types as IStringDictionary|undefined
        )
        this._metaMap.set(className, meta)
    }
    public static addMainInstance<T>(
        instance: T&BaseDataObject,
        description: string|undefined = undefined,
        documentation?: Partial<Record<TNoFunctions<T>, string>>,
        types?: Partial<Record<TNoFunctions<T>, TTypes>>
    ) {
        this.addInstance(instance, description, documentation, types)
    }
    public static addSubInstance<T>(
        instance: T&BaseDataObject,
        documentation?: Partial<Record<TNoFunctions<T>, string>>,
        types?: Partial<Record<TNoFunctions<T>, TTypes>>
    ) {
        this.addInstance(instance, undefined, documentation, types, true)
    }

    /**
     * Get an instance from referencing the class name.
     * @param className
     * @param props
     * @param isSubClass
     */
    private static getInstance(
        className: string|undefined,
        props: object|undefined = undefined,
        isSubClass: boolean = false
    ): BaseDataObject|undefined {
        const invalidClassNames = ['string', 'number', 'boolean']
        if(!className || invalidClassNames.indexOf(className) != -1) return
        const map = isSubClass ? this._subInstanceMap : this._instanceMap
        if(className && map.has(className)) {
            const instance = map.get(className)
            if(instance) {
                return instance.__new(props)
            } else console.warn(`Class instance was invalid: ${className}`)
        } else console.warn(`Class instance does not exist: ${className}`)
        return undefined
    }
    public static getMainInstance(
        className: string|undefined,
        props: object|undefined = undefined
    ): BaseDataObject|undefined {
        return this.getInstance(className, props)
    }
    public static getSubInstance(
        className: string|undefined,
        props: object|undefined = undefined
    ): BaseDataObject|undefined {
        return this.getInstance(className, props, true)
    }

    public static hasMainInstance(
        className: string|undefined
    ): boolean {
        return className ? this._instanceMap.has(className) : false
    }
    public static hasSubInstance(
        className: string|undefined
    ): boolean {
        return className ? this._subInstanceMap.has(className) : false
    }
    public static getNames(likeFilter?: string): string[] {
        let names = Array.from(this._instanceMap.keys())
        if(likeFilter) names = names.filter((name)=>{
            return name.startsWith(likeFilter)
        })
        return names
    }

    public static getMeta(className: string): DataObjectMeta|undefined {
        return this._metaMap.get(className)
    }
}

export class DataObjectMeta {
    public description: string|undefined
    public documentation: IStringDictionary|undefined
    public types: IStringDictionary|undefined
    constructor(description?: string, documentation?: IStringDictionary, types?: IStringDictionary) {
        if(description) this.description = description
        if(documentation) this.documentation = documentation
        if(types) this.types = types
    }
}