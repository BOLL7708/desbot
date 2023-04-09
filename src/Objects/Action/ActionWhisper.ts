import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'
import {EnumEntryUsage} from '../../Enums/EntryType.js'

// TODO: Incomplete as it doesn't really work now anyway.
export class ActionWhisper extends BaseDataObject {
    entries: string[] = []
    entriesType = EnumEntryUsage.First
    user: string = '' // TODO: Change to whichever way we reference users in the future.
}

DataObjectMap.addRootInstance(
    new ActionWhisper(),
    'Send a whisper message to a Twitch user.',
    {},
    {
        entries: 'string',
        entriesType: EnumEntryUsage.ref()
    }
)