import {BaseEnum} from '../Objects/BaseEnum.js'
import {EnumObjectMap} from '../Objects/EnumObjectMap.js'

export class EnumCommandType extends BaseEnum {
    static readonly Keys = 100
    static readonly Mouse = 200
}
EnumObjectMap.addPrototype(
    EnumCommandType,
    'What type of input to trigger with in the action.',
    {
        Keys: 'Will simulate keyboard input.',
        Mouse: 'Will simulate mouse input.'
    }
)