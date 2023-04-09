import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'
import {EnumEntryUsage} from '../../Enums/EntryType.js'
import {EventDefault} from '../Event/EventDefault.js'
import {SettingTwitchReward} from '../Setting/Twitch.js'
import {EnumTwitchRewardUsable, EnumTwitchRewardVisible} from '../../Enums/Twitch.js'

export class ActionSystem extends BaseDataObject {
    triggerCommandEntries: string[] = []
    triggerCommandEntriesType = EnumEntryUsage.First
    triggerEventEntries: number|EventDefault = 0
    triggerEventEntriesType = EnumEntryUsage.First
    triggerInterval: number = 0
    toggleRewardStates: ActionSystemRewardState[] = []
}
export class ActionSystemRewardState extends BaseDataObject {
    reward: number|SettingTwitchReward = 0
    visible = EnumTwitchRewardVisible.Enable
    usable = EnumTwitchRewardUsable.Unpause
}

DataObjectMap.addRootInstance(
    new ActionSystem(),
    'Trigger other events, propagating input.',
    {
        triggerCommandEntries: 'Command(s) to trigger.',
        triggerEventEntries: 'Event(s) to trigger.',
        triggerInterval: 'Set the trigger entries to be triggered at an interval in seconds to space things out in time.',
        toggleRewardStates: 'Set the states for a number of rewards.'
    },
    {
        triggerCommandEntries: 'string',
        triggerCommandEntriesType: EnumEntryUsage.ref(),
        triggerEventEntries: EventDefault.refId(),
        triggerEventEntriesType: EnumEntryUsage.ref(),
        toggleRewardStates: ActionSystemRewardState.ref()
    }
)
DataObjectMap.addSubInstance(
    new ActionSystemRewardState(),
    {
        reward: 'The reward to set the state for.',
        visible: 'If the reward should be visible.',
        usable: 'If the reward should be redeemable.'
    },
    {
        reward: SettingTwitchReward.refIdLabel('key'),
        visible: EnumTwitchRewardVisible.ref(),
        usable: EnumTwitchRewardUsable.ref()
    }
)