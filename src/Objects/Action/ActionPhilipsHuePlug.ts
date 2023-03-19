import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'
import {EnumEntryType} from '../../Enums/EntryType.js'
import {PresetPhilipsHueColor} from '../Preset/PhilipsHue.js'
import {ActionPhilipsHueBulb} from './ActionPhilipsHueBulb.js'

export class ActionPhilipsHuePlug extends BaseDataObject {
    entries: number[] = []
    entriesType = EnumEntryType.All
    originalState: boolean = false
    triggerState: boolean = true
    duration: number = 0
}

DataObjectMap.addRootInstance(
    new ActionPhilipsHuePlug(),
    'Trigger Philips Hue plug changes.',
    {
        entries: 'The plug IDs to affect.',
        originalState: 'If the plug original state is on or off.',
        triggerState: 'If the plug triggered state is on or off.',
        duration: 'Duration of plug action in seconds, 0 means it is permanent.'
    },
    {
        entries: 'number',
        entriesType: EnumEntryType.ref()
    }
)