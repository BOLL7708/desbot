import {OptionEntryUsage} from '../../Options/OptionEntryType.mts'
import {DataEntries} from '../AbstractData.mts'
import {DataMap} from '../DataMap.mts'
import {PresetDiscordWebhook} from '../Preset/PresetDiscordWebhook.mts'
import {AbstractAction} from './AbstractAction.mts'

export class ActionDiscord extends AbstractAction {
    webhook: number|DataEntries<PresetDiscordWebhook> = 0
    entries: string[] = ['']
    entries_use = OptionEntryUsage.First

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionDiscord(),
            tag: '💬',
            description: 'Send a message to a Discord channel.',
            types: {
                webhook: PresetDiscordWebhook.ref.id.build(),
                entries: 'string',
                entries_use: OptionEntryUsage.ref
            }
        })
    }
}
