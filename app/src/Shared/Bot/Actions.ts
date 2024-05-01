import AbstractAction, {IActionCallback, IActionsExecutor, IActionsMainCallback, IActionUser} from '../Objects/Data/Action/AbstractAction.js'
import DataBaseHelper from '../Helpers/DataBaseHelper.js'
import StatesSingleton from '../Singletons/StatesSingleton.js'
import {OptionEventBehavior} from '../Objects/Options/OptionEventBehavior.js'
import ArrayUtils from '../Utils/ArrayUtils.js'
import TriggerReward from '../Objects/Data/Trigger/TriggerReward.js'
import DataUtils from '../Objects/Data/DataUtils.js'
import Utils from '../Utils/Utils.js'
import TextHelper from '../Helpers/TextHelper.js'
import TwitchHelixHelper from '../Helpers/TwitchHelixHelper.js'
import {ActionSystemRewardState} from '../Objects/Data/Action/ActionSystem.js'
import {OptionTwitchRewardUsable, OptionTwitchRewardVisible} from '../Objects/Options/OptionTwitch.js'
import AbstractTrigger from '../Objects/Data/Trigger/AbstractTrigger.js'
import {ITwitchEventSubEventCheer, ITwitchEventSubEventRedemption} from '../Classes/TwitchEventSub.js'
import {EEventSource} from './Enums.js'
import {OptionEventRun} from '../Objects/Options/OptionEventRun.js'
import {OptionEntryUsage} from '../Objects/Options/OptionEntryType.js'
import {SettingAccumulatingCounter, SettingIncrementingCounter} from '../Objects/Data/Setting/SettingCounters.js'
import PresetReward from '../Objects/Data/Preset/PresetReward.js'
import Color from '../Constants/ColorConstants.js'
import {SettingTwitchTokens} from '../Objects/Data/Setting/SettingTwitch.js'
import EventDefault, {EventActionContainer} from '../Objects/Data/Event/EventDefault.js'

