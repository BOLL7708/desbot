import DataMap from '../DataMap.js'
import {PresetPipeCustom} from '../Preset/PresetPipe.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import Action, {IActionCallback, IActionUser} from '../Action.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
import Utils from '../../Classes/Utils.js'
import TextHelper from '../../Classes/TextHelper.js'
import ArrayUtils from '../../Classes/ArrayUtils.js'

export class ActionPipe extends Action {
    imagePathEntries: string[] = []
    imagePathEntries_use = OptionEntryUsage.OneRandom
    imageDataEntries: string[] = []
    imageDataEntries_use = OptionEntryUsage.OneRandom
    durationMs: number = 1000
    preset: number|PresetPipeCustom = 0
    texts: string[] = []
    texts_use = OptionEntryUsage.All

    enlist() {
        DataMap.addRootInstance(
            new ActionPipe(),
            'Trigger one or multiple pipe overlays.',
            {
                imagePathEntries: 'An absolute path to an image or an array of image for random selection.\n\nIf this is skipped, `imageData` needs to be set instead.',
                imageDataEntries: 'Image data (b64) for the image to be displayed.\n\nIf this is skipped, `imagePath` needs to be set instead.',
                durationMs: 'The duration for this notification to be displayed in milliseconds.',
                preset: 'Preset config for the custom notification, which can be generated with the Editor that comes with OpenVRNotificationPipe.',
                texts: 'If your custom notification includes text areas, this is where you add the texts that are to be used for it.'
            },{
                imagePathEntries: 'string|file',
                imagePathEntries_use: OptionEntryUsage.ref(),
                imageDataEntries: 'string',
                imageDataEntries_use: OptionEntryUsage.ref(),
                preset: PresetPipeCustom.refId(),
                texts: 'string',
                texts_use: OptionEntryUsage.ref()
            }
        )
    }

    build(key: string): IActionCallback {
        return  {
            tag: '📺',
            description: 'Callback that triggers an OpenVRNotificationPipe action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone<ActionPipe>(this)
                const modules = ModulesSingleton.getInstance()
                const preset = Utils.ensureObjectNotId(clone.preset)
                if(!preset) return console.warn('ActionPipe: No preset chosen, cannot display.')

                // Need to reference the original config arrays here as the __type is dropped in the clone process.
                clone.imagePathEntries = ArrayUtils.getAsType(clone.imagePathEntries, clone.imagePathEntries_use, index)
                clone.imageDataEntries = ArrayUtils.getAsType(clone.imageDataEntries, clone.imageDataEntries_use, index)

                // Replace tags in texts, texts in the action will replace ones in the text areas if set.
                clone.texts = await TextHelper.replaceTagsInTextArray(ArrayUtils.getAsType(clone.texts, clone.texts_use, index), user)
                clone.imagePathEntries = await TextHelper.replaceTagsInTextArray(clone.imagePathEntries, user) // TODO: Not quite sure why this is needed, figure out why later.
                for(const textArea of preset.customProperties.textAreas) {
                    textArea.text = await TextHelper.replaceTagsInText(textArea.text, user)
                }

                // Show it
                modules.pipe.showAction(clone, index).then()
            }
        }
    }
}