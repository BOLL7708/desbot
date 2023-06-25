import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'
import {PresetPipeCustom} from '../Preset/PresetPipe.js'
import {EnumEntryUsage} from '../../Enums/EntryType.js'

export class ActionPipe extends BaseDataObject{
    imagePathEntries: string[] = []
    imagePathEntries_use = EnumEntryUsage.First
    imageDataEntries: string[] = []
    imageDataEntries_use = EnumEntryUsage.First
    durationMs: number = 1000
    preset: number|PresetPipeCustom = 0
    texts: string[] = []

    register() {
        DataObjectMap.addRootInstance(
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
                imagePathEntries_use: EnumEntryUsage.ref(),
                imageDataEntries: 'string',
                imageDataEntries_use: EnumEntryUsage.ref(),
                preset: PresetPipeCustom.refId(),
                texts: 'string'
            }
        )
    }
}