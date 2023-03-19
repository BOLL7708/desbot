import {IStringDictionary} from '../Interfaces/igeneral.js'
import {DataObjectMeta} from './DataObjectMap.js'
import {EnumMeta} from './EnumObjectMap.js'

export class BaseMeta {
    description?: string
    documentation?: IStringDictionary
    types?: IStringDictionary
    isRoot: boolean = false
}