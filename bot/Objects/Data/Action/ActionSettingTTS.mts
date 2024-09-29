import AbstractAction, {IActionCallback} from './AbstractAction.mts'
import {OptionTTSFunctionType} from '../../Options/OptionTTS.mts'
import DataMap from '../DataMap.mts'

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
        const runner = await import('../../../../Server/Runners/Action/ActionSettingTTSRunner.mts')
        const instance = new runner.default()
        return instance.getCallback<ActionSettingTTS>(key, this)
    }
}