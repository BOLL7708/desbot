import ActionSettingVR from '../../../Shared/Objects/Data/Action/ActionSettingVR.js'
import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.js'
import Utils from '../../../Shared/Utils/Utils.js'
import ModulesSingleton from '../../../Shared/Singletons/ModulesSingleton.js'

export default class ActionSettingVRRunner extends ActionSettingVR {
    build(key: string): IActionCallback {
        return  {
            description: 'Callback that triggers an OpenVR2WSSetting action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone<ActionSettingVR>(this)
                const modules = ModulesSingleton.getInstance()
                modules.openvr2ws.setSetting(clone)
            }
        }
    }
}