import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'
import {EnumSystemActionType} from '../../Enums/SystemActionType.js'

export class PresetSystemActionText extends BaseDataObject {
    speech: string[] = []
    chat: string[] = []
}

DataObjectMap.addRootInstance(
    new PresetSystemActionText(),
    'Text references for the system actions, they are here so they can be modified instead of being hard coded.\n\nThese will be added by importing defaults, the number and order of entries is important and should not be changed.',
    {
        speech: 'The texts to use for speech.',
        chat: 'The texts to use for chat.'
    },
    {
        speech: 'string',
        chat: 'string'
    },
    undefined,
    EnumSystemActionType.keyMap()
)