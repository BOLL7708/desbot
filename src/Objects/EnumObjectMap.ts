import {BaseEnum} from './BaseEnum.js'
import {TNoFunctions} from './DataObjectMap.js'
import {IStringDictionary} from '../Interfaces/igeneral.js'
import {BaseMeta} from './BaseMeta.js'

export class EnumObjectMap {
    private static _map = new Map<string, EnumMeta>()

    static getPrototype(className: string|undefined): BaseEnum|undefined {
        if(className && this._map.has(className)) {
            const meta = this._map.get(className)
            if(meta) return meta.prototype
        }
        return undefined
    }

    static addPrototype<T>(
        prototype: T&BaseEnum&Function,
        description?: string|undefined,
        documentation?: Partial<Record<TNoFunctions<T>, string>>
    ) {
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
        return className ? this._map.has(className) : false
    }

    public static getMeta(className: string): EnumMeta|undefined {
        return this._map.get(className)
    }
}

export class EnumMeta extends BaseMeta {
    constructor(
        public prototype: BaseEnum,
        public description?: string,
        public documentation?: IStringDictionary
    ) {
        super()
    }
}