import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.js'
import Utils from '../../../Shared/Utils/Utils.js'
import ModulesSingleton from '../../../Shared/Singletons/ModulesSingleton.js'
import TwitchHelixHelper from '../../../Shared/Helpers/TwitchHelixHelper.js'
import ArrayUtils from '../../../Shared/Utils/ArrayUtils.js'
import DiscordUtils from '../../../Shared/Utils/DiscordUtils.js'
import DataUtils from '../../../Shared/Objects/Data/DataUtils.js'
import TextHelper from '../../../Shared/Helpers/TextHelper.js'
import ActionDiscord from '../../../Shared/Objects/Data/Action/ActionDiscord.js'

export default class ActionDiscordRunner extends ActionDiscord {
    build(key: string): IActionCallback {
        return {
            description: 'Callback that triggers a DiscordUtils message action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone<ActionDiscord>(this)
                const modules = ModulesSingleton.getInstance()
                const userData = await TwitchHelixHelper.getUserById(user.id)
                const entries = ArrayUtils.getAsType(clone.entries, clone.entries_use, index)
                for(const entry of entries ) {
                    DiscordUtils.enqueueMessage(
                        // TODO: Change to take the full preset so we can post to forums and existing posts?
                        DataUtils.ensureData(clone.webhook)?.url ?? '',
                        user.name,
                        userData?.profile_image_url,
                        await TextHelper.replaceTagsInText(entry, user)
                    )
                }
            }
        }
    }
}