import ActionSettingVR from '../../../Shared/Objects/Data/Action/ActionSettingVR.mts'
import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.mts'
import Utils from '../../../Shared/Utils/Utils.mts'
import ModulesSingleton from '../../../Shared/Singletons/ModulesSingleton.mts'
import AbstractActionRunner from './AbstractActionRunner.mts'

export default class ActionSettingVRRunner extends AbstractActionRunner {
    getCallback<T>(key: string, instance: T): IActionCallback {
        return  {
            description: 'Callback that triggers an OpenVR2WSSetting action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone(instance as ActionSettingVR)
                const modules = ModulesSingleton.getInstance()
                modules.openvr2ws.setSetting(clone)
            }
        }
    }
}