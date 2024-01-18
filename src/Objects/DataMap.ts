import {IDictionary, IStringDictionary} from '../Interfaces/igeneral.js'
import Data from './Data.js'
import {DataMeta} from './DataMeta.js'

// Types
export type TNoFunctions<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T]
export type TTypes = 'number'|'boolean'|'string'|'string|secret'|'string|code'|string

export default class DataMap {
    private static _map = new Map<string, DataObjectMeta>()
    private static addInstance<T>(
        isRoot: boolean = false,
        instance: T&Data,
        description?: string,
        documentation?: Partial<Record<TNoFunctions<T>, string>>,
        types?: Partial<Record<TNoFunctions<T>, TTypes>>,
        label?: TNoFunctions<T>,
        keyMap?: IStringDictionary,
        tools?: Partial<Record<TNoFunctions<T>, IRootTool>>
    ) {
        const className = instance.constructor.name
        const meta = new DataObjectMeta(
            instance,
            isRoot,
            description,
            documentation as IStringDictionary|undefined,
            types as IStringDictionary|undefined,
            label as string|undefined,
            keyMap as IStringDictionary|undefined,
            tools as IDictionary<IRootTool>
        )
        this._map.set(className, meta)
    }
    public static addRootInstance<T>({instance, description, documentation, types, label, keyMap, tools}: {
        instance: T&Data,
        description?: string,
        documentation?: Partial<Record<TNoFunctions<T>, string>>,
        types?: Partial<Record<TNoFunctions<T>, TTypes>>,
        label?: TNoFunctions<T>,
        keyMap?: IStringDictionary,
        tools?: Partial<Record<TNoFunctions<T>, IRootTool>>
    }) {
        this.addInstance(true, instance, description, documentation, types, label, keyMap, tools)
    }
    public static addSubInstance<T>({instance, documentation, types}: {
        instance: T&Data,
        documentation?: Partial<Record<TNoFunctions<T>, string>>,
        types?: Partial<Record<TNoFunctions<T>, TTypes>>
    }) {
        this.addInstance(false, instance, undefined, documentation, types)
    }

    /**
     * Get an instance from referencing the class name.
     * @param className
     * @param props
     * @param fill If IDs should be replaced by what they reference.
     */
    public static async getInstance({className, props, fill}: {
        className?: string,
        props?: object,
        fill: boolean
    }): Promise<Data|undefined> {
        const invalidClassNames: TTypes[] = ['string', 'number', 'boolean']
        if(!className || invalidClassNames.indexOf(className) != -1) return undefined
        if(className && this.hasInstance(className)) {
            const instance = this._map.get(className)?.instance
            if(instance) {
                return await instance.__new(props, fill)
            } else console.warn(`DataMap: Class instance was invalid: ${className}`, props)
        } else console.warn(`DataMap: Class instance does not exist: ${className}`, props)
        return undefined
    }

    public static hasInstance(
        className: string|undefined
    ): boolean {
        const invalidClasses = ['string', 'number', 'array', 'boolean', 'object', '']
        if(
            invalidClasses.indexOf(className?.toLowerCase() ?? '') != -1
            || className?.startsWith('Option')
            || className?.startsWith('Data')
        ) return false

        const has = className ? this._map.has(className) : false
        if(!has) console.warn(`DataMap: "${className}" does not exist! Might not be enlisted.`)
        return has
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
        return this.hasInstance(className) ? this._map.get(className) : undefined
    }
}

export class DataObjectMeta extends DataMeta {
    constructor(
        public instance: Data,
        public isRoot: boolean,
        public description?: string,
        public documentation?: IStringDictionary,
        public types?: IStringDictionary,
        public label?: string,
        public keyMap?: IStringDictionary,
        public tools?: IDictionary<IRootTool>
    ) {
        super()
    }
}

interface IRootTool {
    label: string
    documentation: string
    /** If the instance that is provided in the callback should be filled with data instead of reference IDs. */
    filledInstance: boolean
    callback: <T>(instance: T&Data)=>Promise<RootToolResult>
}
export class RootToolResult {
    success: boolean = false
    message: string = ''
    data: TRootToolResponseData = undefined
}
export type TRootToolResponseData = undefined|string|number|boolean
