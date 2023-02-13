import Utils from '../Classes/Utils.js'
import DataObjectMap from './DataObjectMap.js'
import DataBaseHelper from '../Classes/DataBaseHelper.js'

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
     * @param fillReferences Replace reference IDs with the referenced object.
     */
    public async __apply(instanceOrJsonResult: object = {}, fillReferences: boolean = false) {
        const prototype = Object.getPrototypeOf(this)
        const props = !!instanceOrJsonResult
            && typeof instanceOrJsonResult == 'object'
            && !Array.isArray(instanceOrJsonResult)
                ? instanceOrJsonResult
                : {}
        const thisClass = this.constructor.name
        for(const [name, prop] of Object.entries(props)) {
            if(
                this.hasOwnProperty(name) // This is true if the `props` is an original instance of the implementing class.
                || prototype.hasOwnProperty(name) // The `__new()` call returns an instance with the original class as prototype, which is why we also check it.
            ) {
                // We cast to `any` in here to be able to set the props at all.
                const types = DataObjectMap.getMeta(thisClass)?.types ?? {}
                const subClassInstanceValues = BaseDataObject.parseRef(types[name] ?? '')
                const hasSubInstance = DataObjectMap.hasInstance(subClassInstanceValues.class)
                if(hasSubInstance && subClassInstanceValues.isIdList && fillReferences) {
                    // Populate reference list of IDs with the referenced object.
                    const emptyInstance = await DataObjectMap.getInstance(subClassInstanceValues.class)
                    if(emptyInstance) {
                        if (Array.isArray(prop)) {
                            // It is an array of subclasses, instantiate.
                            const newProp: any[] = []
                            for (const id of prop) {
                                const dbItem = await DataBaseHelper.loadById(id.toString())
                                newProp.push(await emptyInstance.__new(dbItem?.data, fillReferences))
                            }
                            (this as any)[name] = newProp

                        } else if (typeof prop == 'object') {
                            // It is a dictionary of subclasses, instantiate.
                            const newProp: { [key: string]: any } = {}
                            for (const [k, id] of Object.entries(prop)) {
                                const dbItem = await DataBaseHelper.loadById(id?.toString())
                                newProp[k] = await emptyInstance.__new(dbItem?.data, fillReferences)
                            }
                            (this as any)[name] = newProp
                        }
                    } else {
                        console.warn(`BaseDataObjects.__apply: Unable to load instance for ${subClassInstanceValues.class}`)
                    }
                } else if(hasSubInstance && !subClassInstanceValues.isIdList) {
                    // Fill list with new instances filled with the incoming data.
                    if(Array.isArray(prop)) {
                        // It is an array of subclasses, instantiate.
                        const newProp: any[] = []
                        for(const v of prop) {
                            newProp.push(await DataObjectMap.getInstance(subClassInstanceValues.class, v, fillReferences))
                        }
                        (this as any)[name] = newProp
                    } else if (typeof prop == 'object') {
                        // It is a dictionary of subclasses, instantiate.
                        const newProp: { [key: string]: any } = {}
                        for(const [k, v] of Object.entries(prop)) {
                            newProp[k] = await DataObjectMap.getInstance(subClassInstanceValues.class, v as object|undefined, fillReferences)
                        }
                        (this as any)[name] = newProp
                    }
                } else {
                    // Fill with single a instance or basic values.
                    const singleInstanceType = (this as any)[name]?.constructor.name ?? (prototype as any)[name]?.constructor.name
                    if(DataObjectMap.hasInstance(singleInstanceType) && !subClassInstanceValues.isIdList) {
                        // It is a single instance class
                        (this as any)[name] = await DataObjectMap.getInstance(singleInstanceType, prop, fillReferences)
                    } else {
                        // It is a basic value, just set it.
                        const expectedType = typeof (this as any)[name]
                        const actualType = typeof prop
                        let correctedProp = prop
                        if(expectedType !== actualType) {
                            switch(expectedType) {
                                case 'string': correctedProp = prop.toString(); break;
                                case 'number': correctedProp = parseFloat(prop.toString()); break;
                                case 'boolean': correctedProp = Utils.toBool(prop); break;
                                default: console.warn(`BaseDataObjects.__apply: Unhandled field type for prop [${name}] in [${thisClass}]: ${expectedType}`)
                            }
                        }
                        (this as any)[name] = correctedProp
                    }
                }
            }
        }
        // Copy values from the prototype to the instance, because if we don't, the prototype will get future assignments and not the instance.
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
     * @param fillReferences Replace reference IDs with the referenced object.
     */
    public async __new<T>(props?: T&object, fillReferences: boolean = false): Promise<T&BaseDataObject> {
        const obj = Object.create(this) as T&BaseDataObject // Easy way of making a new instance, it will have the previous class as prototype though, but it still returns the same constructor name which is what we need.
        await obj.__apply(props ?? {}, fillReferences) // Will run with empty just to lift properties from the prototype up to the class instance.
        return obj
    }

    public async __clone(fillReferences: boolean = false) {
        return await this.__new(Utils.clone(this), fillReferences)
    }

    static parseRef(refStr: string): IBaseDataObjectRefValues {
        const refArr = refStr.split('|')
        const refValues: IBaseDataObjectRefValues = {
            original: refStr,
            class: refArr.shift() ?? '',
            isIdList: false,
            idLabelField: ''
        }
        for(const t of refArr) {
            if(t == 'id') refValues.isIdList = true
            else {
                const [k, v] = t.split('=')
                if(k == 'label') refValues.idLabelField = v
            }
        }
        return refValues
    }
}

export class EmptyDataObject extends BaseDataObject {}

export interface IBaseDataObjectRefValues {
    original: string
    class: string
    isIdList: boolean
    idLabelField: string
}