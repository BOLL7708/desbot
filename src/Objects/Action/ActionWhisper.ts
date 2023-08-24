import DataMap from '../DataMap.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import Action, {IActionCallback, IActionUser} from '../Action.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
import Utils from '../../Classes/Utils.js'
import TextHelper from '../../Classes/TextHelper.js'
import ArrayUtils from '../../Classes/ArrayUtils.js'

// TODO: Incomplete as it doesn't really work now anyway.
export class ActionWhisper extends Action {
    entries: string[] = ['']
    entries_use = OptionEntryUsage.First
    user: string = '' // TODO: Change to whichever way we reference users in the future.

    enlist() {
        DataMap.addRootInstance(
            new ActionWhisper(),
            'Send a whisper message to a Twitch user.',
            {},
            {
                entries: 'string',
                entries_use: OptionEntryUsage.ref()
            }
        )
    }

    build(key: string): IActionCallback {
        return {
            tag: '💭',
            description: 'Callback that triggers a Twitch whisper action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                // TODO: This doesn't work properly now anyway but maybe in the future...
                const modules = ModulesSingleton.getInstance()
                const clone = Utils.clone<ActionWhisper>(this)
                const entries = ArrayUtils.getAsType(clone.entries, clone.entries_use, index)
                for(const entry of entries) {
                    modules.twitch._twitchChatOut.sendMessageToUser(
                        await TextHelper.replaceTagsInText(clone.user, user),
                        await TextHelper.replaceTagsInText(entry, user)
                    )
                }
            }
        }
    }
}