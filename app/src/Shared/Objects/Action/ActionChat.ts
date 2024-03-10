import Action, {IActionCallback, IActionUser} from '../Action.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import DataMap from '../DataMap.js'
import Utils from '../../Classes/Utils.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
import ArrayUtils from '../../Classes/ArrayUtils.js'
import SessionVars from '../../Classes/SessionVars.js'
import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import TextHelper from '../../Classes/TextHelper.js'
import {SettingTwitchTokens} from '../Setting/SettingTwitch.js'

export class ActionChat extends Action {
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

    build(key: string): IActionCallback {
        return {
            description: 'Callback that triggers a Twitch chat message action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone<ActionChat>(this)
                const modules = ModulesSingleton.getInstance()
                const entries = ArrayUtils.getAsType(Utils.ensureArray(clone.entries), clone.entries_use, index)
                for(const entry of entries) {
                    if(clone.onlySendNonRepeats && entry == SessionVars.lastTwitchChatMessage) continue
                    if(clone.onlySendAfterUserMessage) {
                        const userId = (await DataBaseHelper.load(new SettingTwitchTokens(), 'Chatbot'))?.userId ?? 0
                        if(userId.toString() == SessionVars.lastTwitchChatterUserId) continue
                    }
                    modules.twitch._twitchChatOut.sendMessageToChannel(
                        await TextHelper.replaceTagsInText(entry, user)
                    )
                }
            }
        }
    }
}