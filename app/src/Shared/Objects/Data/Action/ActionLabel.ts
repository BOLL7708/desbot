import AbstractAction from './AbstractAction.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import DataMap from '../DataMap.js'

export default class ActionLabel extends AbstractAction {
    fileName: string = ''
    textEntries: string[] = ['']
    textEntries_use = OptionEntryUsage.First
    append: boolean = false

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionLabel(),
            tag: '🏷️',
            description: 'Writes text to a file that will be created in the <code>_data</code> folder, can be used as a label in your broadcaster suite.',
            documentation: {
                fileName: 'The filename to use, this includes the extension.',
                textEntries: 'Value(s) to write to the file.',
                append: 'Append the file instead of replacing the contents.'
            },
            types: {
                textEntries: 'string',
                textEntries_use: OptionEntryUsage.ref
            }
        })
    }
}

