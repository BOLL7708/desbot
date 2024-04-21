import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.js'
import Utils from '../../../Shared/Utils/Utils.js'
import ModulesSingleton from '../../../Shared/Singletons/ModulesSingleton.js'
import ArrayUtils from '../../../Shared/Utils/ArrayUtils.js'
import SessionVars from '../../../Shared/Classes/SessionVars.js'
import DataBaseHelper from '../../../Shared/Helpers/DataBaseHelper.js'
import {SettingTwitchTokens} from '../../../Shared/Objects/Data/Setting/SettingTwitch.js'
import TextHelper from '../../../Shared/Helpers/TextHelper.js'
import ActionChat from '../../../Shared/Objects/Data/Action/ActionChat.js'
import AbstractActionRunner from './AbstractActionRunner.js'

export default class ActionChatRunner extends AbstractActionRunner {
    getCallback<T>(key: string, instance: T): IActionCallback {
        return {
            description: 'Callback that triggers a Twitch chat message action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone(instance as ActionChat)
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