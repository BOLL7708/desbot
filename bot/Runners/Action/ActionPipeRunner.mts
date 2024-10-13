import {ActionPipe, DataUtils, IActionCallback, IActionUser} from '../../../lib/index.mts'
import AssetsHelper from '../../Helpers/AssetsHelper.mts'
import TextHelper from '../../Helpers/TextHelper.mts'
import ModulesSingleton from '../../Singletons/ModulesSingleton.mts'
import ArrayUtils from '../../Utils/ArrayUtils.mts'
import Utils from '../../Utils/Utils.mts'

// deno-lint-ignore require-await
ActionPipe.prototype.build = async function <T>(key: string, instance: T): Promise<IActionCallback> {
   return {
      description: 'Callback that triggers an OpenVRNotificationPipe action',
      call: async (user: IActionUser, nonce: string, index?: number) => {
         const clone = Utils.clone(instance as ActionPipe)
         const modules = ModulesSingleton.getInstance()
         const customPreset = DataUtils.ensureData(clone.customPreset)
         const basicPreset = DataUtils.ensureData(clone.basicPreset)
         if (!customPreset && !basicPreset) return console.warn('ActionPipe: No preset set, cannot display.')

         // Need to reference the original config arrays here as the __type is dropped in the clone process.
         clone.imagePathEntries = await AssetsHelper.preparePathsForUse(clone.imagePathEntries)
         clone.imagePathEntries = ArrayUtils.getAsType(clone.imagePathEntries, clone.imagePathEntries_use, index)
         clone.imageDataEntries = ArrayUtils.getAsType(clone.imageDataEntries, clone.imageDataEntries_use, index)

         // Replace tags in texts, texts in the action will replace ones in the text areas if set.
         clone.texts = await TextHelper.replaceTagsInTextArray(ArrayUtils.getAsType(clone.texts, clone.texts_use, index), user)
         clone.imagePathEntries = await TextHelper.replaceTagsInTextArray(clone.imagePathEntries, user) // TODO: Not quite sure why this is needed, figure out why later.
         if (customPreset) {
            for (const textArea of customPreset.textAreas) {
               textArea.text = await TextHelper.replaceTagsInText(textArea.text, user)
            }
         }
         if (basicPreset) {
            // TODO: Here we should probably fill the basic preset with user data like name, color and image. Or something.
            //  Not sure if that should be extra data that is not in the preset itself but in a companion object... ?
            basicPreset.title = await TextHelper.replaceTagsInText(basicPreset.title, user)
            basicPreset.message = await TextHelper.replaceTagsInText(basicPreset.message, user)
         }

         // Show it
         modules.pipe.showAction(clone, index).then()
      }
   }
}