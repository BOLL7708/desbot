import AbstractAction, {IActionCallback} from './AbstractAction.js'
import {OptionTTSFunctionType} from '../../Options/OptionTTS.js'
import DataMap from '../DataMap.js'

export default class ActionSettingTTS extends AbstractAction {
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

    async build(key: string): Promise<IActionCallback> {
        const runner = await import('../../../../Server/Objects/Data/ActionSettingTTSRunner.js')
        const instance = new runner.default()
        return instance.getCallback<ActionSettingTTS>(key, this)
    }
}