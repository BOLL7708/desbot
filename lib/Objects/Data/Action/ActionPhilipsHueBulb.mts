import {OptionEntryUsage} from '../../Options/OptionEntryType.mts'
import {DataEntries} from '../AbstractData.mts'
import {DataMap} from '../DataMap.mts'
import {PresetPhilipsHueBulb, PresetPhilipsHueBulbState} from '../Preset/PresetPhilipsHue.mts'
import {AbstractAction} from './AbstractAction.mts'

export class ActionPhilipsHueBulb extends AbstractAction {
    entries: number[]|DataEntries<PresetPhilipsHueBulb> = []
    entries_use = OptionEntryUsage.All
    colorEntries: number[]|DataEntries<PresetPhilipsHueBulbState> = []
    colorEntries_use = OptionEntryUsage.All
    colorEntries_delay = 0

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionPhilipsHueBulb(),
            tag: '💡',
            description: 'Trigger Philips Hue bulb changes.',
            documentation: {
                colorEntries: 'The color(s) to set the bulb(s) to, if more than one color is used and a positive delay in seconds has been provided, they will automatically be applied in sequence.',
                entries: 'The bulbs to affect.',
            },
            types: {
                entries: PresetPhilipsHueBulb.ref.id.label.build(),
                entries_use: OptionEntryUsage.ref,
                colorEntries: PresetPhilipsHueBulbState.ref.id.build(),
                colorEntries_use: OptionEntryUsage.ref
            }
        })
    }
}