import Data from '../Data.js'
import DataMap from '../DataMap.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import {PresetPhilipsHueColor} from '../Preset/PresetPhilipsHue.js'

export class ActionPhilipsHueBulb extends Data {
    entries: number[] = []
    entries_use = OptionEntryUsage.All
    colorEntries: PresetPhilipsHueColor[] = []
    colorEntries_use = OptionEntryUsage.First

    enlist() {
        DataMap.addRootInstance(
            new ActionPhilipsHueBulb(),
            'Trigger Philips Hue bulb changes.',
            {
                colorEntries: 'The color(s) to set the bulb(s) to.',
                entries: 'The bulb IDs to affect.',
            },
            {
                entries: 'number',
                entries_use: OptionEntryUsage.ref(),
                colorEntries: PresetPhilipsHueColor.refId(),
                colorEntries_use: OptionEntryUsage.ref()
            }
        )
    }
}

