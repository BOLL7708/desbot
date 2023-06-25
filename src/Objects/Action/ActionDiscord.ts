import Data from '../Data.js'
import DataMap from '../DataMap.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import {ActionChat} from './ActionChat.js'
import {PresetDiscordWebhook} from '../Preset/PresetDiscordWebhook.js'

export class ActionDiscord extends Data{
    webhook: number|PresetDiscordWebhook = 0
    entries: string[] = []
    entries_use = OptionEntryUsage.First

    register() {
        DataMap.addRootInstance(
            new ActionDiscord(),
            'Send a message to a Discord channel, make sure to set a webhook URL in DiscordWebhooks for the same key.',
            {},
            {
                webhook: PresetDiscordWebhook.refId(),
                entries: 'string',
                entries_use: OptionEntryUsage.ref()
            }
        )
    }
}
