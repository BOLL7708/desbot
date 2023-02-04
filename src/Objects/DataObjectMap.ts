import {IStringDictionary} from '../Interfaces/igeneral.js'
import BaseDataObject from './BaseDataObject.js'

// Types
type TNoFunctions<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T]
type TTypes = 'number'|'boolean'|'string'|string

export default class DataObjectMap {
    private static _instanceMap = new Map<string, BaseDataObject>()
    private static _metaMap = new Map<string, DataObjectMeta>()
    private static addInstance<T>(
        isRoot: boolean = false,
        instance: T&BaseDataObject,
        description: string|undefined = undefined,
        documentation?: Partial<Record<TNoFunctions<T>, string>>,
        types?: Partial<Record<TNoFunctions<T>, TTypes>>
    ) {
        const className = instance.constructor.name
        this._instanceMap.set(className, instance)

        const meta = new DataObjectMeta(
            isRoot,
            description,
            documentation as IStringDictionary|undefined,
            types as IStringDictionary|undefined
        )
        this._metaMap.set(className, meta)
    }
    public static addRootInstance<T>(
        instance: T&BaseDataObject,
        description: string|undefined = undefined,
        documentation?: Partial<Record<TNoFunctions<T>, string>>,
        types?: Partial<Record<TNoFunctions<T>, TTypes>>
    ) {
        this.addInstance(true, instance, description, documentation, types)
    }
    public static addSubInstance<T>(
        instance: T&BaseDataObject,
        documentation?: Partial<Record<TNoFunctions<T>, string>>,
        types?: Partial<Record<TNoFunctions<T>, TTypes>>
    ) {
        this.addInstance(false, instance, undefined, documentation, types)
    }

    /**
     * Get an instance from referencing the class name.
     * @param className
     * @param props
     */
    public static getInstance(
        className: string|undefined,
        props: object|undefined = undefined
    ): BaseDataObject|undefined {
        const invalidClassNames = ['string', 'number', 'boolean']
        if(!className || invalidClassNames.indexOf(className) != -1) return
        if(className && this._instanceMap.has(className)) {
            const instance = this._instanceMap.get(className)
            if(instance) {
                return instance.__new(props)
            } else console.warn(`Class instance was invalid: ${className}`)
        } else console.warn(`Class instance does not exist: ${className}`)
        return undefined
    }

    public static hasInstance(
        className: string|undefined
    ): boolean {
        return className ? this._instanceMap.has(className) : false
    }

    public static getNames(likeFilter?: string, onlyRootNames: boolean = true): string[] {
        let names = Array.from(this._instanceMap.keys())
        // Apply filter on matching string
        if(likeFilter) names = names.filter((name)=>{
            return name.startsWith(likeFilter)
        })

        // Apply filter on being a root object
        if(onlyRootNames) names = names.filter((name)=>{
            return this._metaMap.get(name)?.isRoot ?? false
        })

        return names
    }

    public static getMeta(className: string): DataObjectMeta|undefined {
        return this._metaMap.get(className)
    }
}

export class DataObjectMeta {
    public isRoot: boolean = false
    public description: string|undefined
    public documentation: IStringDictionary|undefined
    public types: IStringDictionary|undefined
    constructor(isRoot: boolean, description?: string, documentation?: IStringDictionary, types?: IStringDictionary) {
        this.isRoot = isRoot
        if(description) this.description = description
        if(documentation) this.documentation = documentation
        if(types) this.types = types
    }
}