import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'
import {EnumEntryType} from '../../Enums/EntryType.js'

export class ActionLink extends BaseDataObject {
    entries: string[] = []
    entriesType = EnumEntryType.First
}

DataObjectMap.addRootInstance(
    new ActionLink(),
    'Loads http/https or custom URI schema link(s) silently in the background.',
    {
        entries: 'Full links including protocol.\n\nhttp:// and https:// will load as web URLs, while custom schemas [custom]:// will be executed as local system calls.'
    },
    {
        entries: 'string',
        entriesType: EnumEntryType.ref()
    }
)