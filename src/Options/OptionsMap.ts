import {Option} from './Option.js'
import {TNoFunctions} from '../Objects/DataMap.js'
import {IStringDictionary} from '../Interfaces/igeneral.js'
import {DataMeta} from '../Objects/DataMeta.js'
import Utils from '../Classes/Utils.js'
import Color from '../Classes/ColorConstants.js'

export class OptionsMap {
    private static _map = new Map<string, EnumMeta>()

    static getPrototype(className: string|undefined): Option|undefined {
        if(className && this.hasPrototype(className)) {
            const meta = this._map.get(className)
            if(meta) return meta.prototype
        }
        return undefined
    }

    static addPrototype<T>({prototype, description, documentation}: {
        prototype: T&Option&Function,
        description?: string|undefined,
        documentation?: Partial<Record<TNoFunctions<T>, string>>
    }) {
        const className = prototype.name
        const meta = new EnumMeta(
            prototype,
            description,
            documentation as IStringDictionary|undefined
        )
        this._map.set(className, meta)
    }

    public static hasPrototype(
        className: string|undefined
    ): boolean {
        const has = className ? this._map.has(className) : false
        if(!has) Utils.log(`Option: "${className}" does not exist in the OptionsMap!`, Color.DarkRed, true, true)
        return has
    }

    public static getMeta(className: string): EnumMeta|undefined {
        return this.hasPrototype(className) ? this._map.get(className) : undefined
    }
}

export class EnumMeta extends DataMeta {
    constructor(
        public prototype: Option,
        public description?: string,
        public documentation?: IStringDictionary
    ) {
        super()
    }
    getDocumentationFromValue(value: any): string|undefined {
        if(!this.documentation) return undefined
        const instance = Object.assign(this.prototype)
        for(const prop of Object.keys(instance)) {
            console.log(prop, instance[prop], value, instance[prop] == value)
            if(instance[prop] == value)  {
                return this.documentation[prop]
            }
        }
        return undefined
    }
}