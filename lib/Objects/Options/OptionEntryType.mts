import {AbstractOption} from './AbstractOption.mts'
import {OptionsMap} from './OptionsMap.mts'

export class OptionEntryUsage extends AbstractOption {
    static readonly First = 0
    static readonly Last = 100
    static readonly All = 200
    static readonly OneRandom = 400
    static readonly AllRandom = 500
    static readonly OneByIndex = 600
    static readonly OneByIndexOnLoop = 700
}
OptionsMap.addPrototype({
    prototype: OptionEntryUsage,
    description: 'Universal behavior type for entry lists.',
    documentation: {
        First: 'Will only use the first value.',
        Last: 'Will only use the last value.',
        All: 'Will use all values.',
        OneRandom: 'Will pick one value at random.',
        AllRandom: 'Will shuffle and use all values.',
        OneByIndex: 'Will use the the value on the index from the event behavior.',
        OneByIndexOnLoop: 'Will use the value on the looped index from the event behavior.'
    }
})