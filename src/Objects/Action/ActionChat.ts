import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'
import {EnumEntryType} from '../../Enums/EntryType.js'

export class ActionChat extends BaseDataObject {
    entries: string[] = []
    entriesType = EnumEntryType.First
}

DataObjectMap.addRootInstance(
    new ActionChat(),
    'Send message(s) to Twitch chat.',
    {},
    {
        entries: 'string',
        entriesType: EnumEntryType.ref()
    }
)