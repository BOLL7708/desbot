import AbstractAction from './AbstractAction.js'
import {DataEntries} from '../AbstractData.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import DataMap from '../DataMap.js'
import PresetPhilipsHueBulbState, {PresetPhilipsHueBulb} from '../Preset/PresetPhilipsHue.js'

export default class ActionPhilipsHueBulb extends AbstractAction {
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

