import Utils from '../Classes/Utils.js'
import DataObjectMap, {TNoFunctions} from './DataObjectMap.js'
import DataBaseHelper from '../Classes/DataBaseHelper.js'

export default abstract class BaseDataObject {
    /**
     * Get the name of the class without instantiating it.
     */
    static ref(): string {
        return this.name
    }

    /**
     * Get the name of the class appended with the ID flag.
     * If this ID is referenced when instancing a class, it will be filled with the object.
     */
    static refId() {
        return this.ref()+'|id'
    }

    /**
     * Get the name of the class appended with the ID flag and label value.
     * If this ID is referenced when instancing a class, it will be filled with the object.
     * @param label
     */
    static refIdLabel<T extends typeof BaseDataObject>(this: T, label: TNoFunctions<InstanceType<T>>): string {
        return this.refId()+`|label=${label as string}`
    }

    /**
     * Get the name of the class appended with the ID flag.
     * If this ID is referenced when instancing a class, it will be filled with the key for the object.
     */
    static refIdKey() {
        return this.refId()+'|key'
    }

    /**
     * Get the name of the class appended with the ID flag and label value.
     * If this ID is referenced when instancing a class, it will be filled with the key for the object.
     */
    static refIdLabelKey<T extends typeof BaseDataObject>(this: T, label: TNoFunctions<InstanceType<T>>) {
        return this.refIdLabel(label)+'|key'
    }

    /**
     * Submit any object to get mapped to this class instance.
     * @param instanceOrJsonResult Optional properties to apply to this instance.
     * @param fillReferences Replace reference IDs with the referenced object.
     */
    async __apply(instanceOrJsonResult: object = {}, fillReferences: boolean = false) {
        const prototype = Object.getPrototypeOf(this)
        const props = !!instanceOrJsonResult
            && typeof instanceOrJsonResult == 'object'
            && !Array.isArray(instanceOrJsonResult)
                ? instanceOrJsonResult
                : {}
        const thisClass = this.constructor.name
        for(const [propertyName, propertyValue] of Object.entries(props)) {
            if(
                this.hasOwnProperty(propertyName) // This is true if the `props` is an original instance of the implementing class.
                || prototype.hasOwnProperty(propertyName) // The `__new()` call returns an instance with the original class as prototype, which is why we also check it.
            ) {
                // We cast to `any` in here to be able to set the props at all.
                const types = DataObjectMap.getMeta(thisClass)?.types ?? {}
                const typeValues = BaseDataObject.parseRef(types[propertyName] ?? '')
                const hasSubInstance = DataObjectMap.hasInstance(typeValues.class)
                if(hasSubInstance && typeValues.isIdList && fillReferences) {
                    // Populate reference list of IDs with the referenced object.
                    const emptyInstance = await DataObjectMap.getInstance(typeValues.class)
                    if (Array.isArray(propertyValue)) {
                        // It is an array of subclasses, instantiate.
                        const newProp: any[] = []
                        for (const id of propertyValue) {
                            const dbItem = await DataBaseHelper.loadById(id.toString())
                            if(typeValues.idToKey) {
                                newProp.push(dbItem?.key ?? id)
                            } else if(emptyInstance) {
                                newProp.push(await emptyInstance.__new(dbItem?.data, fillReferences))
                            } else {
                                console.warn(`BaseDataObjects.__apply: Unable to load instance for ${typeValues.class}`)
                            }
                        }
                        (this as any)[propertyName] = newProp

                    } else if (typeof propertyValue == 'object') {
                        // It is a dictionary of subclasses, instantiate.
                        const newProp: { [key: string]: any } = {}
                        for (const [k, id] of Object.entries(propertyValue)) {
                            const dbItem = await DataBaseHelper.loadById(id?.toString())
                            if(typeValues.idToKey) {
                                newProp[k] = dbItem?.key ?? id
                            } else if(emptyInstance) {
                                newProp[k] = await emptyInstance.__new(dbItem?.data, fillReferences)
                            } else {
                                console.warn(`BaseDataObjects.__apply: Unable to load instance for ${typeValues.class}`)
                            }
                        }
                        (this as any)[propertyName] = newProp
                    }
                } else if(hasSubInstance && !typeValues.isIdList) {
                    // Fill list with new instances filled with the incoming data.
                    if(Array.isArray(propertyValue)) {
                        // It is an array of subclasses, instantiate.
                        const newProp: any[] = []
                        for(const v of propertyValue) {
                            newProp.push(await DataObjectMap.getInstance(typeValues.class, v, fillReferences))
                        }
                        (this as any)[propertyName] = newProp
                    } else if (typeof propertyValue == 'object') {
                        // It is a dictionary of subclasses, instantiate.
                        const newProp: { [key: string]: any } = {}
                        for(const [k, v] of Object.entries(propertyValue)) {
                            newProp[k] = await DataObjectMap.getInstance(typeValues.class, v as object|undefined, fillReferences)
                        }
                        (this as any)[propertyName] = newProp
                    }
                } else {
                    // Fill with single a instance or basic values.
                    const singleInstanceType = (this as any)[propertyName]?.constructor.name ?? (prototype as any)[propertyName]?.constructor.name
                    if(DataObjectMap.hasInstance(singleInstanceType) && !typeValues.isIdList) {
                        // It is a single instance class
                        (this as any)[propertyName] = await DataObjectMap.getInstance(singleInstanceType, propertyValue, fillReferences)
                    } else {
                        // It is a basic value, just set it.
                        const expectedType = typeof (this as any)[propertyName]
                        const actualType = typeof propertyValue
                        let correctedProp = propertyValue
                        if(expectedType !== actualType) {
                            switch(expectedType) {
                                case 'string': correctedProp = propertyValue.toString(); break;
                                case 'number': correctedProp = parseFloat(propertyValue.toString()); break;
                                case 'boolean': correctedProp = Utils.toBool(propertyValue); break;
                                default: console.warn(`BaseDataObjects.__apply: Unhandled field type for prop [${propertyName}] in [${thisClass}]: ${expectedType}`)
                            }
                        }
                        (this as any)[propertyName] = correctedProp
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
    async __new<T>(props?: T&object, fillReferences: boolean = false): Promise<T&BaseDataObject> {
        const obj = Object.create(this) as T&BaseDataObject // Easy way of making a new instance, it will have the previous class as prototype though, but it still returns the same constructor name which is what we need.
        await obj.__apply(props ?? {}, fillReferences) // Will run with empty just to lift properties from the prototype up to the class instance.
        return obj
    }

    async __clone(fillReferences: boolean = false) {
        return await this.__new(Utils.clone(this), fillReferences)
    }

    static parseRef(refStr: string): IBaseDataObjectRefValues {
        const refArr = refStr.split('|')
        const refValues: IBaseDataObjectRefValues = {
            original: refStr,
            class: refArr.shift() ?? '',
            isIdList: false,
            idLabelField: '',
            idToKey: false
        }
        for(const t of refArr) {
            const [k, v] = t.split('=')
            switch(k) {
                case 'id': refValues.isIdList = true; break
                case 'key': refValues.idToKey = true; break
                case 'label': refValues.idLabelField = v; break
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
    idToKey: boolean
}