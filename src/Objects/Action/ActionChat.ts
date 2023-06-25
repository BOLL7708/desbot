import DataMap from '../DataMap.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import Action, {IActionCallback, IActionUser} from '../Action.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
import Utils from '../../Classes/Utils.js'
import TextHelper from '../../Classes/TextHelper.js'
import ArrayUtils from '../../Classes/ArrayUtils.js'

export class ActionChat extends Action {
    entries: string[] = []
    entries_use = OptionEntryUsage.First
    enlist() {
        DataMap.addRootInstance(
            new ActionChat(),
            'Send message(s) to Twitch chat.',
            {},
            {
                entries: 'string',
                entries_use: OptionEntryUsage.ref()
            }
        )
    }

    build(key: string): IActionCallback {
        return {
            tag: '📄',
            description: 'Callback that triggers a Twitch chat message action',
            call: async (user: IActionUser, index?: number) => {
                const clone = Utils.clone(this) as ActionChat
                const modules = ModulesSingleton.getInstance()
                const entries = ArrayUtils.getAsType(Utils.ensureArray(clone.entries), clone.entries_use, index)
                for(const entry of entries) {
                    modules.twitch._twitchChatOut.sendMessageToChannel(
                        await TextHelper.replaceTagsInText(entry, user)
                    )
                }
            }
        }
    }
}