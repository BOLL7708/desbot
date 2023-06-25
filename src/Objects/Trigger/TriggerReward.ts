import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'
import {PresetReward} from '../Preset/PresetReward.js'
import {EnumEntryUsage} from '../../Enums/EntryType.js'
import {SettingTwitchReward} from '../Setting/SettingTwitch.js'
import {PresetPermissions} from '../Preset/PresetPermissions.js'

export class TriggerReward extends BaseDataObject {
    permissions: number|PresetPermissions = 0
    rewardID: (number|string) = 0
    rewardEntries: (number|BaseDataObject)[] = []
    rewardEntriesType = EnumEntryUsage.All

    register() {
        DataObjectMap.addRootInstance(new TriggerReward(),
            'This is a Twitch Channel Point Reward, triggered by a redemption on your channel page.',
            {
                permissions: 'Permission for who can redeem this reward.',
                rewardID: 'This is a reference to the reward on Twitch, leave empty to have it create a new reward when running the widget.',
                rewardEntries: 'One ore multiple reward presets.'
            },
            {
                permissions: PresetPermissions.refId(),
                rewardID: SettingTwitchReward.refIdKeyLabel(),
                rewardEntries: BaseDataObject.genericRef('PresetReward'),
                rewardEntriesType: EnumEntryUsage.ref()
            }
        )
    }
}