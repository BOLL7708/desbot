import {OptionTTSFunctionType} from '../../Options/OptionTTS.mts'
import {DataMap} from '../DataMap.mts'
import {AbstractAction} from './AbstractAction.mts'

export class ActionSettingTTS extends AbstractAction {
    functionType = OptionTTSFunctionType.Enable
    inputOverride: string = ''

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionSettingTTS(),
            tag: '🔊',
            description: 'Performs functions in the TTS system.',
            documentation: {
                functionType: 'What type of function to call for the TTS system.',
                inputOverride: 'This uses trigger input unless this is set.'
            },
            types: {
                functionType: OptionTTSFunctionType.ref
            }
        })
    }
}