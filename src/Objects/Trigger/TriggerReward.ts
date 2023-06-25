import Data from '../Data.js'
import DataMap from '../DataMap.js'
import {PresetReward} from '../Preset/PresetReward.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import {SettingTwitchReward} from '../Setting/SettingTwitch.js'
import {PresetPermissions} from '../Preset/PresetPermissions.js'
import Trigger from '../Trigger.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
import {ITwitchReward} from '../../Interfaces/itwitch.js'
import Utils from '../../Classes/Utils.js'
import {ActionHandler} from '../../Pages/Widget/Actions.js'

export class TriggerReward extends Trigger {
    permissions: number|PresetPermissions = 0
    rewardID: (number|string) = 0
    rewardEntries: (number|Data)[] = []
    rewardEntriesType = OptionEntryUsage.All

    enlist() {
        DataMap.addRootInstance(new TriggerReward(),
            'This is a Twitch Channel Point Reward, triggered by a redemption on your channel page.',
            {
                permissions: 'Permission for who can redeem this reward.',
                rewardID: 'This is a reference to the reward on Twitch, leave empty to have it create a new reward when running the widget.',
                rewardEntries: 'One ore multiple reward presets.'
            },
            {
                permissions: PresetPermissions.refId(),
                rewardID: SettingTwitchReward.refIdKeyLabel(),
                rewardEntries: Data.genericRef('PresetReward'),
                rewardEntriesType: OptionEntryUsage.ref()
            }
        )
    }

    register(eventKey: string) {
        const modules = ModulesSingleton.getInstance()
        const actionHandler = new ActionHandler(eventKey)
        if(typeof this.rewardID == 'string') {
            const reward: ITwitchReward = {
                id: this.rewardID.toString(),
                handler: actionHandler
            }
            modules.twitchEventSub.registerReward(reward)
        } else {
            Utils.logWithBold(`No Reward ID for <${eventKey}>, it might be missing a reward config.`, 'red')
        }
    }
}