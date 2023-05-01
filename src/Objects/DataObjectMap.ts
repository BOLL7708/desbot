import {IStringDictionary} from '../Interfaces/igeneral.js'
import BaseDataObject from './BaseDataObject.js'
import {BaseMeta} from './BaseMeta.js'

// Types
export type TNoFunctions<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T]
export type TTypes = 'number'|'boolean'|'string'|'string|secret'|'string|file'|string

export default class DataObjectMap {
    private static _map = new Map<string, DataObjectMeta>()
    private static addInstance<T>(
        isRoot: boolean = false,
        instance: T&BaseDataObject,
        description?: string,
        documentation?: Partial<Record<TNoFunctions<T>, string>>,
        types?: Partial<Record<TNoFunctions<T>, TTypes>>
    ) {
        const className = instance.constructor.name
        const meta = new DataObjectMeta(
            instance,
            isRoot,
            description,
            documentation as IStringDictionary|undefined,
            types as IStringDictionary|undefined
        )
        this._map.set(className, meta)
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
     * @param fillReferences
     */
    public static async getInstance(
        className: string|undefined,
        props: object|undefined = undefined,
        fillReferences: boolean = false
    ): Promise<BaseDataObject|undefined> {
        const invalidClassNames: TTypes[] = ['string', 'number', 'boolean']
        if(!className || invalidClassNames.indexOf(className) != -1) return undefined
        if(className && this._map.has(className)) {
            const instance = this._map.get(className)?.instance
            if(instance) {
                return await instance.__new(props, fillReferences)
            } else console.warn(`Class instance was invalid: ${className}`)
        } else console.warn(`Class instance does not exist: ${className}`)
        return undefined
    }

    public static hasInstance(
        className: string|undefined
    ): boolean {
        return className ? this._map.has(className) : false
    }

    public static getNames(likeFilter?: string, onlyRootNames: boolean = true): string[] {
        let names = Array.from(this._map.keys())
        // Apply filter on matching string
        if(likeFilter) names = names.filter((name)=>{
            return name.startsWith(likeFilter)
        })

        // Apply filter on being a root object
        if(onlyRootNames) names = names.filter((name)=>{
            return this._map.get(name)?.isRoot ?? false
        })

        return names
    }

    public static getMeta(className: string): DataObjectMeta|undefined {
        return this._map.get(className)
    }
}

export class DataObjectMeta extends BaseMeta {
    constructor(
        public instance: BaseDataObject,
        public isRoot: boolean,
        public description?: string,
        public documentation?: IStringDictionary,
        public types?: IStringDictionary
    ) {
        super()
    }
}