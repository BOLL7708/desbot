import ActionRemoteCommand from '../../../Shared/Objects/Data/Action/ActionRemoteCommand.mts'
import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.mts'
import Utils from '../../../Shared/Utils/Utils.mts'
import ModulesSingleton from '../../../Shared/Singletons/ModulesSingleton.mts'
import ArrayUtils from '../../../Shared/Utils/ArrayUtils.mts'
import AbstractActionRunner from './AbstractActionRunner.mts'

export default class ActionRemoteCommandRunner extends AbstractActionRunner {
    getCallback<T>(key: string, instance: T): IActionCallback {
        return {
            description: 'Callback that triggers a Remote Command action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone(instance as ActionRemoteCommand)
                const modules = ModulesSingleton.getInstance()
                const entries = ArrayUtils.getAsType(clone.entries, clone.entries_use, index)
                for(const entry of entries) {
                    modules.twitch.sendRemoteCommand(entry).then()
                }
            }
        }
    }
}