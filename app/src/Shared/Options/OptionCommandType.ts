import {TRunType} from '../Interfaces/iactions.js'
import {OptionsMap} from './OptionsMap.js'
import {Option} from './Option.js'

export class OptionCommandType extends Option {
    static readonly Keys: TRunType = 'keys'
    static readonly Mouse: TRunType = 'mouse'
}
OptionsMap.addPrototype({
    prototype: OptionCommandType,
    description: 'What type of input to trigger with in the action.',
    documentation: {
        Keys: 'Will simulate keyboard input.',
        Mouse: 'Will simulate mouse input.'
    }
})