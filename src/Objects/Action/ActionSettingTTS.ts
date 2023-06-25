import Data from '../Data.js'
import DataMap from '../DataMap.js'
import {OptionTTSFunctionType} from '../../Options/OptionTTS.js'

export class ActionSettingTTS extends Data {
    functionType = OptionTTSFunctionType.Enable
    inputOverride: string = ''

    register() {
        DataMap.addRootInstance(
            new ActionSettingTTS(),
            'Performs functions in the TTS system.',
            {
                functionType: 'What type of function to call for the TTS system.',
                inputOverride: 'This uses trigger input unless this is set.'
            },
            {
                functionType: OptionTTSFunctionType.ref()
            }
        )
    }
}