import AbstractAction, {IActionCallback} from './AbstractAction.js'
import {DataEntries} from '../AbstractData.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import DataMap from '../DataMap.js'
import PresetDiscordWebhook from '../Preset/PresetDiscordWebhook.js'

export default class ActionDiscord extends AbstractAction {
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

    async build(key: string): Promise<IActionCallback> {
        const runner = await import('../../../../Server/Objects/Data/ActionDiscordRunner.js')
        const instance = new runner.default()
        return instance.getCallback<ActionDiscord>(key, this)
    }
}
