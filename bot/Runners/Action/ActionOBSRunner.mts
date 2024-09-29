import ActionOBS from '../../../Shared/Objects/Data/Action/ActionOBS.mts'
import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.mts'
import Utils from '../../../Shared/Utils/Utils.mts'
import ModulesSingleton from '../../../Shared/Singletons/ModulesSingleton.mts'
import AbstractActionRunner from './AbstractActionRunner.mts'

export default class ActionOBSRunner extends AbstractActionRunner {
    getCallback<T>(key: string, instance: T): IActionCallback {
        return {
            description: 'Callback that triggers an OBS action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone(instance as ActionOBS)
                const modules = ModulesSingleton.getInstance()
                // clone.key = key TODO: Is this needed for the group toggling?
                const state = clone.state
                console.log("OBS Reward triggered")
                modules.obs.toggle(clone, state)
            }
        }
    }
}