import Data from '../Data.js'
import DataMap from '../DataMap.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'

export class ActionLabel extends Data{
    fileName: string = ''
    textEntries: string[] = []
    textEntries_use = OptionEntryUsage.First
    append: boolean = false

    register() {
        DataMap.addRootInstance(
            new ActionLabel(),
            'Writes text to a file in the data folder, can be used as a label your broadcaster suite.',
            {
                fileName: 'The filename to use, this includes the extension.',
                textEntries: 'Value(s) to write to the file.',
                append: 'Append the file instead of replacing the contents.'
            },
            {
                textEntries: 'string',
                textEntries_use: OptionEntryUsage.ref()
            }
        )
    }
}

