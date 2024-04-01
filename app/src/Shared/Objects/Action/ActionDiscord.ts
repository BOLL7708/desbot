import Action, {IActionCallback, IActionUser} from '../Action.js'
import {DataEntries} from '../Data.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import DataMap from '../DataMap.js'
import {PresetDiscordWebhook} from '../Preset/PresetDiscordWebhook.js'
import Utils from '../../Classes/Utils.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
import TwitchHelixHelper from '../../Classes/TwitchHelixHelper.js'
import ArrayUtils from '../../Classes/ArrayUtils.js'
import DiscordUtils from '../../Classes/DiscordUtils.js'
import {DataUtils} from '../DataUtils.js'
import TextHelper from '../../Classes/TextHelper.js'

export class ActionDiscord extends Action {
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
