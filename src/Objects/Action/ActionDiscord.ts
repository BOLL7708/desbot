import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'
import {EnumEntryUsage} from '../../Enums/EntryType.js'
import {ActionChat} from './ActionChat.js'
import {PresetDiscordWebhook} from '../Preset/DiscordWebhook.js'

export class ActionDiscord extends BaseDataObject{
    webhook: number|PresetDiscordWebhook = 0
    entries: string[] = []
    entriesType = EnumEntryUsage.First
}

DataObjectMap.addRootInstance(
    new ActionDiscord(),
    'Send a message to a Discord channel, make sure to set a webhook URL in DiscordWebhooks for the same key.',
    {},
    {
        webhook: PresetDiscordWebhook.refId(),
        entries: 'string',
        entriesType: EnumEntryUsage.ref()
    }
)