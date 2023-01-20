import {IStringDictionary} from '../Interfaces/igeneral.js'

export default abstract class BaseDataObject {
    /**
     * Submit any object to get mapped to this class instance.
     * @param instanceOrJsonResult Optional properties to apply to this instance.
     */
    public __apply(instanceOrJsonResult: object = {}) {
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
                (this as any)[name] = prop // We cast to `any` or else we cannot set a property this way.
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
        if(props) obj.__apply(props)
        return obj
    }
}

// Types
type TNoFunctions<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T]
type TArrayTypes = 'number'|'boolean'|'string'|string

export class BaseDataObjectMap {
    private _instanceMap = new Map<string, BaseDataObject>()
    private _descriptionMap = new Map<string, string>()
    private _documentationMap = new Map<string, IStringDictionary>()
    private _arrayTypesMap = new Map<string, IStringDictionary>()

    /*
     * TODO: This is supposed to store a reference to properties deep in the class
     *  that should be arrays or dictionaries of other classes.
     *  When there is a match when building the editor, it should spawn a way to add
     *  new entries to this array or dictionary, and a way to edit dictionary keys.
     */
    private _subInstanceMap = new Map<string, BaseDataObject>()

    protected addInstance<T>(
        instance: T&BaseDataObject,
        description: string|undefined = undefined,
        docs: Partial<Record<TNoFunctions<T>, string>>|undefined = undefined,
        arrayTypes: Partial<Record<TNoFunctions<T>, TArrayTypes>>|undefined = undefined
    ) {
        const className = instance.constructor.name
        this._instanceMap.set(className, instance)
        if(description) {
            this._descriptionMap.set(className, description)
        }
        if(docs) {
            // When adding Partial to the input we are forced to cast it for some reason.
            this._documentationMap.set(className, docs as IStringDictionary)
        }
        if(arrayTypes) {
            // Still more casting.
            this._arrayTypesMap.set(className, arrayTypes as IStringDictionary)
        }
    }
    public getInstance(className: string, props: object|undefined = undefined): BaseDataObject|undefined {
        console.log(`Loading instance ${className}...`)
        if(this._instanceMap.has(className)) {
            const instance = this._instanceMap.get(className)
            if(instance) {
                return instance.__new(props)
            } else console.warn(`Class instance was invalid: ${className}`)
        } else console.warn(`Class instance does not exist: ${className}`)
        return undefined
    }
    public getNames(): string[] {
        return Array.from(this._instanceMap.keys())
    }
    public getDescription(className: string): string|undefined {
        return this._descriptionMap.get(className)
    }
    public getDocumentation(className: string): { [key:string]: string }|undefined {
        return this._documentationMap.get(className)
    }
    public getArrayTypes(className: string): { [key:string]: string }|undefined {
        return this._arrayTypesMap.get(className)
    }

    public addSubInstance<T>(path: string, obj: BaseDataObject) {
        /*
         * TODO: Might have to reconsider how to save this reference to where a
         *  sub-class exists. Maybe make a separate method to build the path-name
         *  from a class instance? We also need something that can take the path
         *  array used in the editor to match against these... (string|number)[]
         */
        this._subInstanceMap.set(obj.constructor.name+path, obj)
    }
    public matchSubInstance(path: (string|number)[]): BaseDataObject|undefined {
        /*
         * TODO: Figure out how to use the incoming path data to match a path key
         *  for sub-classes. This to know where to add buttons for adding/editing
         *  said sub-classes in a class.
         */
        return undefined
    }
}
