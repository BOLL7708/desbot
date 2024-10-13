import {OptionEntryUsage} from '../../Options/OptionEntryType.mts'
import {DataMap} from '../DataMap.mts'
import {AbstractAction} from './AbstractAction.mts'

export class ActionRemoteCommand extends AbstractAction {
    entries: string[] = ['']
    entries_use = OptionEntryUsage.All

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionRemoteCommand(),
            tag: '📡',
            description: 'Send remote command(s) to the remote command channel.',
            types: {
                entries: 'string',
                entries_use: OptionEntryUsage.ref
            }
        })
    }
}