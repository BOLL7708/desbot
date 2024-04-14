import AbstractAction, {IActionCallback, IActionUser} from './AbstractAction.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import DataMap from '../DataMap.js'
import Utils from '../../../Utils/Utils.js'
import ModulesSingleton from '../../../Singletons/ModulesSingleton.js'
import ArrayUtils from '../../../Utils/ArrayUtils.js'

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

    build(key: string): IActionCallback {
        return {
            description: 'Callback that triggers a Remote Command action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone<ActionRemoteCommand>(this)
                const modules = ModulesSingleton.getInstance()
                const entries = ArrayUtils.getAsType(clone.entries, clone.entries_use, index)
                for(const entry of entries) {
                    modules.twitch.sendRemoteCommand(entry).then()
                }
            }
        }
    }
}