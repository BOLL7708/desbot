import {
    IAudioAction,
    IEntriesAction,
    IInputAction,
    IPhilipsHueColorAction,
    IPhilipsHuePlugAction,
    IPipeAction,
    IScreenshotAction,
    ISignAction,
    ISpeechAction,
    IWhisperAction
} from '../../Interfaces/iactions.js'
import {IOpenVR2WSMoveSpace, IOpenVR2WSSetting} from '../../Interfaces/iopenvr2ws.js'
import {EEventSource, ETTSType} from './Enums.js'
import ExecUtils from '../../Classes/ExecUtils.js'
import Color from '../../Classes/ColorConstants.js'
import StatesSingleton from '../../Singletons/StatesSingleton.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
import Utils from '../../Classes/Utils.js'
import {ITwitchHelixRewardUpdate} from '../../Interfaces/itwitch_helix.js'
import TwitchHelixHelper from '../../Classes/TwitchHelixHelper.js'
import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import {TKeys} from '../../_data/!keys.js'
import {SettingAccumulatingCounter, SettingIncrementingCounter} from '../../Objects/Setting/SettingCounters.js'
import {SettingTwitchTokens} from '../../Objects/Setting/SettingTwitch.js'
import {PresetPipeCustom} from '../../Objects/Preset/PresetPipe.js'
import {ITwitchEventSubEventCheer, ITwitchEventSubEventRedemption} from '../../Interfaces/itwitch_eventsub.js'
import TextHelper from '../../Classes/TextHelper.js'
import TempFactory from '../../Classes/TempFactory.js'
import ConfigScreenshots from '../../Objects/Config/ConfigScreenshots.js'
import {EventActionContainer, EventDefault} from '../../Objects/Event/EventDefault.js'
import ArrayUtils from '../../Classes/ArrayUtils.js'
import Action, {IActionCallback, IActionsExecutor, IActionsMainCallback, IActionUser} from '../../Objects/Action.js'
import Trigger from '../../Objects/Trigger.js'

