import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'
import {EnumTTSFunctionType} from '../../Enums/TTS.js'

export class ActionSettingTTS extends BaseDataObject {
    functionType = EnumTTSFunctionType.Enable
    inputOverride: string = ''

    register() {
        DataObjectMap.addRootInstance(
            new ActionSettingTTS(),
            'Performs functions in the TTS system.',
            {
                functionType: 'What type of function to call for the TTS system.',
                inputOverride: 'This uses trigger input unless this is set.'
            },
            {
                functionType: EnumTTSFunctionType.ref()
            }
        )
    }
}