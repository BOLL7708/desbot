import Data from '../Data.js'
import DataMap from '../DataMap.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'

export class ActionLink extends Data {
    entries: string[] = []
    entries_use = OptionEntryUsage.First

    enlist() {
        DataMap.addRootInstance(
            new ActionLink(),
            'Loads http/https or custom URI schema link(s) silently in the background.',
            {
                entries: 'Full links including protocol.\n\nhttp:// and https:// will load as web URLs, while custom schemas [custom]:// will be executed as local system calls.'
            },
            {
                entries: 'string',
                entries_use: OptionEntryUsage.ref()
            }
        )
    }
}

