import {IDictionary, IStringDictionary} from '../Interfaces/igeneral.js'

export class DataMeta {
    public description?: string
    public documentation?: IStringDictionary
    public instructions?: IStringDictionary
    public types?: IStringDictionary
    public isRoot: boolean = false
    public visibleForOption?: IDictionary<IDictionary<number|string>>
}