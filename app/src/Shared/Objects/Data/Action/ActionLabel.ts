import AbstractAction, {IActionCallback, IActionUser} from './AbstractAction.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import DataMap from '../DataMap.js'
import Utils from '../../../Utils/Utils.js'
import ArrayUtils from '../../../Utils/ArrayUtils.js'
import DataFileUtils from '../../../Utils/DataFileUtils.js'
import TextHelper from '../../../Helpers/TextHelper.js'

export class ActionLabel extends AbstractAction {
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

    build(key: string): IActionCallback {
        return  {
            description: 'Callback that triggers a Label action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone<ActionLabel>(this)
                for(const text of ArrayUtils.getAsType(clone.textEntries, clone.textEntries_use)) {
                    if(clone.append) {
                        await DataFileUtils.appendText(clone.fileName, await TextHelper.replaceTagsInText(text, user))
                    } else {
                        await DataFileUtils.writeText(clone.fileName, await TextHelper.replaceTagsInText(text, user))
                    }
                }
            }
        }
    }
}
