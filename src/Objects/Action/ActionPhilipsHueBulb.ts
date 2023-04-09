import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'
import {EnumEntryUsage} from '../../Enums/EntryType.js'
import {PresetPhilipsHueColor} from '../Preset/PhilipsHue.js'

export class ActionPhilipsHueBulb extends BaseDataObject {
    entries: number[] = []
    entriesType = EnumEntryUsage.All
    colorEntries: PresetPhilipsHueColor[] = []
    colorEntriesType = EnumEntryUsage.First
}

DataObjectMap.addRootInstance(
    new ActionPhilipsHueBulb(),
    'Trigger Philips Hue bulb changes.',
    {
        colorEntries: 'The color(s) to set the bulb(s) to.',
        entries: 'The bulb IDs to affect.',
    },
    {
        entries: 'number',
        entriesType: EnumEntryUsage.ref(),
        colorEntries: PresetPhilipsHueColor.refId(),
        colorEntriesType: EnumEntryUsage.ref()
    }
)