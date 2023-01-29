import {IStringDictionary} from '../Interfaces/igeneral.js'
import Utils from './Utils.js'

export default abstract class BaseDataObject {
    /**
     * Submit any object to get mapped to this class instance.
     * @param instanceOrJsonResult Optional properties to apply to this instance.
     * @param classMap Optional mal over the class properties, for instantiating subclasses.
     */
    public __apply(instanceOrJsonResult: object = {}, classMap: BaseDataObjectMap|undefined = undefined) {
        const prototype = Object.getPrototypeOf(this)
        const props = !!instanceOrJsonResult
            && typeof instanceOrJsonResult == 'object'
            && !Array.isArray(instanceOrJsonResult)
                ? instanceOrJsonResult
                : {}
        for(const [name, prop] of Object.entries(props)) {
            if(
                this.hasOwnProperty(name) // This is true if the `props` is an original instance of the implementing class.
                || prototype.hasOwnProperty(name) // The `__new()` call returns an instance with the original class as prototype, which is why we also check it.
            ) {
                // We cast to `any` in here to be able to set the props at all.
                const types = classMap?.getMeta(this.constructor.name)?.types ?? {}
                const subClassInstanceName = types[name]
                const subClassInstanceType = (this as any)[name]?.constructor.name ?? (prototype as any)[name]?.constructor.name
                if(classMap && classMap.hasInstance(subClassInstanceName, true)) {
                    if(Array.isArray(prop)) {
                        // It is an array of subclasses, instantiate.
                        const newProp: any[] = []
                        for(const v of prop) {
                            newProp.push(classMap.getInstance(subClassInstanceName, v, true))
                        }
                        (this as any)[name] = newProp
                    } else if (typeof prop == 'object') {
                        // It is a dictionary of subclasses, instantiate.
                        const newProp: { [key: string]: any } = {}
                        for(const [k, v] of Object.entries(prop)) {
                            newProp[k] = classMap.getInstance(subClassInstanceName, v as object|undefined, true)
                        }
                        (this as any)[name] = newProp
                    }
                } else {
                    if(classMap && classMap.hasInstance(subClassInstanceType, true)) {
                        // It is a single instance class
                        (this as any)[name] = classMap.getInstance(subClassInstanceType, prop, true)
                    } else {
                        // It is a basic value, just set it.
                        (this as any)[name] = prop
                    }
                }
            }
        }
        // If we don't fill the instance with the properties of the prototype, the prototype will get future assignments and not the instance.
        const propsKeys = Object.keys(props)
        const prototypePropsKeys = Object.keys(prototype).filter(
            (prop) => { return prototype.hasOwnProperty(prop) && !propsKeys.includes(prop) }
        )
        for(const name of prototypePropsKeys) {

            (this as any)[name] = prototype[name] ?? undefined
        }
    }

    /**
     * Returns a new instance with this class as a prototype, meaning it will be seen as the same class by the system.
     * @param props Optional properties to apply to the new instance, usually a plain object cast to the same class which is why we need to do this.
     */
    public __new<T>(props?: T&object): T&BaseDataObject {
        const obj = Object.create(this) as T&BaseDataObject // Easy way of making a new instance, it will have the previous class as prototype though, but it still returns the same constructor name which is what we need.
        obj.__apply(props ?? {}, this.getClassMap()) // Will run with empty just to lift properties from the prototype up to the class instance.
        return obj
    }

    public __clone() {
        return this.__new(Utils.clone(this))
    }

    /**
     * Gets the map of related class instances, this is built when extending the BaseDataObjectMap as part of the constructor.
     * @private
     */
    private getClassMap(): BaseDataObjectMap|undefined {
        const className = this.constructor.name
        const classClass = Utils.splitOnCaps(className).shift() ?? ''
        return BaseDataObjectMap.MapReferences[`${classClass}Objects`]
    }
}

export class BaseDataObjectMeta {
    public description: string|undefined
    public documentation: IStringDictionary|undefined
    public types: IStringDictionary|undefined
    constructor(description?: string, documentation?: IStringDictionary, types?: IStringDictionary) {
        if(description) this.description = description
        if(documentation) this.documentation = documentation
        if(types) this.types = types
    }
}


// Types
type TNoFunctions<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T]
type TTypes = 'number'|'boolean'|'string'|string

export abstract class BaseDataObjectMap {
    static MapReferences: { [key: string]: BaseDataObjectMap } = {}

    private _instanceMap = new Map<string, BaseDataObject>()
    private _subInstanceMap = new Map<string, BaseDataObject>()
    private _metaMap = new Map<string, BaseDataObjectMeta>()

    protected constructor() {
        // Store a reference to this instance in the static property on the abstract class (it somehow works)
        BaseDataObjectMap.MapReferences[this.constructor.name] = this
    }

    protected addInstance<T>(
        instance: T&BaseDataObject,
        description: string|undefined = undefined,
        documentation?: Partial<Record<TNoFunctions<T>, string>>,
        types?: Partial<Record<TNoFunctions<T>, TTypes>>,
        isSubClass: boolean = false
    ) {
        const className = instance.constructor.name
        const map = isSubClass ? this._subInstanceMap : this._instanceMap
        map.set(className, instance)

        const meta = new BaseDataObjectMeta(
            description,
            documentation as IStringDictionary|undefined,
            types as IStringDictionary|undefined
        )
        this._metaMap.set(className, meta)
    }

    /**
     * Get an instance from referencing the class name.
     * @param className
     * @param props
     * @param isSubClass
     */
    public getInstance(
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
    public hasInstance(
        className: string|undefined,
        isSubClass: boolean = false
    ): boolean {
        const map = isSubClass ? this._subInstanceMap : this._instanceMap
        return className ? map.has(className) : false
    }
    public getNames(): string[] {
        return Array.from(this._instanceMap.keys())
    }

    public getMeta(className: string): BaseDataObjectMeta|undefined {
        return this._metaMap.get(className)
    }
}

export class EmptyDataObject extends BaseDataObject {}
export class EmptyDataObjectMap extends BaseDataObjectMap {
    constructor() {
        super()
    }
}