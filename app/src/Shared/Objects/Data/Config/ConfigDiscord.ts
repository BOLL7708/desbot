import AbstractData, {DataEntries} from '../AbstractData.js'
import DataMap from '../DataMap.js'
import PresetDiscordWebhook from '../Preset/PresetDiscordWebhook.js'

export default class ConfigDiscord extends AbstractData {
    prefixCheer: string = '*Cheer*: '
    prefixReward: string = '*Reward*: '
    screenshotEmbedColorManual: string = '#FFFFFF'
    screenshotEmbedColorRemote: string = '#000000'
    webhookOverride: number|DataEntries<PresetDiscordWebhook> = 0
    webhookOverride_enabled: boolean = false

    enlist() {
        DataMap.addRootInstance({
            instance: new ConfigDiscord(),
            description: 'Settings for sending things to Discord channels: https://discord.com',
            documentation: {
                prefixCheer: 'Prefix added to cheer messages in the log.\n\nNote: This prefix should include a trailing space if you want it to be separated from the message.',
                prefixReward: 'Prefix added to reward messages in the log.\n\nNote: This prefix should include a trailing space if you want it to be separated from the message.',
                screenshotEmbedColorManual: 'Embed highlight color for manual screenshots.\n\nNote: This has to be a hex color to work with Discord.',
                screenshotEmbedColorRemote: 'Default embed highlight color for redeemed screenshots, will use the user color instead if they have spoken at least once.\n\nNote: This has to be a hex color to work with Discord.',
                webhookOverride: 'Override all webhook calls for sending messages to Discord, use this when you are working on something and want to avoid spamming your live channels. Remember to disable this before going live!',
            },
            types: {
                webhookOverride: PresetDiscordWebhook.ref.id.build()
            }
        })
    }
}

