import Data from '../Data.js'
import DataMap from '../DataMap.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import {EventDefault} from '../Event/EventDefault.js'
import {SettingTwitchReward} from '../Setting/SettingTwitch.js'
import {OptionTwitchRewardUsable, OptionTwitchRewardVisible} from '../../Options/OptionTwitch.js'
import {OptionSystemActionType} from '../../Options/OptionSystemActionType.js'
import Action, {IActionCallback} from '../Action.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
import Utils from '../../Classes/Utils.js'
import Color from '../../Classes/ColorConstants.js'
import TwitchHelixHelper from '../../Classes/TwitchHelixHelper.js'
import {ActionHandler} from '../../Pages/Widget/Actions.js'
import ArrayUtils from '../../Classes/ArrayUtils.js'
import ActionsCallbacks from '../../Pages/Widget/ActionsCallbacks.js'
import {TriggerReward} from '../Trigger/TriggerReward.js'
import ConfigTwitch from '../Config/ConfigTwitch.js'
import DataBaseHelper from '../../Classes/DataBaseHelper.js'

export class ActionSystem extends Action {
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

    build(key: string): IActionCallback {
        return {
            tag: '🖐',
            description: 'Callback that triggers or toggles events',
            call: async(user, index) => {
                const clone = Utils.clone<ActionSystem>(this)
                const modules = ModulesSingleton.getInstance()
                const settings = await DataBaseHelper.loadMain(new ConfigTwitch())
                const interval = clone.trigger.interval
                let delay = 0

                // Trigger System Actions
                const systemActions = ArrayUtils.getAsType(clone.trigger.systemActionEntries, clone.trigger.systemActionEntries_use, index)
                for(const systemAction of systemActions) {
                    const callback = ActionsCallbacks.stack[systemAction]
                    if(callback) {
                        Utils.log(`Executing system action: ${callback.tag} in ${delay} seconds...`, Color.Grey)
                        setTimeout(()=>{
                            callback.call(user, index)
                        }, delay*1000)
                        delay += interval
                    }
                }

                // Trigger Commands
                const commands = ArrayUtils.getAsType(clone.trigger.commandEntries, clone.trigger.commandEntries_use, index)
                for(let command of commands) {
                    if(command.startsWith(settings.commandPrefix)) command = command.substring(1)
                    Utils.log(`Executing command: ${command} in ${delay} seconds...`, Color.Grey)
                    let inputText = user.input
                    if(command.includes(' ')) inputText = Utils.splitOnFirst(' ', inputText)[0]
                    setTimeout(()=>{
                        modules.twitch.runCommand(command, {...user, input: inputText}).then()
                    }, delay*1000)
                    delay += interval
                }

                // Trigger Events by Keys
                const keys = Utils.ensureStringArrayNotId(ArrayUtils.getAsType(clone.trigger.eventEntries, clone.trigger.eventEntries_use, index))
                for(const key of keys) {
                    Utils.log(`Executing event: ${key} in ${delay} seconds...`, Color.Grey)
                    if(key == user.eventKey) continue // Prevent infinite loop
                    setTimeout(()=>{
                        new ActionHandler(key).call(user).then()
                    }, delay*1000)
                    delay += interval
                }

                // Toggle Rewards
                const rewardStates = Utils.ensureObjectArrayNotId(clone.toggle.rewardStates)

                // Grab reward triggers from events and convert them to reward states.
                for(const eventStates of Utils.ensureObjectArrayNotId(clone.toggle.rewardStatesForEvents)) {
                    const eventId = Utils.ensureStringNotId(eventStates.event) ?? ''
                    const event = await DataBaseHelper.load(new EventDefault(), eventId)
                    if(event) {
                        const rewards = Utils.ensureObjectArrayNotId(event.triggers).filter(e =>
                            e.constructor.name == TriggerReward.name
                        )
                        for(const reward of rewards) {
                            const rewardID = Utils.ensureStringNotId((reward as TriggerReward).rewardID)
                            if(rewardID) {
                                const newState = new ActionSystemRewardState()
                                newState.reward = rewardID
                                newState.reward_usable = eventStates.event_usable
                                newState.reward_visible = eventStates.event_visible
                                rewardStates.push(newState)
                            }
                        }
                    }
                }

                // Toggle the rewards on Twitch
                await TwitchHelixHelper.toggleRewards(rewardStates)
            }
        }
    }
}
export class ActionSystemTrigger extends Data {
    interval: number = 0
    systemActionEntries: number[] = []
    systemActionEntries_use = OptionEntryUsage.All
    commandEntries: string[] = []
    commandEntries_use = OptionEntryUsage.All
    eventEntries: (number|string)[] = []
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
    reward: number|string = 0
    reward_visible = OptionTwitchRewardVisible.Visible
    reward_usable = OptionTwitchRewardUsable.Enabled

    enlist() {
        DataMap.addSubInstance(
            new ActionSystemRewardState(),
            {
                reward: 'The reward to update, if it should be visible and/or redeemable.'
            },
            {
                reward: SettingTwitchReward.refIdKeyLabel(),
                reward_visible: OptionTwitchRewardVisible.ref(),
                reward_usable: OptionTwitchRewardUsable.ref()
            }
        )
    }
}
export class ActionSystemRewardStateForEvent extends Data {
    event: number|string = 0
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
                event_usable: OptionTwitchRewardUsable.ref()
            }
        )
    }
}