import {ActionAudio, IActionCallback, IActionUser} from '../../../lib/index.mts'
import AssetsHelper from '../../Helpers/AssetsHelper.mts'
import TextHelper from '../../Helpers/TextHelper.mts'
import ModulesSingleton from '../../Singletons/ModulesSingleton.mts'
import ArrayUtils from '../../Utils/ArrayUtils.mts'
import Utils from '../../Utils/Utils.mts'

ActionAudio.prototype.build = async function <T>(key: string, instance: T): Promise<IActionCallback> {
   return {
      description: "Callback that triggers a sound and/or speech action",
      awaitCall: true,
      call: async (user: IActionUser, nonce: string, index?: number) => {
         const clone = Utils.clone(instance as ActionAudio)
         clone.srcEntries = await AssetsHelper.preparePathsForUse(
            clone.srcEntries
         )
         clone.srcEntries = await TextHelper.replaceTagsInTextArray( // To support audio URLs in input
            ArrayUtils.getAsType(
               Utils.ensureArray(clone.srcEntries),
               clone.srcEntries_use,
               index
            ), // Need to read entries from config here as cloning drops __type
            user
         )
         const modules = ModulesSingleton.getInstance()
         if (clone.channel_orOnSpeechChannel) {
            modules.tts.enqueueSoundEffect(clone)
         } else modules.audioPlayer.enqueueAudio(clone)
      }
   }
}