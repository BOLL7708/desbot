import ModulesSingleton from '../../../bot/Singletons/ModulesSingleton.mts'
import Utils from '../../../bot/Utils/Utils.mts'
import {ActionCustom, IActionCallback, IActionUser} from '../../../lib/index.mts'

// deno-lint-ignore require-await
ActionCustom.prototype.build = async function <T>(key: string, instance: T): Promise<IActionCallback> {
   return {
      description: 'Callback that triggers arbitrary code',
      call: async (user: IActionUser, nonce: string, index?: number) => {
         try {
            const clone = Utils.clone(instance as ActionCustom)
            const modules = ModulesSingleton.getInstance()
            eval(clone.code)
         } catch (error) {
            Utils.logWithBold(`Error in custom action <${key}>`, 'red')
            console.warn(error)
         }
      }
   }
}