import {Option} from './Option.js'
import {OptionsMap} from './OptionsMap.js'
import {TRunType} from '../Interfaces/iactions.js'

export class OptionCommandType extends Option {
    static readonly Keys: TRunType = 'keys'
    static readonly Mouse: TRunType = 'mouse'
}
OptionsMap.addPrototype(
    OptionCommandType,
    'What type of input to trigger with in the action.',
    {
        Keys: 'Will simulate keyboard input.',
        Mouse: 'Will simulate mouse input.'
    }
)