export class ActionHandler {
    constructor(
        public key: string,
        public appId: string = ''
    ) {}
    public async call(user: IActionUser) {
        let event = await DataBaseHelper.loadOrEmpty(new EventDefault(), this.key)

        /* TODO: REIMPLEMENT GAME EVENTS LATER WHEN WE ACTUALLY CAN STORE GAME EVENTS
        if(this.appId.length > 0) {
            const gameEvent = Utils.getEventForGame(this.key, this.appId)
            if(gameEvent) {
                event = gameEvent
            }
            const newEvent = Utils.clone(event)
            if(gameEvent?.actionsEntries && event?.actionsEntries) {
                const newActions = []
                const defaultActions = Utils.ensureArray(event.actionsEntries ?? {})
                const thisActions = Utils.ensureArray(gameEvent.actionsEntries ?? {})
                for(let i=0; i<Math.max(defaultActions.length, thisActions.length); i++) {
                    newActions[i] = {
                        ...(defaultActions[i] ?? {}),
                        ...(thisActions[i] ?? {})
                    }
                    if(newEvent) newEvent.actionsEntries = newActions
                }
            }
            event = newEvent
        }
        */

        // TODO: This should execute collections of actions in order.
        //  The main callback should take ALL OF THE THINGS?!?!?!?!

        const eventOptions = event.options
        // entries is an array of containers that then contains the actions.
        const eventActionContainers = event.actions
        if(eventActionContainers.length == 0) return

        let actionsMainCallback: IActionsMainCallback
        const states = StatesSingleton.getInstance()
        let actionIndex: number|undefined = undefined
        let entryIndex: number|undefined = undefined
        /*
            Here we handle the different types of behavior of the event.
            This means we often rebuild the full main callback.
            As well as calculate and provide the index for action entries.
         */
        switch(event.behavior) {
            case OptionEventBehavior.Random: {
                actionsMainCallback = await Actions.buildActionsMainCallback(this.key, ArrayUtils.getAsType(eventActionContainers, OptionEntryUsage.OneRandom, eventOptions.specificIndex))
                break
            }
            /**
             * Action set indices:
             * 0 - * : Will run from first level for as long as it has sets or reward presets, will repeat last action set forever unless an empty action set is at the end.
             */
            case OptionEventBehavior.Incrementing: {
                // Load incremental counter
                const options = event.incrementingOptions
                const eventId = await DataBaseHelper.loadID(EventDefault.ref.build(), this.key)
                const counter = await DataBaseHelper.loadOrEmpty(new SettingIncrementingCounter(), eventId.toString())
                if(counter.reachedMax && !options.loop) return console.warn(`Incrementing Event: Max reached for ${eventId}, not triggering.`)

                // Increase incremental counter
                counter.count++
                if(counter.count >= (options.maxValue > 0 ? options.maxValue : Infinity)) counter.reachedMax = true
                await DataBaseHelper.save(counter, eventId.toString())
                entryIndex = counter.count-1

                // Switch to the next incremental reward if it has more configs available
                const triggers = event.getTriggers(new TriggerReward())
                for(const trigger of triggers) {
                    const rewardEntries = (DataUtils.ensureDataArray(trigger.rewardEntries) ?? []) as PresetReward[] // TODO: Maybe we can remove this typecast by changing how generics are registered?
                    if(rewardEntries.length) {
                        let rewardPresetIndex = counter.count
                        if(options.loop) rewardPresetIndex = rewardPresetIndex % ( // Loop
                            options.maxValue > 0 ? options.maxValue : rewardEntries.length
                        )
                        rewardPresetIndex = Math.min(rewardPresetIndex, options.maxValue > 0 ? options.maxValue-1 : rewardEntries.length-1) // Clamp to max
                        const rewardPreset = rewardEntries[rewardPresetIndex]
                        if (rewardPreset) {
                            const clone = Utils.clone(rewardPreset)
                            clone.title = await TextHelper.replaceTagsInText(clone.title, user)
                            clone.prompt = await TextHelper.replaceTagsInText(clone.prompt, user)
                            const result = await TwitchHelixHelper.updateReward(DataUtils.ensureKey(trigger.rewardID), clone)
                            if(!result) console.warn('Incrementing Event: Failed to update reward', clone, result)
                        }
                    }
                }

                // Register index and build callback for this step of the sequence
                actionIndex = options.loop
                    ? (counter.count - 1) % (options.maxValue > 0 ? options.maxValue : eventActionContainers.length) // Loop
                    : Math.min(counter.count - 1, eventActionContainers.length-1) // Clamp to max
                actionsMainCallback = await Actions.buildActionsMainCallback(this.key, ArrayUtils.getAsType(eventActionContainers, OptionEntryUsage.OneByIndex, actionIndex))
                break
            }
            /**
             * If you have one reward preset, it will be used for all sets.
             * If you have two reward presets, the second one will be used when done.
             * If you have three or more reward presets, the second to last one will be for progress and the last one will be the finish.
             *
             * Action set indices:
             * 0 : start (applied on reset/update)
             * 1 : progress (second to last, or first if only one set)
             * 2 : finish (always the last, so works with a single set)
             */
            case OptionEventBehavior.Accumulating: {
                // Load accumulating counter
                const options = event.accumulatingOptions
                const eventId = await DataBaseHelper.loadID(EventDefault.ref.build(), this.key)
                const counter = await DataBaseHelper.loadOrEmpty(new SettingAccumulatingCounter(), eventId.toString())
                if(counter.reachedGoal) return console.warn(`Accumulating Event: Goal already reached for ${eventId}, not triggering.`)
                const goalCount = options.goal
                const isFirstCount = counter.count == 0

                // Increase accumulating counter
                counter.count += (user.rewardCost > 0 ? user.rewardCost : options.nonRewardIncrease)
                const goalIsMet = counter.count >= goalCount
                if(counter.count >= goalCount) counter.reachedGoal = true
                await DataBaseHelper.save(counter, eventId.toString())
                entryIndex = counter.count-1

                // Switch to the next accumulating reward if it has more configs available
                const triggers = event.getTriggers(new TriggerReward())
                for(const trigger of triggers) {
                    const rewardEntries = (DataUtils.ensureDataArray(trigger.rewardEntries) ?? []) as PresetReward[] // TODO: Maybe we can remove this typecast?
                    if(rewardEntries.length) {
                        let rewardIndex = 0
                        if (goalIsMet) { // Final
                            rewardIndex = Math.max(0, rewardEntries.length -1) // Last, fallback to first
                        } else { // Progress
                            rewardIndex = Math.max(0, rewardEntries.length - 2) // Second to last, fallback to first
                        }

                        const rewardPreset = rewardEntries[rewardIndex]
                        if(rewardPreset) {
                            const clone = Utils.clone(rewardPreset)
                            clone.title = await TextHelper.replaceTagsInText(clone.title, user)
                            clone.prompt = await TextHelper.replaceTagsInText(clone.prompt, user)

                            // Make sure the last reward doesn't cost more points than the total left.
                            const cost = clone.cost
                            if (rewardIndex < 2 && (counter.count + cost) > goalCount) {
                                clone.cost = Math.max(1, goalCount - counter.count)
                            }
                            if(goalIsMet) clone.is_paused = true
                            const result = await TwitchHelixHelper.updateReward(DataUtils.ensureKey(trigger.rewardID), clone as PresetReward) // TODO: Maybe we can remove this typecast?
                            if(!result) console.warn('Accumulating Event: Failed to update reward', clone, result)
                        }
                    }
                }

                // Register index and build callback for this step of the sequence
                if(eventActionContainers.length) {
                    actionIndex = 0 // First
                    if (goalIsMet) {
                        // Final
                        actionIndex = Math.max(eventActionContainers.length - 1) // Last, fallback to first
                    } else if(!isFirstCount) {
                        // Progress
                        actionIndex = Math.max(0, eventActionContainers.length - 2) // Second to last, fallback to first
                    }
                }
                actionsMainCallback = await Actions.buildActionsMainCallback(this.key, ArrayUtils.getAsType(eventActionContainers, OptionEntryUsage.OneByIndex, actionIndex))
                break
            }
            /**
             * Action set indices:
             * 0 : soft reset that can happen on each redemption
             * 1 : hard reset that will happen after timeout
             * 2-* : action sets that are run when redeemed and leveling up
             */
            case OptionEventBehavior.MultiTier: {
                // Increase multi-tier counter
                const options = event.multiTierOptions
                const eventId = await DataBaseHelper.loadID(EventDefault.ref.build(), this.key)
                const counter = states.multiTierEventCounters.get(eventId.toString()) ?? {count: 0, timeoutHandle: 0, reachedMax: false}
                counter.count++
                const maxLevel = event.multiTierOptions.maxLevel
                if(options.disableAfterMaxLevel && counter.reachedMax) {
                    return console.warn(`Multi-Tier Event: Max reached for ${eventId}, not triggering.`)
                }
                if (maxLevel > 0 && counter.count >= maxLevel) {
                    counter.reachedMax = true
                    counter.count = maxLevel
                }
                entryIndex = counter.count-1

                // Reset timeout
                clearTimeout(counter.timeoutHandle)
                counter.timeoutHandle = setTimeout(async() => {
                    // Run reset actions if enabled.
                    if(event.multiTierOptions.resetOnTimeout) {
                        // Will use this specific index to run the hard reset actions.
                        actionIndex = 1;
                        (await Actions.buildActionsMainCallback(
                            this.key,
                            ArrayUtils.getAsType(eventActionContainers, OptionEntryUsage.OneByIndex, actionIndex)
                        )) (user, actionIndex)
                    }

                    // Reset counter
                    counter.count = 0
                    counter.timeoutHandle = 0
                    counter.reachedMax = false
                    states.multiTierEventCounters.set(eventId.toString(), counter)

                    // Reset reward
                    const triggers = event.getTriggers(new TriggerReward())
                    for(const trigger of triggers) {
                        const rewardIdSetting = DataUtils.ensureData(trigger.rewardID)
                        const rewardIdKey = DataUtils.ensureKey(trigger.rewardID)
                        const rewardData = DataUtils.ensureDataArray(trigger.rewardEntries) as PresetReward[] // TODO: Maybe we can remove this typecast?
                        const rewardPreset = rewardData ? rewardData[0] : undefined
                        if(!rewardIdSetting || !rewardIdKey || !rewardPreset) continue

                        const clone = Utils.clone(rewardPreset)
                        if (clone) {
                            clone.title = await TextHelper.replaceTagsInText(clone.title, user)
                            clone.prompt = await TextHelper.replaceTagsInText(clone.prompt, user)
                            TwitchHelixHelper.updateReward(rewardIdKey, clone).then()
                        }

                        const state = new ActionSystemRewardState()
                        state.reward = DataUtils.buildFakeDataEntries(rewardIdSetting, 0, rewardIdKey)
                        state.reward_visible = OptionTwitchRewardVisible.Visible
                        state.reward_usable = OptionTwitchRewardUsable.Enabled
                        TwitchHelixHelper.toggleRewards([state]).then()
                    }
                }, Math.max(1, options.timeout) * 1000)

                // Store new counter value
                states.multiTierEventCounters.set(eventId.toString(), counter)

                // Switch to the next multi-tier reward if it has more configs available, or disable if maxed and that option is set.
                if(!counter.reachedMax) {
                    // Update all rewards to the next level
                    const triggers = event.getTriggers(new TriggerReward())
                    for(const trigger of triggers) {
                        const rewardId = DataUtils.ensureKey(trigger.rewardID)
                        const rewardData = DataUtils.ensureDataArray(trigger.rewardEntries) as PresetReward[] // TODO: Maybe we can remove this typecast?
                        const rewardPreset = rewardData ? rewardData[counter.count] : undefined
                        if(!rewardId || !rewardPreset) continue

                        const clone = Utils.clone(rewardPreset)
                        if (clone) {
                            clone.title = await TextHelper.replaceTagsInText(clone.title, user)
                            clone.prompt = await TextHelper.replaceTagsInText(clone.prompt, user)
                            TwitchHelixHelper.updateReward(rewardId, clone).then()
                        }
                    }
                } else if(options.disableAfterMaxLevel) {
                    // Disable all rewards if needed
                    const triggers = event.getTriggers(new TriggerReward())
                    for(const trigger of triggers) {
                        const rewardIdSetting = DataUtils.ensureData(trigger.rewardID)
                        const rewardIdKey = DataUtils.ensureKey(trigger.rewardID)
                        if(!rewardIdSetting) continue

                        const state = new ActionSystemRewardState()
                        state.reward = DataUtils.buildFakeDataEntries(rewardIdSetting, 0, rewardIdKey)
                        state.reward_visible = options.disableAfterMaxLevel_andHideReward ? OptionTwitchRewardVisible.Hidden : OptionTwitchRewardVisible.Visible
                        state.reward_usable = options.disableAfterMaxLevel_andPauseReward ? OptionTwitchRewardUsable.Disabled : OptionTwitchRewardUsable.Enabled
                        const result = await TwitchHelixHelper.toggleRewards([state])
                    }
                }

                // Register index and build callback for this step of the sequence
                actionIndex = counter.count+1 // First two indices are soft and hard reset, so we start at index 2
                const actions: EventActionContainer[] = []
                if(options.resetOnTrigger) {
                    // Will use this specific index to run the soft reset actions.
                    actions.push(...ArrayUtils.getAsType(eventActionContainers, OptionEntryUsage.OneByIndex, 0))
                }
                actions.push(...ArrayUtils.getAsType(eventActionContainers, OptionEntryUsage.OneByIndex, actionIndex))
                actionsMainCallback = await Actions.buildActionsMainCallback(this.key, actions)
                break
            }
            default: {// Basically "All", no special behavior, only generate the callback if it is missing, but uses the entries by type.
                actionsMainCallback = await Actions.buildActionsMainCallback(this.key, ArrayUtils.getAsType(eventActionContainers, OptionEntryUsage.All, eventOptions.specificIndex))
                break
            }
        }
        if(actionsMainCallback) actionsMainCallback(user, entryIndex ?? eventOptions.specificIndex) // Index is included here to supply it to entries-handling
        else {
            console.warn(`Event with key "${this.key}" was not handled properly, as no callback was set, behavior: ${event.behavior}`)
        }
    }
}
export class Actions {
    public static async init() {
        Utils.log('=== Registering Triggers for Events ===', Color.DarkGreen)
        const events = DataUtils.getKeyDataDictionary<EventDefault>(await DataBaseHelper.loadAll(new EventDefault()) ?? {})
        if(events) {
            for(const [key, event] of Object.entries(events)) {
                const triggers = DataUtils.ensureDataArray(event.triggers) ?? []
                for(const trigger of triggers) {
                    (trigger as AbstractTrigger).register(key)
                }
            }
        } else {
            Utils.log('No events found.', Color.DarkRed)
        }
    }

