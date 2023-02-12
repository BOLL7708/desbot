import {IStringDictionary} from '../Interfaces/igeneral.js'
import Utils from '../Classes/Utils.js'
import DataObjectMap from './DataObjectMap.js'

export default abstract class BaseDataObject {
    /**
     * Get the name of the class without instantiating it.
     */
    public static ref(): string {
        return this.name
    }

    /**
     * Get the name of the class appended with the ID flag without instantiating it.
     */
    public static refId() {
        return this.ref()+'|id'
    }

    /**
     * Get the name of the class appended with the ID flag and label value without instantiating it.
     * @param label
     */
    public static refIdLabel(label: string) { // TODO: Should use the TNoFunctions type here but seems impossible if we keep it static... urgh.
        return this.refId()+`|label=${label}`
    }

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
                // We cast to `any` in here to be able to set the props at all.
                const types = DataObjectMap.getMeta(this.constructor.name)?.types ?? {}
                const subClassInstanceName = types[name]
                const subClassInstanceType = (this as any)[name]?.constructor.name ?? (prototype as any)[name]?.constructor.name
                if(DataObjectMap.hasInstance(subClassInstanceName)) {
                    if(Array.isArray(prop)) {
                        // It is an array of subclasses, instantiate.
                        const newProp: any[] = []
                        for(const v of prop) {
                            newProp.push(DataObjectMap.getInstance(subClassInstanceName, v))
                        }
                        (this as any)[name] = newProp
                    } else if (typeof prop == 'object') {
                        // It is a dictionary of subclasses, instantiate.
                        const newProp: { [key: string]: any } = {}
                        for(const [k, v] of Object.entries(prop)) {
                            newProp[k] = DataObjectMap.getInstance(subClassInstanceName, v as object|undefined)
                        }
                        (this as any)[name] = newProp
                    }
                } else {
                    if(DataObjectMap.hasInstance(subClassInstanceType)) {
                        // It is a single instance class
                        (this as any)[name] = DataObjectMap.getInstance(subClassInstanceType, prop)
                    } else {
                        // It is a basic value, just set it.
                        const expectedType = typeof (this as any)[name]
                        const actualType = typeof prop
                        let correctedProp = prop
                        console.log(name, prop, expectedType, actualType)
                        if(expectedType !== actualType) {
                            switch(expectedType) {
                                case 'string': correctedProp = prop.toString(); break;
                                case 'number': correctedProp = parseFloat(prop.toString()); break;
                                case 'boolean': correctedProp = Utils.toBool(prop); break;
                                default: console.warn(`Unhandled field type in BaseDataObject.__apply for prop [${name}] in [${this.constructor?.name}]: ${expectedType}`)
                            }
                        }
                        (this as any)[name] = correctedProp
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
        obj.__apply(props ?? {}) // Will run with empty just to lift properties from the prototype up to the class instance.
        return obj
    }

    public __clone() {
        return this.__new(Utils.clone(this))
    }

    /**
     * Gets the map of related class instances, this is built when extending the BaseDataObjectMap as part of the constructor.
     * @private
     */
}

export class EmptyDataObject extends BaseDataObject {}
