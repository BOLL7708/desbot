import AbstractAction, {IActionCallback} from './AbstractAction.mts'
import DataMap from '../DataMap.mts'
import AbstractData, {DataEntries} from '../AbstractData.mts'
import {OptionEntryUsage} from '../../Options/OptionEntryType.mts'
import {INumberDictionary} from '../../../Interfaces/igeneral.mts'
import {OptionSystemActionType} from '../../Options/OptionSystemActionType.mts'
import EventDefault from '../Event/EventDefault.mts'
import {OptionTwitchRewardUsable, OptionTwitchRewardVisible} from '../../Options/OptionTwitch.mts'
import {SettingTwitchReward} from '../Setting/SettingTwitch.mts'
import SettingUser from '../Setting/SettingUser.mts'

export default class ActionSystem extends AbstractAction {
    trigger = new ActionSystemTrigger()
    toggle = new ActionSystemToggle()

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionSystem(),
            tag: '🤖',
            description: 'Trigger or change state of things, propagating input.',
            documentation: {
                trigger: 'Things to trigger.',
                toggle: 'Things to toggle.',
            }
        })
    }

    async build(key: string): Promise<IActionCallback> {
        const runner = await import('../../../../Server/Runners/Action/ActionSystemRunner.mts')
        const instance = new runner.default()
        return instance.getCallback<ActionSystem>(key, this)
    }
}
export class ActionSystemTrigger extends AbstractData {
    interval: number = 0
    systemActionEntries: number[] = []
    systemActionEntries_use = OptionEntryUsage.All
    commandEntries: string[] = []
    commandEntries_use = OptionEntryUsage.All
    eventEntries: number[]|DataEntries<EventDefault> = []
    eventEntries_use = OptionEntryUsage.All
    matchedEventEntries: INumberDictionary|DataEntries<EventDefault> = {}
    matchedEventEntries_caseSensitive = false
    matchedEventEntries_isRegex = false
    userEventEntries: ActionSystemUserEvent[] = []

    enlist() {
        DataMap.addSubInstance({
            instance: new ActionSystemTrigger(),
            documentation: {
                interval: 'Set the trigger entries to be triggered at an interval in seconds to space things out in time.',
                systemActionEntries: 'Trigger system features that are not separate actions.',
                commandEntries: 'Command(s) to trigger.',
                eventEntries: 'Event(s) to trigger.',
                matchedEventEntries: 'Events to trigger that matches user inputs. Add one with the key * to use as default if no match. Regex is supported if you enable it.',
                userEventEntries: 'Events to trigger for specific users. Add one with no selected user to have it act as the default if there is no match.'
            },
            instructions: {
                matchedEventEntries: 'If you use regex here, no need to surround it in slashes, only add what to match, a straight forward method is to use <code>.*</code> as a wildcard.'
            },
            types: {
                systemActionEntries: OptionSystemActionType.ref,
                systemActionEntries_use: OptionEntryUsage.ref,
                commandEntries: 'string',
                commandEntries_use: OptionEntryUsage.ref,
                eventEntries: EventDefault.ref.id.build(),
                eventEntries_use: OptionEntryUsage.ref,
                matchedEventEntries: EventDefault.ref.id.build(),
                userEventEntries: ActionSystemUserEvent.ref.build()
            }
        })
    }
}
export class ActionSystemToggle extends AbstractData {
    rewardStates: ActionSystemRewardState[] = []
    rewardStatesForEvents: ActionSystemRewardStateForEvent[] = []

    enlist() {
        DataMap.addSubInstance({
            instance: new ActionSystemToggle(),
            documentation: {
                rewardStates: 'Set the states for a number of rewards.',
                rewardStatesForEvents: 'Set the states for a number of rewards in events.'
            },
            types: {
                rewardStates: ActionSystemRewardState.ref.build(),
                rewardStatesForEvents: ActionSystemRewardStateForEvent.ref.build()
            }
        })
    }
}
export class ActionSystemRewardState extends AbstractData {
    reward: number|DataEntries<SettingTwitchReward> = 0
    reward_visible = OptionTwitchRewardVisible.NoChange
    reward_usable = OptionTwitchRewardUsable.NoChange

    enlist() {
        DataMap.addSubInstance({
            instance: new ActionSystemRewardState(),
            documentation: {
                reward: 'The reward to update, if it should be visible and/or redeemable.'
            },
            types: {
                reward: SettingTwitchReward.ref.id.label.build(),
                reward_visible: OptionTwitchRewardVisible.ref,
                reward_usable: OptionTwitchRewardUsable.ref
            }
        })
    }
}
export class ActionSystemRewardStateForEvent extends AbstractData {
    event: number|DataEntries<EventDefault> = 0
    event_visible = OptionTwitchRewardVisible.Visible
    event_usable = OptionTwitchRewardUsable.Enabled

    enlist() {
        DataMap.addSubInstance({
            instance: new ActionSystemRewardStateForEvent(),
            documentation: {
                event: 'The event to look for a reward to update in, if it should be visible and/or redeemable.'
            },
            types: {
                event: EventDefault.ref.id.build(),
                event_visible: OptionTwitchRewardVisible.ref,
                event_usable: OptionTwitchRewardUsable.ref
            }
        })
    }
}
export class ActionSystemUserEvent extends AbstractData {
    user: number|DataEntries<SettingUser> = 0
    event: number|DataEntries<EventDefault> = 0

    enlist() {
        DataMap.addSubInstance({
            instance: new ActionSystemUserEvent(),
            documentation: {
                event: 'Trigger this event for a specific user.'
            },
            types: {
                user: SettingUser.ref.id.label.build(),
                event: EventDefault.ref.id.build()
            }
        })
    }
}