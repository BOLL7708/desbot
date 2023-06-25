import {Option} from './Option.js'
import {OptionsMap} from './OptionsMap.js'

export class OptionCommandType extends Option {
    static readonly Keys = 100
    static readonly Mouse = 200
}
OptionsMap.addPrototype(
    OptionCommandType,
    'What type of input to trigger with in the action.',
    {
        Keys: 'Will simulate keyboard input.',
        Mouse: 'Will simulate mouse input.'
    }
)