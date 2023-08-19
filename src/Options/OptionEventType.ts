import {Option} from './Option.js'
import {OptionsMap} from './OptionsMap.js'
import OptionCommandCategory from './OptionCommandCategory.js'

export default class OptionEventType extends Option {
    static readonly Uncategorized = 0
    static readonly DefaultImport = 1000
    static readonly BonusImport = 1100
    static readonly GameSpecific = 2000
}
OptionsMap.addPrototype(
    OptionEventType,
    'Type of event, used for listing and filtering.',
    {
        Uncategorized: 'Uncategorized events.',
        DefaultImport: 'Events imported as defaults.',
        BonusImport: 'Events imported as bonus defaults.',
        GameSpecific: 'Events specific to a game.'
    }
)