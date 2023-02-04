import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

export class ConfigDiscord extends BaseDataObject {
    prefixCheer: string = '*Cheer*: '
    prefixReward: string = '*Reward*: '
    screenshotEmbedColorManual: string = '#FFFFFF'
    screenshotEmbedColorRemote: string = '#000000'
}

DataObjectMap.addRootInstance(
    new ConfigDiscord(),
    'Settings for sending things to Discord channels.',
    {
        prefixCheer: 'Prefix added to cheer messages in the log.\n\nNote: This prefix should include a trailing space if you want it to be separated from the message.',
        prefixReward: 'Prefix added to reward messages in the log.\n\nNote: This prefix should include a trailing space if you want it to be separated from the message.',
        screenshotEmbedColorManual: 'Embed highlight color for manual screenshots.\n\nNote: This has to be a hex color to work with Discord.',
        screenshotEmbedColorRemote: 'Default embed highlight color for redeemed screenshots, will use the user color instead if they have spoken at least once.\n\nNote: This has to be a hex color to work with Discord.'
    }
)