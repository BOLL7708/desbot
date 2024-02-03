import Data, {DataEntries} from '../Data.js'
import DataMap from '../DataMap.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import {EventDefault} from '../Event/EventDefault.js'
import {SettingTwitchReward} from '../Setting/SettingTwitch.js'
import {OptionTwitchRewardUsable, OptionTwitchRewardVisible} from '../../Options/OptionTwitch.js'
import {OptionSystemActionType} from '../../Options/OptionSystemActionType.js'
import Action, {IActionCallback, IActionUser} from '../Action.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
import Utils from '../../Classes/Utils.js'
import Color from '../../Classes/ColorConstants.js'
import TwitchHelixHelper from '../../Classes/TwitchHelixHelper.js'
import {ActionHandler} from '../../Pages/Widget/Actions.js'
import ArrayUtils from '../../Classes/ArrayUtils.js'
import ActionsCallbacks from '../../Pages/Widget/ActionsCallbacks.js'
import {TriggerReward} from '../Trigger/TriggerReward.js'
import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import ConfigCommands from '../Config/ConfigCommands.js'
import {DataUtils} from '../DataUtils.js'
import {PresetReward} from '../Preset/PresetReward.js'

export class ActionSystem extends Action {
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

    build(key: string): IActionCallback {
        return {
            description: 'Callback that triggers or toggles events',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone<ActionSystem>(this)
                const modules = ModulesSingleton.getInstance()
                const interval = clone.trigger.interval
                let delay = 0

                // Trigger System Actions
                const systemActions = ArrayUtils.getAsType(clone.trigger.systemActionEntries, clone.trigger.systemActionEntries_use, index)
                for(const systemAction of systemActions) {
                    const callback = ActionsCallbacks.stack[systemAction]
                    if(callback) {
                        Utils.log(`Executing system action in ${delay} seconds...`, Color.Grey)
                        setTimeout(()=>{
                            callback.call(user, nonce, index)
                        }, delay*1000)
                        delay += interval
                    }
                }

                // Trigger Commands
                const commandsConfig = await DataBaseHelper.loadMain(new ConfigCommands())
                const commands = ArrayUtils.getAsType(clone.trigger.commandEntries, clone.trigger.commandEntries_use, index)
                for(let command of commands) {
                    if(command.startsWith(commandsConfig.commandPrefix)) command = command.substring(1)
                    Utils.log(`Executing command: ${command} in ${delay} seconds...`, Color.Grey)
                    let inputText = user.input
                    if(command.includes(' ')) inputText = Utils.splitOnFirst(' ', inputText)[0]
                    setTimeout(()=>{
                        modules.twitch.runCommand(command, {...user, input: inputText}).then()
                    }, delay*1000)
                    delay += interval
                }

                // Trigger Events by Keys
                const keys = ArrayUtils.getAsType(DataUtils.ensureKeyArray(clone.trigger.eventEntries) ?? [], clone.trigger.eventEntries_use, index)
                for(const key of keys) {
                    Utils.log(`Executing event: ${key} in ${delay} seconds...`, Color.Grey)
                    if(key == user.eventKey) continue // Prevent infinite loop
                    setTimeout(()=>{
                        new ActionHandler(key).call(user).then()
                    }, delay*1000)
                    delay += interval
                }

                // Toggle Rewards
                const rewardStates = clone.toggle.rewardStates

                // Grab reward triggers from events and convert them to reward states.
                for(const eventStates of clone.toggle.rewardStatesForEvents) {
                    const eventEntry = DataUtils.ensureItem(eventStates.event)
                    const event = eventEntry?.dataSingle.filledData
                    if(event) {
                        const rewards = DataUtils.ensureDataArray(event.triggers).filter(trigger => trigger.__getClass() == TriggerReward.name) as TriggerReward[]
                        for(const reward of rewards) {
                            const rewardID = DataUtils.ensureItem(reward.rewardID)
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
    eventEntries: number[]|DataEntries<EventDefault> = []
    eventEntries_use = OptionEntryUsage.All

    enlist() {
        DataMap.addSubInstance({
            instance: new ActionSystemTrigger(),
            documentation: {
                interval: 'Set the trigger entries to be triggered at an interval in seconds to space things out in time.',
                systemActionEntries: 'Trigger system features that are not separate actions.',
                commandEntries: 'Command(s) to trigger.',
                eventEntries: 'Event(s) to trigger.'
            },
            types: {
                systemActionEntries: OptionSystemActionType.ref,
                systemActionEntries_use: OptionEntryUsage.ref,
                commandEntries: 'string',
                commandEntries_use: OptionEntryUsage.ref,
                eventEntries: EventDefault.ref.id.build(),
                eventEntries_use: OptionEntryUsage.ref
            }
        })
    }
}
export class ActionSystemToggle extends Data {
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
export class ActionSystemRewardState extends Data {
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
export class ActionSystemRewardStateForEvent extends Data {
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