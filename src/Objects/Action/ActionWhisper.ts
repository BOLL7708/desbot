import Data from '../Data.js'
import DataMap from '../DataMap.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'

// TODO: Incomplete as it doesn't really work now anyway.
export class ActionWhisper extends Data {
    entries: string[] = []
    entries_use = OptionEntryUsage.First
    user: string = '' // TODO: Change to whichever way we reference users in the future.

    enlist() {
        DataMap.addRootInstance(
            new ActionWhisper(),
            'Send a whisper message to a Twitch user.',
            {},
            {
                entries: 'string',
                entries_use: OptionEntryUsage.ref()
            }
        )
    }
}