import {OptionEntryUsage} from '../../Options/OptionEntryType.mts'
import {DataEntries} from '../AbstractData.mts'
import {DataMap} from '../DataMap.mts'
import {PresetPhilipsHuePlug} from '../Preset/PresetPhilipsHue.mts'
import {AbstractAction} from './AbstractAction.mts'

export class ActionPhilipsHuePlug extends AbstractAction {
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
}