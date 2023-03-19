import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'
import {EnumEntryType} from '../../Enums/EntryType.js'

export class ActionLabel extends BaseDataObject{
    fileName: string = ''
    textEntries: string[] = []
    textEntriesType = EnumEntryType.First
    append: boolean = false
}

DataObjectMap.addRootInstance(
    new ActionLabel(),
    'Writes text to a file in the data folder, can be used as a label your broadcaster suite.',
    {
        fileName: 'The filename to use, this includes the extension.',
        textEntries: 'Value(s) to write to the file.',
        append: 'Append the file instead of replacing the contents.'
    },
    {
        textEntries: 'string',
        textEntriesType: EnumEntryType.ref()
    }
)