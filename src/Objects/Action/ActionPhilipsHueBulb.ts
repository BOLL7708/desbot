import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'
import {EnumEntryType} from '../../Enums/EntryType.js'
import {PresetPhilipsHueColor} from '../Preset/PhilipsHue.js'

export class ActionPhilipsHueBulb extends BaseDataObject {
    entries: number[] = []
    entriesType = EnumEntryType.All
    colorEntries: PresetPhilipsHueColor[] = []
    colorEntriesType = EnumEntryType.First
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
        entriesType: EnumEntryType.ref(),
        colorEntries: PresetPhilipsHueColor.refId(),
        colorEntriesType: EnumEntryType.ref()
    }
)