export class ActionHandler {
    constructor(
        public key: string,
        public appId: string = ''
    ) {}
    public async call(user: IActionUser) {
        let event = await DataBaseHelper.loadOrEmpty(new EventDefault(), this.key)
        /* TODO: REIMPLEMENT THIS LATER WHEN WE ACTUALLY CAN STORE GAME EVENTS
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
        //   The main callback should take ALL OF THE THINGS?!?!?!?!


        const options = event.options
        // entries is an array of containers that then contains the actions.
        const actionsEntries = event.actions
        if(actionsEntries.length == 0) return

        let actionsMainCallback: IActionsMainCallback
        const states = StatesSingleton.getInstance()

        let index: number|undefined = undefined
        let counter: SettingIncrementingCounter|SettingAccumulatingCounter
        let rewardConfigs: ITwitchHelixRewardUpdate[] = []
        /*
            Here we handle the different types of behavior of the event.
            This means we often rebuild the full main callback.
            As well as calculate and provide the index for action entries.
         */
        switch(options.behavior) {
            /*
            case EnumEventBehavior.Random:
                actionsMainCallback = Actions.buildActionsMainCallback(this.key, [actionsEntries.getRandom()])
                break
            case EnumEventBehavior.Incrementing:
                // Load incremental counter
                counter = await DataBaseHelper.load(new SettingIncrementingCounter(), this.key) ?? new SettingIncrementingCounter()

                // Switch to the next incremental reward if it has more configs available
                rewardConfigs = Utils.ensureArray(event?.triggers.reward)
                if(rewardConfigs.length > 1) {
                    counter.count++
                    const newRewardConfig = options.rewardMergeUpdateConfigWithFirst
                        ? { ...rewardConfigs[0], ...rewardConfigs[counter.count] }
                        : rewardConfigs[counter.count]
                    if (newRewardConfig) {
                        await DataBaseHelper.save(counter, this.key)
                        TwitchHelixHelper.updateReward(await LegacyUtils.getRewardId(this.key), newRewardConfig).then()
                    }
                }
                // Register index and build callback for this step of the sequence
                index = (counter?.count ?? 1)-1
                actionsMainCallback = Actions.buildActionsMainCallback(this.key, actionsEntries.getAsType(index))
                break
            case EnumEventBehavior.Accumulating:
                // Load accumulating counter
                counter = await DataBaseHelper.load(new SettingAccumulatingCounter(), this.key) ?? new SettingAccumulatingCounter()
                counter.count += Math.max(user.rewardCost, 1) // Defaults to 1 for commands.
                const goalCount = options.accumulationGoal ?? 0
                const currentCount = counter.count ?? 0

                // Switch to the next accumulating reward if it has more configs available
                rewardConfigs = Utils.ensureArray(event?.triggers.reward)
                let rewardIndex = 0
                if(rewardConfigs.length >= 3 && currentCount >= goalCount) {
                    // Final reward (when goal has been reached)
                    index = 1
                    rewardIndex = 2
                } else if(rewardConfigs.length >= 2) {
                    // Intermediate reward (before reaching goal)
                    rewardIndex = 1
                }
                if(rewardIndex > 0) { // Update reward
                    const newRewardConfigClone = options.rewardMergeUpdateConfigWithFirst
                        ? Utils.clone({ ...rewardConfigs[0], ...rewardConfigs[rewardIndex] })
                        : Utils.clone(rewardConfigs[rewardIndex])
                    if (newRewardConfigClone) {
                        await DataBaseHelper.save(counter, this.key)
                        newRewardConfigClone.title = await TextHelper.replaceTagsInText(newRewardConfigClone.title, user)
                        newRewardConfigClone.prompt = await TextHelper.replaceTagsInText(newRewardConfigClone.prompt, user)
                        const cost = newRewardConfigClone.cost ?? 0
                        // Make sure the last reward doesn't cost more points than the total left.
                        if(rewardIndex < 2 && (currentCount + cost) > goalCount) newRewardConfigClone.cost = goalCount - currentCount
                        TwitchHelixHelper.updateReward(await LegacyUtils.getRewardId(this.key), newRewardConfigClone).then()
                    }
                }
                // Register index and build callback for this step of the sequence
                actionsMainCallback = Actions.buildActionsMainCallback(this.key, actionsEntries.getAsType(index))
                break
            case EnumEventBehavior.MultiTier:
                rewardConfigs = Utils.ensureArray(event?.triggers.reward)

                // Increase multi-tier counter
                const multiTierCounter = states.multiTierEventCounters.get(this.key) ?? {count: 0, timeoutHandle: 0}
                multiTierCounter.count++
                const multiTierMaxValue = options.multiTierMaxLevel ?? rewardConfigs.length
                if(multiTierCounter.count > multiTierMaxValue) {
                    multiTierCounter.count = multiTierMaxValue
                }

                // Reset timeout
                clearTimeout(multiTierCounter.timeoutHandle)
                multiTierCounter.timeoutHandle = setTimeout(async() => {
                    // Run reset actions if enabled.
                    if(options.multiTierDoResetActions) {
                        index = 0 // Should always be the first set of actions.
                        Actions.buildActionsMainCallback(
                            this.key,
                            actionsEntries.getAsType(index)
                        ) (user, index)
                    }

                    // Reset counter
                    multiTierCounter.count = 0
                    multiTierCounter.timeoutHandle = 0
                    states.multiTierEventCounters.set(this.key, multiTierCounter)

                    // Reset reward
                    if(rewardConfigs.length > 0) {
                        const newRewardConfigClone = Utils.clone(rewardConfigs[0])
                        newRewardConfigClone.title = await TextHelper.replaceTagsInText(newRewardConfigClone.title, user)
                        newRewardConfigClone.prompt = await TextHelper.replaceTagsInText(newRewardConfigClone.prompt, user)
                        if (newRewardConfigClone) TwitchHelixHelper.updateReward(await LegacyUtils.getRewardId(this.key), newRewardConfigClone).then()
                    }
                    TwitchHelixHelper.toggleRewards({[this.key]: true}).then()
                }, (options.multiTierTimeout ?? 30)*1000)

                // Store new counter value
                states.multiTierEventCounters.set(this.key, multiTierCounter)

                // Switch to the next multi-tier reward if it has more configs available, or disable if maxed and that option is set.
                const wasLastLevel = multiTierCounter.count === multiTierMaxValue
                if(!wasLastLevel) {
                    const newRewardConfigClone = Utils.clone(
                        rewardConfigs.length == 1
                            ? rewardConfigs[0]
                            : options.rewardMergeUpdateConfigWithFirst
                                ? { ...rewardConfigs[0], ...rewardConfigs[multiTierCounter.count] }
                                : rewardConfigs[multiTierCounter.count]
                    )
                    if (newRewardConfigClone) {
                        newRewardConfigClone.title = await TextHelper.replaceTagsInText(newRewardConfigClone.title, user)
                        newRewardConfigClone.prompt = await TextHelper.replaceTagsInText(newRewardConfigClone.prompt, user)
                        TwitchHelixHelper.updateReward(await LegacyUtils.getRewardId(this.key), newRewardConfigClone).then()
                    }
                } else if(options.multiTierDisableWhenMaxed) {
                    TwitchHelixHelper.toggleRewards({[this.key]: false}).then()
                }

                // Register index and build callback for this step of the sequence
                index = multiTierCounter.count
                actionsMainCallback = Actions.buildActionsMainCallback(this.key, actionsEntries.getAsType(index))
                break
            */
            default: // Basically "All", no special behavior, only generate the callback if it is missing, but uses the entries by type.
                actionsMainCallback = Actions.buildActionsMainCallback(this.key, actionsEntries.getAsType(options.specificIndex))
                break
        }
        if(actionsMainCallback) actionsMainCallback(user, index ?? options.specificIndex) // Index is included here to supply it to entries-handling
        else console.warn(`Event with key "${this.key}" was not handled properly, as no callback was set, behavior: ${options?.behavior}`)
    }
}
export class Actions {
    public static async init() {
        Utils.log('=== Registering Triggers for Events ===', Color.DarkGreen)
        const events = await DataBaseHelper.loadAll(new EventDefault())
        if(events) {
            for(const [key, event] of Object.entries(events)) {
                const triggers = Utils.ensureObjectArrayNotId(event.triggers)
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
    public static async buildUserDataFromLimitedData(key: TKeys, id: string, login: string, name: string, input: string): Promise<IActionUser> {
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
    public static buildActionsMainCallback(key: string, actionsList: (EventActionContainer|undefined)[]): IActionsMainCallback {
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
        const nonceTTS = Utils.getNonce('TTS') // Used to reference the TTS finishing before taking a screenshot.
        const actionsArr = ArrayUtils.removeUndefined(actionsList)
        const actionsExecutors: IActionsExecutor[] = [] // A list of stacks of actions to execute.
        if(actionsArr.length == 0) actionsArr.push(new EventActionContainer()) // We need at least one empty object to register default actions in the loop below.
        for(const actionContainer of actionsArr) {
            const actionCallbacks: IActionCallback[] = [] // The stack of actions to execute.
            for(const action of actionContainer.entries) {
                // TODO: Actually move this callback constructor INTO the action, so this switch statement becomes redundant.
                //  Just call "buildCallback" on the action itself. This will open us up to custom actions added after the fact too.

                // Build callbacks
                const callback: IActionCallback = (action as Action).build(key)
                actionCallbacks.push(callback)
                /*
                switch(action.constructor.name) {
                    case ActionSpeech.name: callback = this.buildTTSCallback(action as ActionSpeech); break
                    case ActionCustom.name: callback = this.buildTTSCallback(action as ActionCustom); break
                    case ActionOBS.name: callback = this.buildTTSCallback(action as ActionOBS); break
                    case ActionPhilipsHueBulb.name: callback = this.buildTTSCallback(action as ActionPhilipsHueBulb); break
                    case ActionPhilipsHuePlug.name: callback = this.buildTTSCallback(action as ActionPhilipsHuePlug); break
                    case ActionAudio.name: callback = this.buildTTSCallback(action as ActionAudio); break
                    case ActionPipe.name: callback = this.buildTTSCallback(action as ActionPipe); break
                    case ActionSettingVR.name: callback = this.buildTTSCallback(action as ActionSettingVR); break
                    case ActionSign.name: callback = this.buildTTSCallback(action as ActionSign); break
                    case ActionInput.name: callback = this.buildTTSCallback(action as ActionInput); break
                    case ActionLink.name: callback = this.buildTTSCallback(action as ActionLink); break
                    case ActionScreenshot.name: callback = this.buildTTSCallback(action as ActionScreenshot); break
                    case ActionDiscord.name: callback = this.buildTTSCallback(action as ActionDiscord); break
                    case ActionChat.name: callback = this.buildTTSCallback(action as ActionChat); break
                    case ActionWhisper.name: callback = this.buildTTSCallback(action as ActionWhisper); break
                    case ActionLabel.name: callback = this.buildTTSCallback(action as ActionLabel); break
                    case ActionSystem.name: callback = this.buildTTSCallback(action as ActionSystem); break
                    case ActionRemoteCommand.name: callback = this.buildTTSCallback(action as ActionRemoteCommand); break
                }
                ArrayUtils.pushIfExists(actionCallbacks, callback)

                ArrayUtils.pushIfExists(actionCallbacks, this.buildTTSCallback(actionContainer?.tts))
                ArrayUtils.pushIfExists(actionCallbacks, actionContainer?.custom)
                ArrayUtils.pushIfExists(actionCallbacks, ActionsCallbacks.stack[TempFactory.keyToActionCallbackEnum(key as TKeys)])      // TODO ??
                ArrayUtils.pushIfExists(actionCallbacks, this.buildOBSCallback(actionContainer?.obs, key))
                ArrayUtils.pushIfExists(actionCallbacks, this.buildColorCallback(actionContainer?.lights))
                ArrayUtils.pushIfExists(actionCallbacks, this.buildPlugCallback(actionContainer?.plugs))
                ArrayUtils.pushIfExists(actionCallbacks, this.buildSoundAndSpeechCallback(
                    actionContainer?.audio,
                    actionContainer?.speech,
                    nonceTTS,
                    !!(actionContainer?.speech)
                ))
                ArrayUtils.pushIfExists(actionCallbacks, this.buildPipeCallback(actionContainer?.pipe))
                ArrayUtils.pushIfExists(actionCallbacks, this.buildOpenVR2WSSettingCallback(actionContainer?.vrSetting))
                ArrayUtils.pushIfExists(actionCallbacks, this.buildOpenVR2WSMoveSpaceCallback(actionContainer?.vrMoveSpace))
                ArrayUtils.pushIfExists(actionCallbacks, this.buildSignCallback(actionContainer?.sign))
                ArrayUtils.pushIfExists(actionCallbacks, this.buildKeysCallback(actionContainer?.input))
                ArrayUtils.pushIfExists(actionCallbacks, this.buildURICallback(actionContainer?.uri))
                ArrayUtils.pushIfExists(actionCallbacks, this.buildWebCallback(actionContainer?.web))
                ArrayUtils.pushIfExists(actionCallbacks, this.buildScreenshotCallback(actionContainer?.screenshots, key, nonceTTS))
                ArrayUtils.pushIfExists(actionCallbacks, this.buildDiscordMessageCallback(actionContainer?.discord, key))
                ArrayUtils.pushIfExists(actionCallbacks, this.buildTwitchChatCallback(actionContainer?.chat))
                ArrayUtils.pushIfExists(actionCallbacks, this.buildTwitchWhisperCallback(actionContainer?.whisper))
                ArrayUtils.pushIfExists(actionCallbacks, this.buildLabelCallback(actionContainer?.label))
                ArrayUtils.pushIfExists(actionCallbacks, this.buildSystemCallback(actionContainer?.system))
                ArrayUtils.pushIfExists(actionCallbacks, this.buildRemoteCommandCallback(actionContainer?.remoteCommand))
                */

                // Logging
                if(actionCallbacks.length == 1) {
                    Utils.logWithBold(`Built Action Callback for <${key}>: ${actionCallbacks[0].tag} "${actionCallbacks[0].description}"`, Color.Green)
                } else {
                    Utils.logWithBold(`Built Action Callback for <${key}>: ${actionCallbacks.map(ac => ac.tag).join(', ')}`, Color.Green)
                }

            }
            // Push item with callback that triggers all the actions generated.
            actionsExecutors.push({
                timeMs: actionContainer.delayMs_orTimeMs,
                delayMs: actionContainer.delayMs,
                execute: async (user: IActionUser, index?: number) => {
                    for (const stackCallback of actionCallbacks) {
                        if (stackCallback.call) {
                            if(stackCallback.awaitCall) await stackCallback.call(user, index)
                            else stackCallback.call(user, index)
                        }
                    }
                }
            })
        }

        // Return a callback that will execute all the actions in the stack of each item.
        return async (user: IActionUser, index?: number) => {
            let timeout = 0
            for(const actionsExecutor of actionsExecutors) {
                if(actionsExecutor.timeMs !== undefined) timeout = actionsExecutor.timeMs // Overrides delay
                else if(actionsExecutor.delayMs !== undefined) timeout += actionsExecutor.delayMs // Adds to previous time
                setTimeout(()=>{
                    actionsExecutor.execute(user, index)
                }, timeout)
            }
        }
    }
    // endregion

    // region Action Builders
    private static buildColorCallback(config: IPhilipsHueColorAction|undefined): IActionCallback|undefined {
        if(config) return {
            tag: '🎨',
            description: 'Callback that triggers a Philips Hue color action',
            call: (user, index) => {
                const modules = ModulesSingleton.getInstance()
                const colors = Utils.ensureArray(config.entries).getAsType(index)
                const color = colors.pop() // No reason to set more than one color at the same time for the same bulb.
                for(const bulb of config.bulbs) {
                    if(color) modules.hue.setLightState(bulb, color.x, color.y).then()
                }
            }
        }
    }

    private static buildPlugCallback(config: IPhilipsHuePlugAction|undefined): IActionCallback|undefined {
        if(config) return {
            tag: '🔌',
            description: 'Callback that triggers a Philips Hue plug action',
            call: () => {
                const modules = ModulesSingleton.getInstance()
                modules.hue.runPlugConfig(config)
            }
        }
    }
    
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
        speechConfig:ISpeechAction|undefined,
        nonceTTS: string,
        onTtsQueue:boolean = false
    ): IActionCallback|undefined {
        if(config || speechConfig) return {
            tag: '🔊',
            description: 'Callback that triggers a sound and/or speech action',
            call: async (user: IActionUser, index?: number) => {
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
                        const voiceOfUserTagged = await TextHelper.replaceTagsInText(speechConfig.voiceOfUser ?? '', user)
                        const voiceUser = voiceOfUserTagged.length > 0 ? await TwitchHelixHelper.getUserByLogin(voiceOfUserTagged) : undefined
                        const voiceUserId = parseInt(voiceUser?.id ?? '')
                        await modules.tts.enqueueSpeakSentence(
                            ttsStr,
                            isNaN(voiceUserId) ? chatbotTokens?.userId : voiceUserId,
                            speechConfig.type ?? ETTSType.Announcement,
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

    private static buildPipeCallback(config: IPipeAction|undefined): IActionCallback|undefined {
        if(config) return {
            tag: '📺',
            description: 'Callback that triggers an OpenVRNotificationPipe action',
            call: async (user: IActionUser, index?: number) => {
                const modules = ModulesSingleton.getInstance()
                const configClone = Utils.clone(config)
                configClone.config = await DataBaseHelper.load(new PresetPipeCustom(), config.configRef)

                // Need to reference the original config arrays here as the __type is dropped in the clone process.
                configClone.imagePathEntries = Utils.ensureArray(config.imagePathEntries).getAsType(index)
                configClone.imageDataEntries = Utils.ensureArray(config.imageDataEntries).getAsType(index)

                // Replace tags in texts.
                configClone.texts = await TextHelper.replaceTagsInTextArray(configClone.texts, user)
                configClone.imagePathEntries = await TextHelper.replaceTagsInTextArray(configClone.imagePathEntries, user)
                if(configClone.config && configClone.config.customProperties) {
                    for(const textArea of configClone.config.customProperties.textAreas) {
                        textArea.text = await TextHelper.replaceTagsInText(textArea.text, user)
                    }
                }

                // Show it
                modules.pipe.showAction(TempFactory.pipeActionInterface(configClone)).then()
            }
        }
    }

    private static buildOpenVR2WSSettingCallback(config: IOpenVR2WSSetting|undefined): IActionCallback|undefined {
        if(config) return {
            tag: '🔧',
            description: 'Callback that triggers an OpenVR2WSSetting action',
            call: () => {
                const modules = ModulesSingleton.getInstance()
                modules.openvr2ws.setSetting(config).then()
            }
        }
    }

    private static buildOpenVR2WSMoveSpaceCallback(config: IOpenVR2WSMoveSpace|undefined): IActionCallback|undefined {
        if(config) return {
            tag: '⚖',
            description: 'Callback that triggers an OpenVR2WSMoveSpace action',
            call: () => {
                const modules = ModulesSingleton.getInstance()
                modules.openvr2ws.moveSpace(config).then()
            }
        }
    }

    private static buildSignCallback(config: ISignAction|undefined): IActionCallback|undefined {
        if(config) return {
            tag: '🚦',
            description: 'Callback that triggers a Sign action',
            call: (user: IActionUser) => {
                const modules = ModulesSingleton.getInstance()
                TwitchHelixHelper.getUserById(user.id).then(async userData => {
                    const modules = ModulesSingleton.getInstance()
                    const clonedConfig = Utils.clone(config)
                    clonedConfig.title = await TextHelper.replaceTagsInText(clonedConfig.title ?? '', user)
                    if(clonedConfig.image == undefined) clonedConfig.image = userData?.profile_image_url
                    clonedConfig.image = await TextHelper.replaceTagsInText(clonedConfig.image ?? '', user)
                    clonedConfig.subtitle = await TextHelper.replaceTagsInText(clonedConfig.subtitle ?? '', user)
                    modules.sign.enqueueSign(clonedConfig)
                })
            }
        }
    }

    private static buildKeysCallback(config: IInputAction|undefined): IActionCallback|undefined {
        if(config) return {
            tag: '🎓',
            description: 'Callback that triggers an ExecUtils action',
            call: async () => {
                ExecUtils.runKeyPressesFromPreset(config)
            }
        } 
    }

    private static buildURICallback(config: IEntriesAction|undefined): IActionCallback|undefined {
        if(config) return {
            tag: '🦾',
            description: 'Callback that triggers an URI action',
            call: async (user: IActionUser, index?: number) => {
                const entries = Utils.ensureArray(config.entries).getAsType(index)
                for(const entry of entries) {
                    ExecUtils.loadCustomURI(await TextHelper.replaceTagsInText(entry, user))
                }
            }
        }
    }

    private static buildWebCallback(config: IEntriesAction|undefined): IActionCallback|undefined {
        if(config) return {
            tag: '🌐',
            description: 'Callback that triggers a Web action',
            call: async (user: IActionUser, index?: number) => {
                const entries = Utils.ensureArray(config.entries).getAsType(index)
                for(const entry of entries) {
                    const result = await fetch(entry, {mode: 'no-cors'})
                    console.log(result)
                }
            }
        }
    }

    private static buildScreenshotCallback(config: IScreenshotAction|undefined, key: TKeys, nonce: string): IActionCallback|undefined {
        if(config) return {
            tag: '📸',
            description: 'Callback that triggers a Screenshot action',
            call: async (user: IActionUser) => {
                const states = StatesSingleton.getInstance()
                const modules = ModulesSingleton.getInstance()
                const userInput = user.input
                const screenshotsConfig = await DataBaseHelper.loadMain(new ConfigScreenshots())
                const soundConfig = Utils.ensureObjectNotId(screenshotsConfig.callback.captureSoundEffect)
                if(userInput) {
                    // This is executed after the TTS with the same nonce has finished.
                    states.nonceCallbacks.set(nonce, ()=>{
                        if(config.obsSource) {
                            // OBS Source Screenshot
                            const messageId = modules.obs.takeSourceScreenshot(key, user, config.obsSource, config.delay ?? 0)
                            states.nonceCallbacks.set(messageId, ()=>{
                                if(soundConfig) modules.audioPlayer.enqueueAudio(TempFactory.configAudio(soundConfig))
                            })
                        } else {
                            // SuperScreenShotterVR
                            modules.sssvr.sendScreenshotRequest(key, user, config.delay ?? 0)
                        }    
                    })
                } else {
                    if(config.obsSource) {
                        // OBS Source Screenshot
                        if(soundConfig) modules.audioPlayer.enqueueAudio(TempFactory.configAudio(soundConfig))
                        modules.obs.takeSourceScreenshot(key, user, config.obsSource)
                    } else {
                        // SuperScreenShotterVR
                        modules.sssvr.sendScreenshotRequest(key, user)
                    }
                }
            }
        }
    }

    private static buildTwitchChatCallback(config: IEntriesAction|undefined): IActionCallback|undefined {
        if(config) return {
            tag: '📄',
            description: 'Callback that triggers a Twitch chat message action',
            call: async (user: IActionUser, index?: number) => {
                const modules = ModulesSingleton.getInstance()
                const entries = Utils.ensureArray(config.entries).getAsType(index)
                for(const entry of entries) {
                    modules.twitch._twitchChatOut.sendMessageToChannel(
                        await TextHelper.replaceTagsInText(entry, user)
                    )
                }
            }
        }
    }
    private static buildTwitchWhisperCallback(config: IWhisperAction|undefined): IActionCallback|undefined {
        if(config) return {
            tag: '💭',
            description: 'Callback that triggers a Twitch whisper action',
            call: async (user: IActionUser, index?: number) => {
                const modules = ModulesSingleton.getInstance()
                const entries = Utils.ensureArray<string>(config.entries).getAsType(index)
                for(const entry of entries) {
                    modules.twitch._twitchChatOut.sendMessageToUser(
                        await TextHelper.replaceTagsInText(config.user, user),
                        await TextHelper.replaceTagsInText(entry, user)
                    )
                }
            }
        }
    }
    // endregion
}