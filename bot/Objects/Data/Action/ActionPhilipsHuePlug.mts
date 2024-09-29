import AbstractAction, {IActionCallback} from './AbstractAction.mts'
import {DataEntries} from '../AbstractData.mts'
import {OptionEntryUsage} from '../../Options/OptionEntryType.mts'
import DataMap from '../DataMap.mts'
import {PresetPhilipsHuePlug} from '../Preset/PresetPhilipsHue.mts'

export default class ActionPhilipsHuePlug extends AbstractAction {
    entries: number[]|DataEntries<PresetPhilipsHuePlug> = []
    entries_use = OptionEntryUsage.All
    originalState: boolean = false
    triggerState: boolean = true
    duration: number = 0

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionPhilipsHuePlug(),
            tag: '🔌',
            description: 'Trigger Philips Hue plug changes.',
            documentation: {
                entries: 'The plug IDs to affect.',
                originalState: 'If the plug original state is on or off.',
                triggerState: 'If the plug triggered state is on or off.',
                duration: 'Duration of plug action in seconds, 0 means it is permanent.'
            },
            types: {
                entries: PresetPhilipsHuePlug.ref.id.label.build(),
                entries_use: OptionEntryUsage.ref
            }
        })
    }

    async build(key: string): Promise<IActionCallback> {
        const runner = await import('../../../../Server/Runners/Action/ActionPhilipsHuePlugRunner.mts')
        const instance = new runner.default()
        return instance.getCallback<ActionPhilipsHuePlug>(key, this)
    }
}