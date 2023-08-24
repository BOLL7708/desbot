import {IStringDictionary} from '../Interfaces/igeneral.js'

export class DataMeta {
    description?: string
    documentation?: IStringDictionary
    types?: IStringDictionary
    isRoot: boolean = false
}