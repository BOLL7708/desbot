import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'
import {EnumEntryUsage} from '../../Enums/EntryType.js'
import {EventDefault} from '../Event/EventDefault.js'
import {SettingTwitchReward} from '../Setting/Twitch.js'
import {EnumTwitchRewardUsable, EnumTwitchRewardVisible} from '../../Enums/Twitch.js'
import {EnumSystemActionType} from '../../Enums/SystemActionType.js'

export class ActionSystem extends BaseDataObject {
    trigger = new ActionSystemTrigger()
    toggle = new ActionSystemToggle()
}
export class ActionSystemTrigger extends BaseDataObject {
    interval: number = 0
    systemActionEntries: EnumSystemActionType[] = []
    systemActionEntries_use = EnumEntryUsage.All
    commandEntries: string[] = []
    commandEntries_use = EnumEntryUsage.All
    eventEntries: (number|EventDefault)[] = []
    eventEntries_use = EnumEntryUsage.All
}
export class ActionSystemToggle extends BaseDataObject {
    rewardStates: ActionSystemRewardState[] = []
    rewardStatesForEvents: ActionSystemRewardStateForEvent[] = []
}
export class ActionSystemRewardState extends BaseDataObject {
    reward: number|SettingTwitchReward = 0
    reward_visible = EnumTwitchRewardVisible.Visible
    reward_usable = EnumTwitchRewardUsable.Enabled
}
export class ActionSystemRewardStateForEvent extends BaseDataObject {
    event: number|EventDefault = 0
    event_visible = EnumTwitchRewardVisible.Visible
    event_usable = EnumTwitchRewardUsable.Enabled
}


DataObjectMap.addRootInstance(
    new ActionSystem(),
    'Trigger or change state of things, propagating input.',
    {
        trigger: 'Things to trigger.',
        toggle: 'Things to toggle.',
    }
)
DataObjectMap.addSubInstance(
    new ActionSystemTrigger(),
    {
        interval: 'Set the trigger entries to be triggered at an interval in seconds to space things out in time.',
        systemActionEntries: 'Trigger system features that are not separate actions.',
        commandEntries: 'Command(s) to trigger.',
        eventEntries: 'Event(s) to trigger.'
    },
    {
        systemActionEntries: EnumSystemActionType.ref(),
        systemActionEntries_use: EnumEntryUsage.ref(),
        commandEntries: 'string',
        commandEntries_use: EnumEntryUsage.ref(),
        eventEntries: EventDefault.refIdKey(),
        eventEntries_use: EnumEntryUsage.ref()
    }
)
DataObjectMap.addSubInstance(
    new ActionSystemToggle(),
    {
        rewardStates: 'Set the states for a number of rewards.',
        rewardStatesForEvents: 'Set the states for a number of rewards in events.'
    },
    {
        rewardStates: ActionSystemRewardState.ref(),
        rewardStatesForEvents: ActionSystemRewardStateForEvent.ref()
    }
)
DataObjectMap.addSubInstance(
    new ActionSystemRewardState(),
    {
        reward: 'The reward to update, if it should be visible and/or redeemable.'
    },
    {
        reward: SettingTwitchReward.refIdLabel(),
        reward_visible: EnumTwitchRewardVisible.ref(),
        reward_usable: EnumTwitchRewardUsable.ref()
    }
)
DataObjectMap.addSubInstance(
    new ActionSystemRewardStateForEvent(),
    {
        event: 'The event to look for a reward to update in, if it should be visible and/or redeemable.'
    },
    {
        event: EventDefault.refIdKey(),
        event_visible: EnumTwitchRewardVisible.ref(),
        event_usable: EnumTwitchRewardVisible.ref()
    }
)