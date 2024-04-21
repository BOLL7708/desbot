import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.js'
import Utils from '../../../Shared/Utils/Utils.js'
import ModulesSingleton from '../../../Shared/Singletons/ModulesSingleton.js'
import ArrayUtils from '../../../Shared/Utils/ArrayUtils.js'
import ActionsCallbacks from '../../../Shared/Bot/ActionsCallbacks.js'
import Color from '../../../Shared/Constants/ColorConstants.js'
import DataBaseHelper from '../../../Shared/Helpers/DataBaseHelper.js'
import ConfigCommands from '../../../Shared/Objects/Data/Config/ConfigCommands.js'
import DataUtils from '../../../Shared/Objects/Data/DataUtils.js'
import {ActionHandler} from '../../../Shared/Bot/Actions.js'
import EventDefault from '../../../Shared/Objects/Data/Event/EventDefault.js'
import TriggerReward from '../../../Shared/Objects/Data/Trigger/TriggerReward.js'
import TwitchHelixHelper from '../../../Shared/Helpers/TwitchHelixHelper.js'
import ActionSystem, {ActionSystemRewardState} from '../../../Shared/Objects/Data/Action/ActionSystem.js'

export default class ActionSystemRunner extends ActionSystem {
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

                // Trigger Events
                const keys = ArrayUtils.getAsType(DataUtils.ensureKeyArray(clone.trigger.eventEntries) ?? [], clone.trigger.eventEntries_use, index)
                for(const key of keys) {
                    Utils.log(`Executing event: ${key} in ${delay} seconds...`, Color.Grey)
                    if(key == user.eventKey) continue // Prevent infinite loop
                    setTimeout(()=>{
                        new ActionHandler(key).call(user).then()
                    }, delay*1000)
                    delay += interval
                }

                // Trigger Events on User Input
                const matchEntries = DataUtils.ensureItemDictionary<EventDefault>(this.trigger.matchedEventEntries)?.dataDictionary ?? {}
                const matchTheseKeys = Object.keys(matchEntries)
                const matchCaseSensitive = this.trigger.matchedEventEntries_caseSensitive
                const matchRegex = this.trigger.matchedEventEntries_isRegex
                const matchThisInput = (matchCaseSensitive ? user.input : user.input.toLowerCase()).trim()
                const matchDefaultEventKey = matchEntries['*']?.key

                const matchedInput = matchTheseKeys.find((match)=> {
                    const matchKey = (matchCaseSensitive ? match : match.toLowerCase()).trim()
                    if(matchRegex) {
                        try {
                            const re = new RegExp(`^${matchKey}$`)
                            if(matchThisInput.match(re) !== null) return true
                        } catch (e) {
                            console.error(`ActionSystem, match on user input, invalid regex: ${matchKey}`, e)
                            if(matchThisInput == matchKey) return true // Fallback
                        }
                    } else {
                        if(matchThisInput == matchKey) return true
                    }
                })
                const matchedEventKey = matchedInput ? matchEntries[matchedInput]?.key : undefined
                if(matchedEventKey?.length) new ActionHandler(matchedEventKey).call(user).then()
                else if(matchDefaultEventKey?.length) new ActionHandler(matchDefaultEventKey).call(user).then()

                // Trigger Events on User
                let userEvent = clone.trigger.userEventEntries.find(
                    (userEvent)=> {
                        const data = DataUtils.ensureItem(userEvent.user)
                        const key = parseInt(data?.dataSingle.key ?? '0')
                        return key == user.id
                    }
                )
                if(!userEvent) {
                    userEvent = clone.trigger.userEventEntries.find((userEvent) => {
                        const data = DataUtils.ensureItem(userEvent.user)
                        const key = data?.dataSingle.id ?? -1
                        return key == 0
                    })
                }
                if(userEvent) {
                    const userEventEntry = DataUtils.ensureItem<EventDefault>(userEvent.event)
                    if(userEventEntry) {
                        new ActionHandler(userEventEntry.dataSingle.key).call(user).then()
                    }
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