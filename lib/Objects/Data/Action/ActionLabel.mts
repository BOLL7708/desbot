import AbstractAction, {IActionCallback} from './AbstractAction.mts'
import {OptionEntryUsage} from '../../Options/OptionEntryType.mts'
import DataMap from '../DataMap.mts'

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

    async build(key: string): Promise<IActionCallback> {
        const runner = await import('../../../../Server/Runners/Action/ActionLabelRunner.mts')
        const instance = new runner.default()
        return instance.getCallback<ActionLabel>(key, this)
    }
}

