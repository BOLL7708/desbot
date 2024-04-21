import AbstractAction, {IActionCallback} from './AbstractAction.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import DataMap from '../DataMap.js'

export default class ActionRemoteCommand extends AbstractAction {
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

    async build(key: string): Promise<IActionCallback> {
        const runner = await import('../../../../Server/Runners/Action/ActionRemoteCommandRunner.js')
        const instance = new runner.default()
        return instance.getCallback<ActionRemoteCommand>(key, this)
    }
}