    // TODO: Expand all user data stuff to also extract things from user-input etc.

    // region User DataUtils Builders
    public static async buildUserDataFromRedemptionMessage(key: string, event: ITwitchEventSubEventRedemption): Promise<IActionUser> {
        const id = event.user_id
        const input = event.user_input
        return {
            source: EEventSource.TwitchReward,
            eventKey: key,
            id: parseInt(id),
            login: event.user_login,
            name: event.user_name,
            input: input,
            inputWords: input.split(' '),
            message: await TextHelper.cleanText(input),
            color: await TwitchHelixHelper.getUserColor(id) ?? '',
            isBroadcaster: false,
            isModerator: false,
            isVIP: false,
            isSubscriber: false,
            bits: 0,
            bitsTotal: 0,
            rewardCost: event.reward.cost,
            rewardMessage: event
        }
    }
    public static async buildUserDataFromCheerMessage(key: string, event: ITwitchEventSubEventCheer): Promise<IActionUser> {
        const id = event.user_id
        const input = event.message
        return {
            source: EEventSource.TwitchCheer,
            eventKey: key,
            id: parseInt(id),
            login: event.user_login,
            name: event.user_name,
            input: input,
            inputWords: input.split(' '),
            message: await TextHelper.cleanText(input),
            color: await TwitchHelixHelper.getUserColor(id) ?? '',
            isBroadcaster: false,
            isModerator: false,
            isVIP: false,
            isSubscriber: false,
            bits: event.bits,
            bitsTotal: 0, // TODO: EventSub cheer callback does not have total cheered...
            rewardCost: 0
        }
    }
    public static async buildUserDataFromLimitedData(key: string, id: string, login: string, name: string, input: string): Promise<IActionUser> {
        return {
            source: EEventSource.TwitchSubscription,
            eventKey: key,
            id: parseInt(id),
            login: login,
            name: name,
            input: input,
            inputWords: input.split(' '),
            message: await TextHelper.cleanText(input),
            color: await TwitchHelixHelper.getUserColor(id) ?? '',
            isBroadcaster: false,
            isModerator: false,
            isVIP: false,
            isSubscriber: false, // True? Or can it be a gift sub so it's true for someone else?
            bits: 0,
            bitsTotal: 0,
            rewardCost: 0
        }
    }
    /**
     * Used for programmatic command execution not done by an actual user.
     * @returns 
     */
    public static async buildEmptyUserData(source: EEventSource, key: string, userName?: string, userInput?: string, userMessage?: string): Promise<IActionUser> {
        // TODO: Make this use the user ID instead of username?
        const channelTokens = await DataBaseHelper.load(new SettingTwitchTokens(), 'Channel')
        const user = await TwitchHelixHelper.getUserByLogin(userName ?? channelTokens?.userLogin ?? '')
        const input = userInput ?? ''
        return {
            source: source,
            eventKey: key ?? 'Unknown',
            id: parseInt(user?.id ?? ''),
            login: user?.login ?? '',
            name: user?.display_name ?? '',
            input: input,
            inputWords: input.split(' '),
            message: await TextHelper.cleanText(userMessage ?? userInput),
            color: await TwitchHelixHelper.getUserColor(user?.id ?? '') ?? '',
            isBroadcaster: true,
            isModerator: false,
            isVIP: false,
            isSubscriber: false,
            bits: 0,
            bitsTotal: 0,
            rewardCost: 0
        }
    }
    // endregion

