import {ActionRemoteCommand, IActionCallback, IActionUser} from '../../../lib/index.mts'
import ModulesSingleton from '../../Singletons/ModulesSingleton.mts'
import ArrayUtils from '../../Utils/ArrayUtils.mts'
import Utils from '../../Utils/Utils.mts'

// deno-lint-ignore require-await
ActionRemoteCommand.prototype.build = async function <T>(key: string, instance: T): Promise<IActionCallback> {
   return {
      description: 'Callback that triggers a Remote Command action',
      call: async (user: IActionUser, nonce: string, index?: number) => {
         const clone = Utils.clone(instance as ActionRemoteCommand)
         const modules = ModulesSingleton.getInstance()
         const entries = ArrayUtils.getAsType(clone.entries, clone.entries_use, index)
         for (const entry of entries) {
            modules.twitch.sendRemoteCommand(entry).then()
         }
      }
   }
}