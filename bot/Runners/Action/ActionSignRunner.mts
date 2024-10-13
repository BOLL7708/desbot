import {ActionSign, IActionCallback, IActionUser} from '../../../lib/index.mts'
import TextHelper from '../../Helpers/TextHelper.mts'
import TwitchHelixHelper from '../../Helpers/TwitchHelixHelper.mts'
import ModulesSingleton from '../../Singletons/ModulesSingleton.mts'
import Utils from '../../Utils/Utils.mts'

// deno-lint-ignore require-await
ActionSign.prototype.build = async function <T>(key: string, instance: T): Promise<IActionCallback> {
   return {
      description: 'Callback that triggers a Sign action',
      call: async (user: IActionUser, nonce: string, index?: number) => {
         const clone = Utils.clone(instance as ActionSign)
         const modules = ModulesSingleton.getInstance()
         TwitchHelixHelper.getUserById(user.id).then(async userData => {
            const modules = ModulesSingleton.getInstance()
            clone.title = await TextHelper.replaceTagsInText(clone.title, user)
            if (clone.imageSrc.length == 0) clone.imageSrc = userData?.profile_image_url ?? ''
            clone.imageSrc = await TextHelper.replaceTagsInText(clone.imageSrc, user)
            clone.subtitle = await TextHelper.replaceTagsInText(clone.subtitle, user)
            modules.sign.enqueueSign(clone)
         })
      }
   }
}