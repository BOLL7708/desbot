import ActionOBS from '../../../Shared/Objects/Data/Action/ActionOBS.js'
import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.js'
import Utils from '../../../Shared/Utils/Utils.js'
import ModulesSingleton from '../../../Shared/Singletons/ModulesSingleton.js'

export default class ActionOBSRunner extends ActionOBS {
    build(key: string): IActionCallback {
        return {
            description: 'Callback that triggers an OBS action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone(this) as ActionOBS
                const modules = ModulesSingleton.getInstance()
                // clone.key = key TODO: Is this needed for the group toggling?
                const state = clone.state
                console.log("OBS Reward triggered")
                modules.obs.toggle(clone, state)
            }
        }
    }
}