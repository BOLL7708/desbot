import {IStringDictionary} from '../Interfaces/igeneral.js'
import {DataObjectMeta} from './DataMap.js'
import {EnumMeta} from '../Options/OptionsMap.js'

export class DataMeta {
    description?: string
    documentation?: IStringDictionary
    types?: IStringDictionary
    isRoot: boolean = false
}