    // region Main Action Builder
    /**
     *
     * @param key
     * @param actionContainerList
     */
    public static async buildActionsMainCallback(key: string, actionContainerList: (EventActionContainer|undefined)[]): Promise<IActionsMainCallback> {
        /**
         * Handle all the different types of action constructs here.
         * 1. Single setup
         * 2. Multiple setup
         *
         * The multiple setups can be set to be all, random, incremental, accumulating or multi-tier.
         * In the future, possible other alternatives, like leveling up/community challenge.
         * 
         * There will be a settings for the first one in an array to be the default.
         * Other action setups after this will then inherit from the original.
         * This does not work with timelines.
         */
        const nonce = Utils.getNonce('Action') // Used when some things should wait for some other things, currently used to reference the TTS finishing before taking a screenshot, might not work well when multiple things are awaited...
        const actionsArr = ArrayUtils.removeUndefined(actionContainerList)
        const actionsExecutors: IActionsExecutor[] = [] // A list of stacks of actions to execute.
        if(actionsArr.length == 0) actionsArr.push(new EventActionContainer()) // We need at least one empty object to register default actions in the loop below.
        for(const actionContainer of actionsArr) {
            const actionCallbacks: IActionCallback[] = [] // The stack of actions to execute.
            const actions = DataUtils.ensureDataArray(actionContainer.entries)
            for(const action of actions) {
                // Build callbacks
                const callback: IActionCallback = await (action as AbstractAction).build(key)
                actionCallbacks.push(callback)
            }
            // Logging
            if(actionCallbacks.length) {
                Utils.logWithBold(`Built Action Callback(s) for <${key}> "`, Color.Green)
            }
            // Push item with callback that triggers all the actions generated.
            actionsExecutors.push({
                run: actionContainer.run,
                ms: actionContainer.run_ms,
                nonce: nonce,
                execute: async (user: IActionUser, index?: number) => {
                    for (const stackCallback of actionCallbacks) {
                        if (stackCallback.call) {
                            if(stackCallback.awaitCall) await stackCallback.call(user, nonce, index)
                            else stackCallback.call(user, nonce, index)
                        }
                    }
                }
            })
        }

        // Return a callback that will execute all the actions in the stack of each item.
        return async (user: IActionUser, index?: number) => {
            let timeout = 0
            for(const actionsExecutor of actionsExecutors) {
                let delay = false
                switch(actionsExecutor.run) {
                    case OptionEventRun.msAfterPrevious:
                        timeout += actionsExecutor.ms
                        delay = true
                        break
                    case OptionEventRun.msAfterStart:
                        timeout = actionsExecutor.ms
                        delay = true
                        break
                }
                setTimeout(()=>{
                    actionsExecutor.execute(user, index)
                }, delay ? timeout : 0)
            }
        }
    }
    // endregion
}