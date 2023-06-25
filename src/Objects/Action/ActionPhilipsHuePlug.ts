import Data from '../Data.js'
import DataMap from '../DataMap.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'

export class ActionPhilipsHuePlug extends Data {
    entries: number[] = []
    entries_use = OptionEntryUsage.All
    originalState: boolean = false
    triggerState: boolean = true
    duration: number = 0

    enlist() {
        DataMap.addRootInstance(
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
                entries_use: OptionEntryUsage.ref()
            }
        )
    }
}