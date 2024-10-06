import AbstractAction, {IActionCallback} from './AbstractAction.mts'
import {DataEntries} from '../AbstractData.mts'
import {OptionEntryUsage} from '../../Options/OptionEntryType.mts'
import DataMap from '../DataMap.mts'
import PresetDiscordWebhook from '../Preset/PresetDiscordWebhook.mts'

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
        const runner = await import('../../../../Server/Runners/Action/ActionDiscordRunner.mts')
        const instance = new runner.default()
        return instance.getCallback<ActionDiscord>(key, this)
    }
}
