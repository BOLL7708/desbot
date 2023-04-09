import {BaseEnum} from '../Objects/BaseEnum.js'
import {EnumObjectMap} from '../Objects/EnumObjectMap.js'

export class EnumEntryUsage extends BaseEnum {
    static readonly First = 0
    static readonly Last = 100
    static readonly All = 200
    static readonly OneRandom = 400
    static readonly AllRandom = 500
    static readonly OneSpecific = 600
}
EnumObjectMap.addPrototype(
    EnumEntryUsage,
    'Universal behavior type for entry lists.',
    {
        First: 'Will only use the first value.',
        Last: 'Will only use the last value.',
        All: 'Will use all values.',
        OneRandom: 'Will pick one value at random.',
        AllRandom: 'Will shuffle and use all values.',
        OneSpecific: 'Will use the index mandated by the reward trigger or some other mechanic.'
    }
)