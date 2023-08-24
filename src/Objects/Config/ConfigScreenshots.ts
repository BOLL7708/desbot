import DataMap from '../DataMap.js'
import Data from '../Data.js'
import {PresetPipeCustom} from '../Preset/PresetPipe.js'
import {ActionAudio} from '../Action/ActionAudio.js'
import {PresetDiscordWebhook} from '../Preset/PresetDiscordWebhook.js'
import {OptionScreenshotFileType} from '../../Options/OptionScreenshotFileType.js'
import {EventDefault} from '../Event/EventDefault.js'

export default class ConfigScreenshots extends Data {
    SSSVRPort: number = 8807
    callback = new ConfigScreenshotsCallback()

    enlist() {
        DataMap.addRootInstance(
            new ConfigScreenshots(),
            'Trigger and transmit screenshots of OBS Studio sources or SuperScreenShotterVR: https://github.com/BOLL7708/SuperScreenShotterVR',
            {
                SSSVRPort: 'Port set in SuperScreenShotterVR.',
                callback: 'Values used when posting things coming in from SSSVR & OBS to Discord etc.'
            }
        )
    }
}
export class ConfigScreenshotsCallback extends Data {
    discordManualTitle: string = 'Manual Screenshot'
    discordRewardTitle: string = 'Photograph: %text'
    discordRewardInstantTitle: string = 'Instant shot! 📸'
    discordDefaultGameTitle: string = 'N/A'
    discordEmbedImageFormat: string = OptionScreenshotFileType.PNG
    discordWebhooksOBS: number[]|PresetDiscordWebhook[] = []
    discordWebhooksSSSVR: number[]|PresetDiscordWebhook[] = []
    signTitle: string = 'Screenshot'
    signTitle_forMs: number = 5000
    signManualSubtitle: string = 'Manual shot!'
    pipeEnabledForManual: boolean = true
    pipeEnabledForEvents: (number|string)[] = []
    pipePreset: (number|PresetPipeCustom) = 0
    pipePreset_forMs: number = 5000
    captureSoundEffect: (number|ActionAudio) = 0
    // TODO: Add the ability to post discord threads in various ways, see Trello.

    enlist() {
        DataMap.addSubInstance(
            new ConfigScreenshotsCallback(),
            {
                discordManualTitle: 'Title for the Discord post for manually taken screenshots.',
                discordRewardTitle: 'Title for the Discord post for redeemed screenshots with a description.\n\n`%text` will be replaced with the description.',
                discordRewardInstantTitle: 'Title for the Discord post for redeemed screenshots without a description.',
                discordDefaultGameTitle: 'Backup game title in the footer when posting to Discord, only used if there is no game registered as running.',
                discordEmbedImageFormat: 'The captured image is usually PNG, if you capture a really high resolution it can go above the Discord upload limit, if so you can convert it to JPG by changing this, although it will introduce a delay due to the additional processing.',
                discordWebhooksOBS: 'Webhooks to post the resulting OBS Studio screenshot to.',
                discordWebhooksSSSVR: 'Webhooks to post the resulting SuperScreenShotterVR screenshot to.',
                signTitle: 'Title of the Sign pop-in, goes above the image, with a duration in milliseconds.',
                signManualSubtitle: 'Sub-title of the Sign pop-in for manual shots, goes beneath the image.\n\nRedeemed shots will have the subtitle be the redeemers username.',
                pipeEnabledForManual: 'Enable manual screenshots to be output to VR through the Pipe.',
                pipeEnabledForEvents: 'Keys for events with VR screenshot actions that should be output to VR through the Pipe.',
                pipePreset: 'The Pipe preset for screenshots. Duration to display the headset overlay for in milliseconds.',
                captureSoundEffect: 'As there is not built in audio effect for OBS screenshots an option for that is provided here.\nWhy this is not relegated to the audio reward is due to the delay and burst options for screenshots which are not compatible with that feature.'
            },
            {
                discordEmbedImageFormat: OptionScreenshotFileType.ref(),
                discordWebhooksOBS: PresetDiscordWebhook.refId(),
                discordWebhooksSSSVR: PresetDiscordWebhook.refId(),
                pipeEnabledForEvents: EventDefault.refIdKeyLabel(),
                pipePreset: PresetPipeCustom.refId(),
                captureSoundEffect: ActionAudio.refId()
            }
        )
    }
}