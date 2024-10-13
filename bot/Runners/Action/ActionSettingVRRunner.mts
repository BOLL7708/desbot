import {ActionSettingVR, IActionCallback, IActionUser} from '../../../lib/index.mts'
import ModulesSingleton from '../../Singletons/ModulesSingleton.mts'
import Utils from '../../Utils/Utils.mts'

// deno-lint-ignore require-await
ActionSettingVR.prototype.build = async function <T>(key: string, instance: T): Promise<IActionCallback> {
   return {
      description: 'Callback that triggers an OpenVR2WSSetting action',
      call: async (user: IActionUser, nonce: string, index?: number) => {
         const clone = Utils.clone(instance as ActionSettingVR)
         const modules = ModulesSingleton.getInstance()
         modules.openvr2ws.setSetting(clone)
      }
   }
}