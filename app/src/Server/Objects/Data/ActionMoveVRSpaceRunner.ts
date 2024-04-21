import ActionMoveVRSpace from '../../../Shared/Objects/Data/Action/ActionMoveVRSpace.js'
import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.js'
import Utils from '../../../Shared/Utils/Utils.js'
import ModulesSingleton from '../../../Shared/Singletons/ModulesSingleton.js'
import AbstractActionRunner from './AbstractActionRunner.js'

export default class ActionMoveVRSpaceRunner extends AbstractActionRunner {
    getCallback<T>(key: string, instance: T): IActionCallback {
        return  {
            description: 'Callback that triggers an OpenVR2WSMoveSpace action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone(instance as ActionMoveVRSpace)
                const modules = ModulesSingleton.getInstance()
                modules.openvr2ws.moveSpace(clone)
            }
        }
    }
}