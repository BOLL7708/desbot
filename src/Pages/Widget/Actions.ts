import {IAudioAction} from '../../Interfaces/iactions.js'
import {EEventSource} from './Enums.js'
import Color from '../../Classes/ColorConstants.js'
import StatesSingleton from '../../Singletons/StatesSingleton.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
import Utils from '../../Classes/Utils.js'
import TwitchHelixHelper from '../../Classes/TwitchHelixHelper.js'
import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import {SettingAccumulatingCounter, SettingIncrementingCounter} from '../../Objects/Setting/SettingCounters.js'
import {SettingTwitchTokens} from '../../Objects/Setting/SettingTwitch.js'
import {ITwitchEventSubEventCheer, ITwitchEventSubEventRedemption} from '../../Interfaces/itwitch_eventsub.js'
import TextHelper from '../../Classes/TextHelper.js'
import {EventActionContainer, EventDefault} from '../../Objects/Event/EventDefault.js'
import ArrayUtils from '../../Classes/ArrayUtils.js'
import Action, {IActionCallback, IActionsExecutor, IActionsMainCallback, IActionUser} from '../../Objects/Action.js'
import Trigger from '../../Objects/Trigger.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import {OptionEventRun} from '../../Options/OptionEventRun.js'
import {OptionEventBehavior} from '../../Options/OptionEventBehavior.js'
import {TriggerReward} from '../../Objects/Trigger/TriggerReward.js'
import {PresetReward} from '../../Objects/Preset/PresetReward.js'
import {ActionSystemRewardState} from '../../Objects/Action/ActionSystem.js'
import {OptionTwitchRewardUsable, OptionTwitchRewardVisible} from '../../Options/OptionTwitch.js'
import {ActionSpeech} from '../../Objects/Action/ActionSpeech.js'
import {OptionTTSType} from '../../Options/OptionTTS.js'
import {DataUtils} from '../../Objects/DataUtils.js'
import Data from '../../Objects/Data.js'

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

        const options = event.options
        // entries is an array of containers that then contains the actions.
        const eventActionContainers = event.actions
        if(eventActionContainers.length == 0) return

        let actionsMainCallback: IActionsMainCallback
        const states = StatesSingleton.getInstance()
        let index: number|undefined = undefined

        /*
            Here we handle the different types of behavior of the event.
            This means we often rebuild the full main callback.
            As well as calculate and provide the index for action entries.
         */
        switch(options.behavior) {
            case OptionEventBehavior.Random: {
                actionsMainCallback = Actions.buildActionsMainCallback(this.key, ArrayUtils.getAsType(eventActionContainers, OptionEntryUsage.OneRandom, options.specificIndex))
                break
            }
            /**
             * Action set indices:
             * 0 - * : will run from first level for as long as it has sets, repeats last unless reward disables.
             */
            case OptionEventBehavior.Incrementing: {
                // Load incremental counter
                const eventId = await DataBaseHelper.loadID(EventDefault.ref.build(), this.key)
                const counter = await DataBaseHelper.loadOrEmpty(new SettingIncrementingCounter(), eventId.toString())

                // Switch to the next incremental reward if it has more configs available
                const triggers = event.getTriggers(new TriggerReward())
                let hasAdvancedCounter = false
                for(const trigger of triggers) {
                    if(!hasAdvancedCounter) {
                        counter.count++
                        await DataBaseHelper.save(counter, eventId.toString())
                        hasAdvancedCounter = true
                    }
                    const rewardEntries = DataUtils.ensureValues(trigger.rewardEntries) ?? []
                    if(rewardEntries.length) {
                        const rewardPresetIndex = event.options.behaviorOptions.incrementationLoop
                            ? counter.count % rewardEntries.length // Loop
                            : Math.min(counter.count, rewardEntries.length-1) // Clamp to max
                        const rewardPreset = rewardEntries[rewardPresetIndex]
                        if (rewardPreset) {
                            const clone = await Utils.clone(rewardPreset) as PresetReward // TODO: Maybe we can remove this typecast?
                            clone.title = await TextHelper.replaceTagsInText(clone.title, user)
                            clone.prompt = await TextHelper.replaceTagsInText(clone.prompt, user)
                            const result = await TwitchHelixHelper.updateReward(DataUtils.ensureValue(trigger.rewardID), clone)
                            if(!result) console.warn('Incrementing Event: Failed to update reward', clone, result)
                        }
                    }
                }

                // Register index and build callback for this step of the sequence
                index = event.options.behaviorOptions.incrementationLoop
                    ? (counter.count - 1) % eventActionContainers.length // Loop
                    : Math.min(counter.count - 1, eventActionContainers.length-1) // Clamp to max
                actionsMainCallback = Actions.buildActionsMainCallback(this.key, ArrayUtils.getAsType(eventActionContainers, OptionEntryUsage.OneSpecific, index))
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
                const eventId = await DataBaseHelper.loadID(EventDefault.ref.build(), this.key)
                const counter = await DataBaseHelper.loadOrEmpty(new SettingAccumulatingCounter(), eventId.toString())
                const goalCount = options.behaviorOptions.accumulationGoal

                // Switch to the next accumulating reward if it has more configs available
                const triggers = event.getTriggers(new TriggerReward())
                let hasAdvancedCounter = false
                for(const trigger of triggers) {
                    if(!hasAdvancedCounter) {
                        counter.count += Math.max(user.rewardCost, 1) // Defaults to 1 for commands.
                        await DataBaseHelper.save(counter, eventId.toString())
                        hasAdvancedCounter = true
                    }
                    /*
                    For both actions sets and rewards we should use the first one for resets,
                    the second to last one for progress, and the last one for the final result.
                    This should work with only one action set, and only one reward.
                    These should work independently of each other.
                     */
                    const goalIsMet = counter.count >= goalCount
                    if(eventActionContainers.length) {
                        index = 0
                        if (goalIsMet) { // Final
                            index = eventActionContainers.length - 1 // Last
                        } else { // Progress
                            index = Math.max(0, eventActionContainers.length - 2) // Second to last
                        }
                    }
                    const rewardEntries = DataUtils.ensureValues(trigger.rewardEntries) ?? []
                    if(rewardEntries.length) {
                        let rewardIndex = 0
                        if (goalIsMet) { // Final
                            rewardIndex = rewardEntries.length -1 // Last
                        } else { // Progress
                            rewardIndex = Math.max(0, rewardEntries.length - 2) // Second to last
                        }

                        const rewardPreset = rewardEntries[rewardIndex]
                        if(rewardPreset) {
                            const clone = Utils.clone(rewardPreset) as PresetReward // TODO: Maybe we can remove this typecast?
                            clone.title = await TextHelper.replaceTagsInText(clone.title, user)
                            clone.prompt = await TextHelper.replaceTagsInText(clone.prompt, user)

                            // Make sure the last reward doesn't cost more points than the total left.
                            const cost = clone.cost
                            if (rewardIndex < 2 && (counter.count + cost) > goalCount) {
                                clone.cost = Math.max(1, goalCount - counter.count)
                            }
                            if(goalIsMet) clone.is_paused = true
                            const result = await TwitchHelixHelper.updateReward(DataUtils.ensureValue(trigger.rewardID), clone as PresetReward) // TODO: Maybe we can remove this typecast?
                            if(!result) console.warn('Accumulating Event: Failed to update reward', clone, result)
                        }
                    }
                }

                // Register index and build callback for this step of the sequence
                actionsMainCallback = Actions.buildActionsMainCallback(this.key, ArrayUtils.getAsType(eventActionContainers, OptionEntryUsage.OneSpecific, index))
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
                const eventId = await DataBaseHelper.loadID(EventDefault.ref.build(), this.key)
                const counter = states.multiTierEventCounters.get(eventId.toString()) ?? {count: 0, timeoutHandle: 0}
                counter.count++
                const maxLevel = options.behaviorOptions.multiTierMaxLevel
                if (counter.count > maxLevel) {
                    counter.count = maxLevel
                }

                // Reset timeout
                clearTimeout(counter.timeoutHandle)
                counter.timeoutHandle = setTimeout(async() => {
                    // Run reset actions if enabled.
                    if(options.behaviorOptions.multiTierResetOnTimeout) {
                        // Will use this specific index to run the hard reset actions.
                        index = 1
                        Actions.buildActionsMainCallback(
                            this.key,
                            ArrayUtils.getAsType(eventActionContainers, OptionEntryUsage.OneSpecific, index)
                        ) (user, index)
                    }

                    // Reset counter
                    counter.count = 0
                    counter.timeoutHandle = 0
                    states.multiTierEventCounters.set(eventId.toString(), counter)

                    // Reset reward
                    const triggers = event.getTriggers(new TriggerReward())
                    for(const trigger of triggers) {
                        const rewardId = DataUtils.ensureValue(trigger.rewardID)
                        const rewardData = DataUtils.ensureValues(trigger.rewardEntries)
                        const rewardPreset = rewardData ? rewardData[0] : undefined
                        if(!rewardId || !rewardPreset) continue

                        const clone = Utils.clone(rewardPreset) as PresetReward // TODO: Maybe we can remove this typecast?
                        if (clone) {
                            clone.title = await TextHelper.replaceTagsInText(clone.title, user)
                            clone.prompt = await TextHelper.replaceTagsInText(clone.prompt, user)
                            TwitchHelixHelper.updateReward(rewardId, clone).then()
                        }

                        const state = new ActionSystemRewardState()
                        state.reward = rewardId
                        state.reward_visible = OptionTwitchRewardVisible.Visible
                        state.reward_usable = OptionTwitchRewardUsable.Enabled
                        TwitchHelixHelper.toggleRewards([state]).then()
                    }
                }, (options.behaviorOptions.multiTierTimeout ?? 30)*1000)

                // Store new counter value
                states.multiTierEventCounters.set(eventId.toString(), counter)

                // Switch to the next multi-tier reward if it has more configs available, or disable if maxed and that option is set.
                const wasLastLevel = counter.count >= maxLevel
                if(!wasLastLevel) {
                    const triggers = event.getTriggers(new TriggerReward())
                    for(const trigger of triggers) {
                        const rewardId = DataUtils.ensureValue(trigger.rewardID)
                        const rewardData = DataUtils.ensureValues(trigger.rewardEntries)
                        const rewardPreset = rewardData ? rewardData[counter.count] : undefined
                        if(!rewardId || !rewardPreset) continue

                        const clone = Utils.clone(rewardPreset) as PresetReward // TODO: Maybe we can remove this typecast?
                        if (clone) {
                            clone.title = await TextHelper.replaceTagsInText(clone.title, user)
                            clone.prompt = await TextHelper.replaceTagsInText(clone.prompt, user)
                            TwitchHelixHelper.updateReward(rewardId, clone).then()
                        }
                    }
                } else if(options.behaviorOptions.multiTierDisableAfterMaxLevel) {
                    const triggers = event.getTriggers(new TriggerReward())
                    for(const trigger of triggers) {
                        const rewardId = DataUtils.ensureValue(trigger.rewardID)
                        if(!rewardId) continue

                        const state = new ActionSystemRewardState()
                        state.reward = rewardId
                        state.reward_visible = OptionTwitchRewardVisible.Visible
                        state.reward_usable = OptionTwitchRewardUsable.Disabled
                        TwitchHelixHelper.toggleRewards([state]).then()
                    }
                }

                // Register index and build callback for this step of the sequence
                index = counter.count+1 // First two indices are soft and hard reset, so we start at index 2
                const actions: EventActionContainer[] = []
                if(options.behaviorOptions.multiTierResetOnTrigger) {
                    // Will use this specific index to run the soft reset actions.
                    actions.push(...ArrayUtils.getAsType(eventActionContainers, OptionEntryUsage.OneSpecific, 0))
                }
                actions.push(...ArrayUtils.getAsType(eventActionContainers, OptionEntryUsage.OneSpecific, index))
                actionsMainCallback = Actions.buildActionsMainCallback(this.key, actions)
                break
            }
            default: {// Basically "All", no special behavior, only generate the callback if it is missing, but uses the entries by type.
                actionsMainCallback = Actions.buildActionsMainCallback(this.key, ArrayUtils.getAsType(eventActionContainers, OptionEntryUsage.All, options.specificIndex))
                break
            }
        }
        if(actionsMainCallback) actionsMainCallback(user, index ?? options.specificIndex) // Index is included here to supply it to entries-handling
        else {
            console.warn(`Event with key "${this.key}" was not handled properly, as no callback was set, behavior: ${options?.behavior}`)
        }
    }
}
export class Actions {
    public static async init() {
        Utils.log('=== Registering Triggers for Events ===', Color.DarkGreen)
        const events = await DataBaseHelper.loadAll(new EventDefault())
        if(events) {
            for(const [key, event] of Object.entries(events)) {
                const triggers = DataUtils.ensureValues(event.triggers) ?? []
                for(const trigger of triggers) {
                    (trigger as Trigger).register(key)
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
     * @param use OptionEntryUsage
     * @param index
     */
    public static buildActionsMainCallback(key: string, actionContainerList: (EventActionContainer|undefined)[], use: number=OptionEntryUsage.All, index: number=0): IActionsMainCallback {
        /**
         * Handle all the different types of action constructs here.
         * 1. Single setup
         * 2. Multiple setup
         *
         * The multiple setups can be set to be all, random, incremental, accumulating or multitier.
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
            const actions = DataUtils.ensureValues(actionContainer.entries) ?? []
            for(const action of actions) {
                // Build callbacks
                const callback: IActionCallback = (action as Action).build(key)
                actionCallbacks.push(callback)

                // Logging
                if(actionCallbacks.length == 1) {
                    Utils.logWithBold(`Built Action Callback for <${key}>: ${actionCallbacks[0].tag} "${actionCallbacks[0].description}"`, Color.Green)
                } else {
                    Utils.logWithBold(`Built Action Callback for <${key}>: ${actionCallbacks.map(ac => ac.tag).join(', ')}`, Color.Green)
                }

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

    // region Action Builders
    /**
     * Will play back a sound and/or speak.
     * @param config The config for the sound effect to be played.
     * @param speechConfig What to be spoken, if TTS is enabled.
     * @param nonceTTS The nonce to use for TTS.
     * @param onTtsQueue If true the sound effect will be enqueued on the TTS queue, to not play back at the same time.
     * @returns 
     */
    private static buildSoundAndSpeechCallback(
        config: IAudioAction|undefined,
        speechConfig:ActionSpeech|undefined,
        nonceTTS: string,
        onTtsQueue:boolean = false
    ): IActionCallback|undefined {
        if(config || speechConfig) return {
            tag: '🔊',
            description: 'Callback that triggers a sound and/or speech action',
            call: async (user: IActionUser, nonce, index?: number) => {
                const modules = ModulesSingleton.getInstance()
                let ttsStrings: string[] = []
                if(speechConfig?.entries) {
                    ttsStrings = await TextHelper.replaceTagsInTextArray(
                        Utils.ensureArray(speechConfig.entries).getAsType(index),
                        user
                    )
                    onTtsQueue = true
                }
                if(config) { // If we have an audio config, play it. Attach 
                    const configClone = Utils.clone(config)
                    configClone.srcEntries = await TextHelper.replaceTagsInTextArray( // To support audio URLs in input
                        Utils.ensureArray(config.srcEntries).getAsType(index), // Need to read entries from config here as cloning drops __type
                        user
                    )
                    // TODO: Soon redundant anyway
                    // if(onTtsQueue) modules.tts.enqueueSoundEffect(configClone)
                    // else modules.audioPlayer.enqueueAudio(configClone)
                }
                if(speechConfig && ttsStrings.length > 0) {
                    for(const ttsStr of ttsStrings) {
                        const chatbotTokens = await DataBaseHelper.load(new SettingTwitchTokens(), 'Chatbot')
                        const voiceOfUserTagged = await TextHelper.replaceTagsInText(DataUtils.ensureValue(speechConfig.voiceOfUser) ?? '', user)
                        const voiceUser = voiceOfUserTagged.length > 0 ? await TwitchHelixHelper.getUserByLogin(voiceOfUserTagged) : undefined
                        const voiceUserId = parseInt(voiceUser?.id ?? '')
                        await modules.tts.enqueueSpeakSentence(
                            ttsStr,
                            isNaN(voiceUserId) ? chatbotTokens?.userId : voiceUserId,
                            speechConfig.type ?? OptionTTSType.Announcement,
                            nonceTTS,
                            undefined,
                            undefined,
                            speechConfig?.skipDictionary
                        )
                    }
                }
            }
        }
    }
    // endregion
}