import {ActionDiscord, DataUtils, IActionCallback, IActionUser} from '../../../lib/index.mts'
import TextHelper from '../../Helpers/TextHelper.mts'
import TwitchHelixHelper from '../../Helpers/TwitchHelixHelper.mts'
import ModulesSingleton from '../../Singletons/ModulesSingleton.mts'
import ArrayUtils from '../../Utils/ArrayUtils.mts'
import DiscordUtils from '../../Utils/DiscordUtils.mts'
import Utils from '../../Utils/Utils.mts'

// deno-lint-ignore require-await
ActionDiscord.prototype.build = async function <T>(key: string, instance: T): Promise<IActionCallback> {
   return {
      description: 'Callback that triggers a DiscordUtils message action',
      call: async (user: IActionUser, nonce: string, index?: number) => {
         const clone = Utils.clone(instance as ActionDiscord)
         const modules = ModulesSingleton.getInstance()
         const userData = await TwitchHelixHelper.getUserById(user.id)
         const entries = ArrayUtils.getAsType(clone.entries, clone.entries_use, index)
         for (const entry of entries) {
            DiscordUtils.enqueueMessage(
               // TODO: Change to take the full preset so we can post to forums and existing posts?
               DataUtils.ensureData(clone.webhook)?.url ?? '',
               user.name,
               userData?.profile_image_url,
               await TextHelper.replaceTagsInText(entry, user)
            )
         }
      }
   }
}