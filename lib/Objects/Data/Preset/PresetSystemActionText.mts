import {AbstractData} from '../AbstractData.mts'
import {DataMap} from '../DataMap.mts'
import {OptionSystemActionType} from '../../Options/OptionSystemActionType.mts'

export class PresetSystemActionText extends AbstractData {
    speech: string[] = []
    chat: string[] = []

    enlist() {
        DataMap.addRootInstance({
            instance: new PresetSystemActionText(),
            description: 'Text references for the system actions, they are here so they can be modified instead of being hard coded.\n\nThese will be added by importing defaults, the number and order of entries is important and should not be altered.',
            documentation: {
                speech: 'The texts to use for speech.',
                chat: 'The texts to use for chat.'
            },
            types: {
                speech: 'string',
                chat: 'string'
            },
            keyMap: OptionSystemActionType.keyMap()
        })
    }
}