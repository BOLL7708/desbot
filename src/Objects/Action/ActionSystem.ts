import Data from '../Data.js'
import DataMap from '../DataMap.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import {EventDefault} from '../Event/EventDefault.js'
import {SettingTwitchReward} from '../Setting/SettingTwitch.js'
import {OptionTwitchRewardUsable, OptionTwitchRewardVisible} from '../../Options/OptionTwitch.js'
import {OptionSystemActionType} from '../../Options/OptionSystemActionType.js'

export class ActionSystem extends Data {
    trigger = new ActionSystemTrigger()
    toggle = new ActionSystemToggle()

    enlist() {
        DataMap.addRootInstance(
            new ActionSystem(),
            'Trigger or change state of things, propagating input.',
            {
                trigger: 'Things to trigger.',
                toggle: 'Things to toggle.',
            }
        )
    }
}
export class ActionSystemTrigger extends Data {
    interval: number = 0
    systemActionEntries: OptionSystemActionType[] = []
    systemActionEntries_use = OptionEntryUsage.All
    commandEntries: string[] = []
    commandEntries_use = OptionEntryUsage.All
    eventEntries: (number|EventDefault)[] = []
    eventEntries_use = OptionEntryUsage.All

    enlist() {
        DataMap.addSubInstance(
            new ActionSystemTrigger(),
            {
                interval: 'Set the trigger entries to be triggered at an interval in seconds to space things out in time.',
                systemActionEntries: 'Trigger system features that are not separate actions.',
                commandEntries: 'Command(s) to trigger.',
                eventEntries: 'Event(s) to trigger.'
            },
            {
                systemActionEntries: OptionSystemActionType.ref(),
                systemActionEntries_use: OptionEntryUsage.ref(),
                commandEntries: 'string',
                commandEntries_use: OptionEntryUsage.ref(),
                eventEntries: EventDefault.refIdKey(),
                eventEntries_use: OptionEntryUsage.ref()
            }
        )
    }
}
export class ActionSystemToggle extends Data {
    rewardStates: ActionSystemRewardState[] = []
    rewardStatesForEvents: ActionSystemRewardStateForEvent[] = []

    enlist() {
        DataMap.addSubInstance(
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
    }
}
export class ActionSystemRewardState extends Data {
    reward: number|SettingTwitchReward = 0
    reward_visible = OptionTwitchRewardVisible.Visible
    reward_usable = OptionTwitchRewardUsable.Enabled

    enlist() {
        DataMap.addSubInstance(
            new ActionSystemRewardState(),
            {
                reward: 'The reward to update, if it should be visible and/or redeemable.'
            },
            {
                reward: SettingTwitchReward.refIdLabel(),
                reward_visible: OptionTwitchRewardVisible.ref(),
                reward_usable: OptionTwitchRewardUsable.ref()
            }
        )
    }
}
export class ActionSystemRewardStateForEvent extends Data {
    event: number|EventDefault = 0
    event_visible = OptionTwitchRewardVisible.Visible
    event_usable = OptionTwitchRewardUsable.Enabled

    enlist() {
        DataMap.addSubInstance(
            new ActionSystemRewardStateForEvent(),
            {
                event: 'The event to look for a reward to update in, if it should be visible and/or redeemable.'
            },
            {
                event: EventDefault.refIdKey(),
                event_visible: OptionTwitchRewardVisible.ref(),
                event_usable: OptionTwitchRewardVisible.ref()
            }
        )
    }
}