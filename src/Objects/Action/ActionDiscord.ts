import DataMap from '../DataMap.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import {PresetDiscordWebhook} from '../Preset/PresetDiscordWebhook.js'
import Action, {IActionCallback, IActionUser} from '../Action.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
import TwitchHelixHelper from '../../Classes/TwitchHelixHelper.js'
import Utils from '../../Classes/Utils.js'
import DiscordUtils from '../../Classes/DiscordUtils.js'
import Config from '../../Classes/Config.js'
import TextHelper from '../../Classes/TextHelper.js'
import ArrayUtils from '../../Classes/ArrayUtils.js'

export class ActionDiscord extends Action {
    webhook: number|PresetDiscordWebhook = 0
    entries: string[] = []
    entries_use = OptionEntryUsage.First

    enlist() {
        DataMap.addRootInstance(
            new ActionDiscord(),
            'Send a message to a Discord channel.',
            {},
            {
                webhook: PresetDiscordWebhook.refId(),
                entries: 'string',
                entries_use: OptionEntryUsage.ref()
            }
        )
    }

    build(key: string): IActionCallback {
        return {
            tag: '💬',
            description: 'Callback that triggers a DiscordUtils message action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone<ActionDiscord>(this)
                const modules = ModulesSingleton.getInstance()
                const userData = await TwitchHelixHelper.getUserById(user.id)
                const entries = ArrayUtils.getAsType(clone.entries, clone.entries_use, index)
                for(const entry of entries ) {
                    DiscordUtils.enqueueMessage(
                        // TODO: Change to take the full preset so we can post to forums and existing posts?
                        Utils.ensureObjectNotId(clone.webhook)?.url ?? '',
                        user.name,
                        userData?.profile_image_url,
                        await TextHelper.replaceTagsInText(entry, user)
                    )
                }
            }
        }
    }
}
