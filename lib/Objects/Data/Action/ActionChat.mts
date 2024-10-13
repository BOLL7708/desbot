import {OptionEntryUsage} from '../../Options/OptionEntryType.mts'
import {DataMap} from '../DataMap.mts'
import {AbstractAction} from './AbstractAction.mts'

export class ActionChat extends AbstractAction {
    entries: string[] = ['']
    entries_use = OptionEntryUsage.First
    onlySendNonRepeats = false
    onlySendAfterUserMessage = false

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionChat(),
            tag: '💬',
            description: 'Send message(s) to Twitch chat.',
            documentation: {
                entries: 'These entries will be sent to chat.',
                onlySendNonRepeats: 'Will not send the message to chat if the last message was the same as this.',
                onlySendAfterUserMessage: 'Will not send the message to chat if the last message was by the bot itself.'
            },
            types: {
                entries: 'string',
                entries_use: OptionEntryUsage.ref
            }
        })
    }
}