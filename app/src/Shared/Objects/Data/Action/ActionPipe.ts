import AbstractAction, {IActionCallback} from './AbstractAction.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import {DataEntries} from '../AbstractData.js'
import DataMap from '../DataMap.js'
import DataUtils from '../DataUtils.js'
import PresetPipeBasic, {PresetPipeCustom} from '../Preset/PresetPipe.js'

export default class ActionPipe extends AbstractAction {
    imagePathEntries: string[] = []
    imagePathEntries_use = OptionEntryUsage.OneRandom
    imageDataEntries: string[] = []
    imageDataEntries_use = OptionEntryUsage.OneRandom
    durationMs: number = 1000
    customPreset: number|DataEntries<PresetPipeCustom> = 0
    basicPreset: number|DataEntries<PresetPipeBasic> = 0
    texts: string[] = []
    texts_use = OptionEntryUsage.All

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionPipe(),
            tag: '🖼️',
            description: 'Trigger one or multiple pipe overlays.',
            documentation: {
                imagePathEntries: 'An absolute path to an image or an array of image for random selection.\n\nIf this is skipped, `imageData` needs to be set instead.',
                imageDataEntries: 'Image data (b64) for the image to be displayed.\n\nIf this is skipped, `imagePath` needs to be set instead.',
                durationMs: 'The duration for this notification to be displayed in milliseconds.',
                customPreset: 'Preset config for the custom notification, which can be generated with the Editor that comes with OpenVRNotificationPipe.',
                texts: 'If your custom notification includes text areas, this is where you add the texts that are to be used for it.'
            },
            types: {
                imagePathEntries: DataUtils.getStringFileImageRef(),
                imagePathEntries_use: OptionEntryUsage.ref,
                imageDataEntries: 'string',
                imageDataEntries_use: OptionEntryUsage.ref,
                customPreset: PresetPipeCustom.ref.id.build(),
                basicPreset: PresetPipeBasic.ref.id.build(),
                texts: 'string',
                texts_use: OptionEntryUsage.ref
            }
        })
    }

    async build(key: string): Promise<IActionCallback> {
        const runner = await import('../../../../Server/Runners/Action/ActionPipeRunner.js')
        const instance = new runner.default()
        return instance.getCallback<ActionPipe>(key, this)
    }
}