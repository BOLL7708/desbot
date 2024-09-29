import ActionPipe from '../../../Shared/Objects/Data/Action/ActionPipe.mts'
import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.mts'
import Utils from '../../../Shared/Utils/Utils.mts'
import ModulesSingleton from '../../../Shared/Singletons/ModulesSingleton.mts'
import DataUtils from '../../../Shared/Objects/Data/DataUtils.mts'
import AssetsHelper from '../../../Shared/Helpers/AssetsHelper.mts'
import ArrayUtils from '../../../Shared/Utils/ArrayUtils.mts'
import TextHelper from '../../../Shared/Helpers/TextHelper.mts'
import AbstractActionRunner from './AbstractActionRunner.mts'

export default class ActionPipeRunner extends AbstractActionRunner {
    getCallback<T>(key: string, instance: T): IActionCallback {
        return  {
            description: 'Callback that triggers an OpenVRNotificationPipe action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone(instance as ActionPipe)
                const modules = ModulesSingleton.getInstance()
                const customPreset = DataUtils.ensureData(clone.customPreset)
                const basicPreset = DataUtils.ensureData(clone.basicPreset)
                if(!customPreset && !basicPreset) return console.warn('ActionPipe: No preset set, cannot display.')

                // Need to reference the original config arrays here as the __type is dropped in the clone process.
                clone.imagePathEntries = await AssetsHelper.preparePathsForUse(clone.imagePathEntries)
                clone.imagePathEntries = ArrayUtils.getAsType(clone.imagePathEntries, clone.imagePathEntries_use, index)
                clone.imageDataEntries = ArrayUtils.getAsType(clone.imageDataEntries, clone.imageDataEntries_use, index)

                // Replace tags in texts, texts in the action will replace ones in the text areas if set.
                clone.texts = await TextHelper.replaceTagsInTextArray(ArrayUtils.getAsType(clone.texts, clone.texts_use, index), user)
                clone.imagePathEntries = await TextHelper.replaceTagsInTextArray(clone.imagePathEntries, user) // TODO: Not quite sure why this is needed, figure out why later.
                if(customPreset) {
                    for(const textArea of customPreset.textAreas) {
                        textArea.text = await TextHelper.replaceTagsInText(textArea.text, user)
                    }
                }
                if(basicPreset) {
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
}