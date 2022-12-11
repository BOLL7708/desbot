import {ITwitchCheer, ITwitchCommandConfig, ITwitchReward} from '../../Interfaces/itwitch.js'
import {
    IActionCallback,
    IActions,
    IActionsExecutor,
    IActionsMainCallback,
    IActionUser,
    IAudioAction,
    IEntriesAction,
    ILabelAction,
    IObsAction,
    IPhilipsHueColorAction,
    IPhilipsHuePlugAction,
    IPipeAction,
    IInputAction,
    IRewardStatesConfig,
    IScreenshotAction,
    ISignAction,
    ISpeechAction,
    ISystemAction,
    ITTSAction,
    IWhisperAction
} from '../../Interfaces/iactions.js'
import {IOpenVR2WSMoveSpace, IOpenVR2WSRelay, IOpenVR2WSSetting} from '../../Interfaces/iopenvr2ws.js'
import {EEventSource, ETTSFunction, ETTSType} from './Enums.js'
import IKeyBoolRecord from '../../Interfaces/i.js'
import ExecUtils from '../../Classes/ExecUtils.js'
import Callbacks from './Callbacks.js'
import {
    ITwitchPubsubCheerMessage,
    ITwitchPubsubRewardMessage,
    ITwitchPubsubSubscriptionMessage
} from '../../Interfaces/itwitch_pubsub.js'
import Color from '../../Classes/ColorConstants.js'
import {EBehavior, IEvent} from '../../Interfaces/ievents.js'
import Config from '../../Classes/Config.js'
import StatesSingleton from '../../Singletons/StatesSingleton.js'
import DiscordUtils from '../../Classes/DiscordUtils.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
import Utils from '../../Classes/Utils.js'
import {ITwitchHelixRewardUpdate} from '../../Interfaces/itwitch_helix.js'
import ActionsCallbacks from './ActionsCallbacks.js'
import {TKeys} from '../_data/!keys.js'
import {
    SettingAccumulatingCounter, SettingCounterBase,
    SettingDictionaryEntry,
    SettingIncrementingCounter,
    SettingTwitchTokens,
    SettingUserMute,
    SettingUserName,
    SettingUserVoice
} from '../../Classes/SettingObjects.js'
import TwitchHelixHelper from '../../Classes/TwitchHelixHelper.js'
import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import DataUtils from '../../Classes/DataUtils.js'
import {IDictionaryEntry} from '../../Classes/Dictionary.js'

export class ActionHandler {
    constructor(
        public key: TKeys,
        public appId: string = ''
    ) {}
    public async call(user: IActionUser) {
        let event = Utils.getEventConfig(this.key)
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
        const options = event?.options ?? {}
        const actionsEntries = Utils.ensureArray(event?.actionsEntries)
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
        switch(options?.behavior) {
            case EBehavior.Random:
                actionsMainCallback = Actions.buildActionsMainCallback(this.key, [actionsEntries.getRandom() ?? {}])
                break
            case EBehavior.Incrementing:
                // Load incremental counter
                counter = await DataBaseHelper.loadSetting(new SettingIncrementingCounter(), this.key) ?? new SettingIncrementingCounter()

                // Switch to the next incremental reward if it has more configs available
                rewardConfigs = Utils.ensureArray(event?.triggers.reward)
                if(rewardConfigs.length > 1) {
                    counter.count++
                    const newRewardConfig = options.rewardMergeUpdateConfigWithFirst
                        ? { ...rewardConfigs[0], ...rewardConfigs[counter.count] }
                        : rewardConfigs[counter.count]
                    if (newRewardConfig) {
                        await DataBaseHelper.saveSetting(counter, this.key)
                        TwitchHelixHelper.updateReward(await Utils.getRewardId(this.key), newRewardConfig).then()
                    }
                }
                // Register index and build callback for this step of the sequence
                index = (counter?.count ?? 1)-1
                actionsMainCallback = Actions.buildActionsMainCallback(this.key, actionsEntries.getAsType(index))
                break
            case EBehavior.Accumulating:
                // Load accumulating counter
                counter = await DataBaseHelper.loadSetting(new SettingAccumulatingCounter(), this.key) ?? new SettingAccumulatingCounter()
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
                        await DataBaseHelper.saveSetting(counter, this.key)
                        newRewardConfigClone.title = await Utils.replaceTagsInText(newRewardConfigClone.title, user)
                        newRewardConfigClone.prompt = await Utils.replaceTagsInText(newRewardConfigClone.prompt, user)
                        const cost = newRewardConfigClone.cost ?? 0
                        // Make sure the last reward doesn't cost more points than the total left.
                        if(rewardIndex < 2 && (currentCount + cost) > goalCount) newRewardConfigClone.cost = goalCount - currentCount
                        TwitchHelixHelper.updateReward(await Utils.getRewardId(this.key), newRewardConfigClone).then()
                    }
                }
                // Register index and build callback for this step of the sequence
                actionsMainCallback = Actions.buildActionsMainCallback(this.key, actionsEntries.getAsType(index))
                break
            case EBehavior.MultiTier:
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
                        newRewardConfigClone.title = await Utils.replaceTagsInText(newRewardConfigClone.title, user)
                        newRewardConfigClone.prompt = await Utils.replaceTagsInText(newRewardConfigClone.prompt, user)
                        if (newRewardConfigClone) TwitchHelixHelper.updateReward(await Utils.getRewardId(this.key), newRewardConfigClone).then()
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
                        newRewardConfigClone.title = await Utils.replaceTagsInText(newRewardConfigClone.title, user)
                        newRewardConfigClone.prompt = await Utils.replaceTagsInText(newRewardConfigClone.prompt, user)
                        TwitchHelixHelper.updateReward(await Utils.getRewardId(this.key), newRewardConfigClone).then()
                    }
                } else if(options.multiTierDisableWhenMaxed) {
                    TwitchHelixHelper.toggleRewards({[this.key]: false}).then()
                }

                // Register index and build callback for this step of the sequence
                index = multiTierCounter.count
                actionsMainCallback = Actions.buildActionsMainCallback(this.key, actionsEntries.getAsType(index))
                break
            default: // No special behavior, only generate the callback if it is missing, but uses the entries by type.
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
        for(const [key, event] of Object.entries(Config.events) as [TKeys, IEvent][]) {
            if(event.triggers.reward) await this.registerReward(key)
            if(event.triggers.command) await this.registerCommand(key)
            if(event.triggers.remoteCommand) await this.registerRemoteCommand(key)
            if(event.triggers.cheer) await this.registerCheer(key)
            if(event.triggers.timer) await this.registerTimer(key)
            if(event.triggers.relay) await this.registerRelay(key)
        }
    }

    // region User DataUtils Builders
    public static async buildUserDataFromRedemptionMessage(key: TKeys, message?: ITwitchPubsubRewardMessage): Promise<IActionUser> {
        const modules = ModulesSingleton.getInstance()
        const id = message?.data?.redemption?.user?.id ?? ''
        const input = message?.data?.redemption?.user_input ?? ''
        return {
            source: EEventSource.TwitchReward,
            eventKey: key,
            id: parseInt(id),
            login: message?.data?.redemption?.user?.login ?? '',
            name: message?.data?.redemption?.user?.display_name ?? '',
            input: input,
            inputWords: input.split(' '),
            message: await Utils.cleanText(message?.data?.redemption?.user_input),
            color: await TwitchHelixHelper.getUserColor(id) ?? '',
            isBroadcaster: false,
            isModerator: false,
            isVIP: false,
            isSubscriber: false,
            bits: 0,
            bitsTotal: 0,
            rewardCost: message?.data?.redemption?.reward?.cost ?? 0,
            rewardMessage: message
        }
    }
    public static async buildUserDataFromCheerMessage(key: TKeys, message?: ITwitchPubsubCheerMessage): Promise<IActionUser> {
        const modules = ModulesSingleton.getInstance()
        const user = await TwitchHelixHelper.getUserByLogin(message?.data?.user_name ?? '')
        const id = user?.id ?? ''
        const input = message?.data?.chat_message ?? ''
        return {
            source: EEventSource.TwitchCheer,
            eventKey: key,
            id: parseInt(id),
            login: user?.login ?? '',
            name: user?.display_name ?? '',
            input: input,
            inputWords: input.split(' '),
            message: await Utils.cleanText(message?.data?.chat_message),
            color: await TwitchHelixHelper.getUserColor(id) ?? '',
            isBroadcaster: false,
            isModerator: false,
            isVIP: false,
            isSubscriber: false,
            bits: message?.data?.bits_used ?? 0,
            bitsTotal: message?.data?.total_bits_used ?? 0,
            rewardCost: 0
        }
    }
    public static async buildUserDataFromSubscriptionMessage(key: TKeys, message?: ITwitchPubsubSubscriptionMessage): Promise<IActionUser> {
        const modules = ModulesSingleton.getInstance()
        const user = await TwitchHelixHelper.getUserByLogin(message?.user_name ?? '')
        const id = user?.id ?? ''
        const input = message?.sub_message.message ?? ''
        return {
            source: EEventSource.TwitchSubscription,
            eventKey: key,
            id: parseInt(id),
            login: user?.login ?? '',
            name: user?.display_name ?? '',
            input: input,
            inputWords: input.split(' '),
            message: await Utils.cleanText(message?.sub_message.message),
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
    public static async buildEmptyUserData(source: EEventSource, key: TKeys, userName?: string, userInput?: string, userMessage?: string): Promise<IActionUser> {
        // TODO: Make this use the user ID instead of username?
        const channelTokens = await DataBaseHelper.loadSetting(new SettingTwitchTokens(), 'Channel')
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
            message: await Utils.cleanText(userMessage ?? userInput),
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

    // region Trigger Registration
    public static async registerReward(key: TKeys, appId: string = '') {
        const modules = ModulesSingleton.getInstance()
        const actionHandler = new ActionHandler(key, appId)
        const reward: ITwitchReward = {
            id: await Utils.getRewardId(key),
            handler: actionHandler
        }
        if(reward.id != null) {
            modules.twitchPubsub.registerReward(reward)
        } else {
            Utils.logWithBold(`No Reward ID for <${key}>, it might be missing a reward config.`, 'red')
        }
    }

    private static async registerCommand(key: TKeys) {
        const modules = ModulesSingleton.getInstance()
        const event = Utils.getEventConfig(key)
        let command = event?.triggers.command
        if(command) {
            const triggers = Utils.ensureArray(command.entries)
            for(let trigger of triggers) {
                trigger = Utils.replaceTags(trigger, {eventKey: key})
                const actionHandler = new ActionHandler(key)

                // Set handler depending on cooldowns
                const useThisCommand = <ITwitchCommandConfig> {...(event?.triggers.command ?? {}), trigger: trigger }
                if(command?.userCooldown !== undefined) useThisCommand.cooldownUserHandler = actionHandler
                else if(command?.globalCooldown !== undefined) useThisCommand.cooldownHandler = actionHandler
                else useThisCommand.handler = actionHandler
                modules.twitch.registerCommand(useThisCommand)
            }
        }
    }

    private static async registerRemoteCommand(key: TKeys) {
        const modules = ModulesSingleton.getInstance()
        const event = Utils.getEventConfig(key)
        const remoteCommand = event?.triggers.remoteCommand
        if(remoteCommand) {
            const triggers = Utils.ensureArray(remoteCommand.entries)
            for(let trigger of triggers) {
                trigger = Utils.replaceTags(trigger, {eventKey: key})
                const actionHandler = new ActionHandler(key)

                // Set handler depending on cooldowns
                const useThisCommand = <ITwitchCommandConfig> {...event.triggers.remoteCommand, trigger: trigger, allowedUsers: Config.twitch.remoteCommandAllowedUsers }
                if(remoteCommand?.userCooldown !== undefined) useThisCommand.cooldownUserHandler = actionHandler
                else if(remoteCommand?.globalCooldown !== undefined) useThisCommand.cooldownHandler = actionHandler
                else useThisCommand.handler = actionHandler
                modules.twitch.registerRemoteCommand(useThisCommand)
            }
        }
    }

    private static async registerCheer(key: TKeys) {
        const modules = ModulesSingleton.getInstance()
        const actionHandler = new ActionHandler(key)
        const event = Utils.getEventConfig(key)
        const cheer: ITwitchCheer = {
            bits: event?.triggers.cheer ?? 0,
            handler: actionHandler
        }
        if(cheer.bits > 0) {
            modules.twitchPubsub.registerCheer(cheer)
        } else {
            Utils.logWithBold(`Cannot register cheer event for: <${key}>, it might be missing a cheer config.`, 'red')
        }
    }

    private static async registerTimer(key: TKeys) {
        const actionHandler = new ActionHandler(key)
        const user = await this.buildEmptyUserData(EEventSource.Timer, key)
        const event = Utils.getEventConfig(key)
        const config = event?.triggers.timer
        let handle: number = -1
        let count = 0
        const times = config?.times ?? 0
        const interval = config?.interval ?? 10
        const delay = Math.max(0, (config?.delay ?? 10) - interval)
        setTimeout(()=>{
            handle = setInterval(()=>{
                actionHandler.call(user)
                count++
                if(times > 0) {
                    if(count >= times) clearInterval(handle)
                }
            }, interval*1000)
        }, delay*1000)
    }

    private static async registerRelay(key: TKeys) {
        const event = Utils.getEventConfig(key)
        const relay: IOpenVR2WSRelay = {
            key: <TKeys> Utils.replaceTags(event?.triggers.relay ?? 'Unknown', {eventKey: key}),
            handler: new ActionHandler(key)
        }
        if(relay.key.length > 0) {
            Callbacks.registerRelay(relay)
        } else {
            Utils.logWithBold(`Cannot register relay event for: <${key}>, it might be missing a relay config.`, 'red')
        }
    }
    // endregion

    // region Main Action Builder
    public static buildActionsMainCallback(key: TKeys, actionsArr: IActions[]): IActionsMainCallback {
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

        const actionsExecutors: IActionsExecutor[] = [] // A list of stacks of actions to execute.
        if(actionsArr.length == 0) actionsArr.push({}) // We need at least one empty object to register default actions in the loop below.
        for(const actions of actionsArr) {
            const actionCallbacks: IActionCallback[] = [] // The stack of actions to execute.

            // Build callbacks
            actionCallbacks.pushIfExists(this.buildTTSCallback(actions?.tts))
            actionCallbacks.pushIfExists(actions?.custom)
            actionCallbacks.pushIfExists(ActionsCallbacks.stack[key as TKeys])
            actionCallbacks.pushIfExists(this.buildOBSCallback(actions?.obs, key))
            actionCallbacks.pushIfExists(this.buildColorCallback(actions?.lights))
            actionCallbacks.pushIfExists(this.buildPlugCallback(actions?.plugs))
            actionCallbacks.pushIfExists(this.buildSoundAndSpeechCallback(
                actions?.audio, 
                actions?.speech,
                nonceTTS, 
                !!(actions?.speech)
            ))
            actionCallbacks.pushIfExists(this.buildPipeCallback(actions?.pipe))
            actionCallbacks.pushIfExists(this.buildOpenVR2WSSettingCallback(actions?.vrSetting))
            actionCallbacks.pushIfExists(this.buildOpenVR2WSMoveSpaceCallback(actions?.vrMoveSpace))
            actionCallbacks.pushIfExists(this.buildSignCallback(actions?.sign))
            actionCallbacks.pushIfExists(this.buildKeysCallback(actions?.input))
            actionCallbacks.pushIfExists(this.buildURICallback(actions?.uri))
            actionCallbacks.pushIfExists(this.buildWebCallback(actions?.web))
            actionCallbacks.pushIfExists(this.buildScreenshotCallback(actions?.screenshots, key, nonceTTS))
            actionCallbacks.pushIfExists(this.buildDiscordMessageCallback(actions?.discord, key))
            actionCallbacks.pushIfExists(this.buildTwitchChatCallback(actions?.chat))
            actionCallbacks.pushIfExists(this.buildTwitchWhisperCallback(actions?.whisper))
            actionCallbacks.pushIfExists(this.buildLabelCallback(actions?.label))
            actionCallbacks.pushIfExists(this.buildSystemCallback(actions?.system))
            actionCallbacks.pushIfExists(this.buildRemoteCommandCallback(actions?.remoteCommand))

            // Logging
            if(actionCallbacks.length == 1) {
                Utils.logWithBold(`Built Action Callback for <${key}>: ${actionCallbacks[0].tag} "${actionCallbacks[0].description}"`, Color.Green)
            } else {
                Utils.logWithBold(`Built Action Callback for <${key}>: ${actionCallbacks.map(ac => ac.tag).join(', ')}`, Color.Green)
            }

            // Push item with callback that triggers all the actions generated.
            actionsExecutors.push({
                timeMs: actions._timeMs,
                delayMs: actions._delayMs,
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
    private static buildOBSCallback(config: IObsAction|undefined, key: TKeys): IActionCallback|undefined {
        if(config) return {
            tag: '🎬',
            description: 'Callback that triggers an OBS action',
            call: () => {
                const modules = ModulesSingleton.getInstance()
                config.key = key
                const state = config.state ?? true
                console.log("OBS Reward triggered")
                modules.obs.toggle(config, state)
            }
        }
    }

    private static buildColorCallback(config: IPhilipsHueColorAction|undefined): IActionCallback|undefined {
        if(config) return {
            tag: '🎨',
            description: 'Callback that triggers a Philips Hue color action',
            call: (user, index) => {
                const modules = ModulesSingleton.getInstance()
                const colors = Utils.ensureArray(config.entries).getAsType(index)
                const color = colors.pop() // No reason to set more than one color at the same time for the same bulb.
                for(const bulb of config.bulbs) {
                    if(color) modules.hue.setLightState(bulb, color.x, color.y)
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
                    ttsStrings = await Utils.replaceTagsInTextArray(
                        Utils.ensureArray(speechConfig.entries).getAsType(index),
                        user
                    )
                    onTtsQueue = true
                }
                if(config) { // If we have an audio config, play it. Attach 
                    const configClone = Utils.clone(config)
                    configClone.srcEntries = await Utils.replaceTagsInTextArray( // To support audio URLs in input
                        Utils.ensureArray(config.srcEntries).getAsType(index), // Need to read entries from config here as cloning drops __type
                        user
                    )
                    if(onTtsQueue) modules.tts.enqueueSoundEffect(configClone)
                    else modules.audioPlayer.enqueueAudio(configClone)
                }
                if(speechConfig && ttsStrings.length > 0) {
                    for(const ttsStr of ttsStrings) {
                        const chatbotTokens = await DataBaseHelper.loadSetting(new SettingTwitchTokens(), 'Chatbot')
                        const voiceOfUserTagged = await Utils.replaceTagsInText(speechConfig.voiceOfUser ?? '', user)
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

                // Need to reference the original config arrays here as the __type is dropped in the clone process.
                configClone.imagePathEntries = Utils.ensureArray(config.imagePathEntries).getAsType(index)
                configClone.imageDataEntries = Utils.ensureArray(config.imageDataEntries).getAsType(index)

                // Replace tags in texts.
                configClone.texts = await Utils.replaceTagsInTextArray(configClone.texts, user)
                configClone.imagePathEntries = await Utils.replaceTagsInTextArray(configClone.imagePathEntries, user)
                if(configClone.config.customProperties) {
                    configClone.config.customProperties.textAreas = Utils.clone(Utils.ensureArray(config.config.customProperties?.textAreas))
                    for(const textArea of configClone.config.customProperties.textAreas) {
                        textArea.text = await Utils.replaceTagsInText(textArea.text, user)
                    }
                }

                // Show it
                modules.pipe.showPreset(configClone).then()
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
                    clonedConfig.title = await Utils.replaceTagsInText(clonedConfig.title ?? '', user)
                    if(clonedConfig.image == undefined) clonedConfig.image = userData?.profile_image_url
                    clonedConfig.image = await Utils.replaceTagsInText(clonedConfig.image ?? '', user)
                    clonedConfig.subtitle = await Utils.replaceTagsInText(clonedConfig.subtitle ?? '', user)
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
                    ExecUtils.loadCustomURI(await Utils.replaceTagsInText(entry, user))
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
            call: (user: IActionUser) => {
                const states = StatesSingleton.getInstance()
                const modules = ModulesSingleton.getInstance()
                const userInput = user.input
                if(userInput) {
                    // This is executed after the TTS with the same nonce has finished.
                    states.nonceCallbacks.set(nonce, ()=>{
                        if(config.obsSource) {
                            // OBS Source Screenshot
                            const messageId = modules.obs.takeSourceScreenshot(key, user, config.obsSource, config.delay ?? 0)
                            states.nonceCallbacks.set(messageId, ()=>{
                                modules.audioPlayer.enqueueAudio(Config.screenshots.callback.soundEffectForOBSScreenshots)
                            })
                        } else {
                            // SuperScreenShotterVR
                            modules.sssvr.sendScreenshotRequest(key, user, config.delay ?? 0)
                        }    
                    })
                } else {
                    if(config.obsSource) {
                        // OBS Source Screenshot
                        modules.audioPlayer.enqueueAudio(Config.screenshots.callback.soundEffectForOBSScreenshots)
                        modules.obs.takeSourceScreenshot(key, user, config.obsSource)
                    } else {
                        // SuperScreenShotterVR
                        modules.sssvr.sendScreenshotRequest(key, user)
                    }
                }
            }
        }
    }

    private static buildDiscordMessageCallback(config: IEntriesAction|undefined, key: TKeys): IActionCallback|undefined {
        if(config) return {
            tag: '💬',
            description: 'Callback that triggers a DiscordUtils message action',
            call: async (user: IActionUser, index?: number) => {
                const modules = ModulesSingleton.getInstance()
                const userData = await TwitchHelixHelper.getUserById(user.id)
                const entries = Utils.ensureArray(config.entries).getAsType(index)
                for(const entry of entries ) {
                    DiscordUtils.enqueueMessage(
                        Config.credentials.DiscordWebhooks[key] ?? '',
                        user.name,
                        userData?.profile_image_url,
                        await Utils.replaceTagsInText(entry, user)
                    )
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
                        await Utils.replaceTagsInText(entry, user)
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
                        await Utils.replaceTagsInText(config.user, user),
                        await Utils.replaceTagsInText(entry, user)
                    )
                }
            }
        }
    }

    private static buildLabelCallback(config: ILabelAction|undefined): IActionCallback|undefined {
        if(config) return {
            tag: '🏷',
            description: 'Callback that triggers a Label action',
            call: async (user: IActionUser) => {
                if(config.append) {
                    await DataUtils.appendText(config.fileName, await Utils.replaceTagsInText(config.text, user))
                } else {
                    await DataUtils.writeText(config.fileName, await Utils.replaceTagsInText(config.text, user))
                }
            }
        }
    }

    private static buildSystemCallback(config: ISystemAction|undefined): IActionCallback|undefined {
        if(config) return {
            tag: '🖐',
            description: 'Callback that triggers events',
            call: async(user, index) => {
                const modules = ModulesSingleton.getInstance()
                const interval = config.triggerInterval ?? 0
                let delay = 0

                // Trigger Commands
                const commands = Utils.ensureArray(config.triggerCommandEntries).getAsType(index)
                for(const command of commands) {
                    Utils.log(`Executing command: ${command} in ${delay} seconds...`, Color.Grey)
                    let inputText = user.input
                    if(command.includes(' ')) inputText = Utils.splitOnFirst(' ', inputText)[0]
                    setTimeout(()=>{
                        modules.twitch.runCommand(command, {...user, input: inputText}).then()
                    }, delay*1000)
                    delay += interval
                }

                // Trigger Events by Keys
                const keys = Utils.ensureArray(config.triggerEventEntries).getAsType(index)
                for(const key of keys) {
                    Utils.log(`Executing event: ${key} in ${delay} seconds...`, Color.Grey)
                    setTimeout(()=>{
                        new ActionHandler(key).call(user).then()
                    }, delay*1000)
                    delay += interval
                }

                // Toggle Rewards
                const rewardToggles: TKeys[] = []
                const rewardStates: IKeyBoolRecord = {}
                for(const [key, stateConfig] of Object.entries(config.toggleRewardStates ?? {}) as [TKeys, IRewardStatesConfig][]) {
                    const stateConfigClone = Utils.clone(stateConfig)
                    // Get current reward state if none was provided in config.
                    if(stateConfigClone.state == undefined) {
                        rewardToggles.push(key)
                    } else {
                        rewardStates[key] = stateConfigClone.state
                    }
                    // Change the overrides to make this persistent this session.
                    if(stateConfigClone.override) {
                        const on = Config.twitch.alwaysOnRewards
                        const off = Config.twitch.alwaysOffRewards
                        if(stateConfigClone.state) {
                            if (!on.includes(key)) on.push(key)
                            if (off.includes(key)) delete off[off.indexOf(key)]
                        } else {
                            if (!off.includes(key)) off.push(key)
                            if (on.includes(key)) delete on[on.indexOf(key)]
                        }
                    }
                }
                // Toggle the rewards on Twitch
                await TwitchHelixHelper.toggleRewards(rewardStates)
                await TwitchHelixHelper.toggleRewards(rewardToggles)
            }
        }
    }

    private static buildRemoteCommandCallback(config: IEntriesAction|undefined): IActionCallback|undefined {
        if(config) return {
            tag: '🤝',
            description: 'Callback that triggers a Remote Command action',
            call: (user: IActionUser, index?: number) => {
                const modules = ModulesSingleton.getInstance()
                const entries = Utils.ensureArray(config.entries).getAsType(index)
                for(const entry of entries) {
                    modules.twitch.sendRemoteCommand(entry).then()
                }
            }
        }
    }

    private static buildTTSCallback(config: ITTSAction|undefined): IActionCallback|undefined {
        if(config) return {
            tag: '🗣',
            awaitCall: true,
            description: 'Callback that executes a TTS function',
            call: async (user: IActionUser) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                const input = await Utils.replaceTagsInText(config.inputOverride ?? user.input, user)
                const inputLowerCase = input.toLowerCase()
                const targetId = parseInt(await Utils.replaceTagsInText('%targetId', user))
                const targetLogin = await Utils.replaceTagsInText('%targetLogin', user)
                const targetOrUserId = parseInt(await Utils.replaceTagsInText('%targetOrUserId', user))
                const targetOrUserLogin = await Utils.replaceTagsInText('%targetOrUserLogin', user)
                const userInputHead = await Utils.replaceTagsInText('%userInputHead', user)
                const userInputRest = await Utils.replaceTagsInText('%userInputRest', user)
                const userInputNoTags = await Utils.replaceTagsInText('%userInputNoTags', user)
                const canSetThingsForOthers = user.isBroadcaster || user.isModerator
                switch(config.function) {
                    case ETTSFunction.Enable:
                        states.ttsForAll = true
                        break
                    case ETTSFunction.Disable:
                        states.ttsForAll = false
                        break
                    case ETTSFunction.StopCurrent:
                        modules.tts.stopSpeaking()
                        break
                    case ETTSFunction.StopAll:
                        modules.tts.stopSpeaking(true)
                        break
                    case ETTSFunction.SetUserEnabled: {
                        if (!targetId) break
                        const setting = new SettingUserMute()
                        setting.active = false
                        setting.reason = userInputRest
                        await DataBaseHelper.saveSetting(setting, targetId.toString())
                        break
                    }
                    case ETTSFunction.SetUserDisabled: {
                        if (!targetId) break
                        const setting = new SettingUserMute()
                        setting.active = true
                        setting.reason = userInputRest
                        await DataBaseHelper.saveSetting(setting, targetId.toString())
                        break
                    }
                    case ETTSFunction.SetUserNick: {
                        let id =targetOrUserId // We can change nick for us or someone else by default
                        if(!id || user.source == EEventSource.TwitchReward) { // Except rewards, because they are publicly available
                            id = user.id
                        }
                        const isSettingNickOfOther = user.id !== id
                        const newNick = userInputNoTags

                        // Cancel if the user does not actually exist on Twitch
                        const userData = await TwitchHelixHelper.getUserById(id)
                        if(!userData) return Utils.log(`TTS Nick: User with ID:${id} does not exist.`, Color.Red)

                        if(
                            id && newNick.length && (
                                canSetThingsForOthers || (
                                    isSettingNickOfOther == canSetThingsForOthers
                                )
                            )
                        ) {
                            // We rename the user
                            states.textTagCache.lastTTSSetNickLogin = userData.display_name
                            states.textTagCache.lastTTSSetNickSubstitute = newNick
                            const setting = new SettingUserName()
                            setting.shortName = newNick
                            setting.editorUserId = id
                            setting.datetime = Utils.getISOTimestamp()
                            await DataBaseHelper.saveSetting(setting, id.toString())
                        } else {
                            // We do nothing
                            states.textTagCache.lastTTSSetNickLogin = ''
                            states.textTagCache.lastTTSSetNickSubstitute = ''
                        }
                        break
                    }
                    case ETTSFunction.GetUserNick: {
                        const userData = await TwitchHelixHelper.getUserById(targetOrUserId)
                        if(userData && userData.login.length) {
                            const currentName = await DataBaseHelper.loadSetting(new SettingUserName(), userData.id)
                            if(currentName) {
                                states.textTagCache.lastTTSSetNickLogin = userData.display_name
                                states.textTagCache.lastTTSSetNickSubstitute = currentName.shortName
                            } else {
                                states.textTagCache.lastTTSSetNickLogin = userData.display_name
                                states.textTagCache.lastTTSSetNickSubstitute = ''
                            }
                        }
                        break
                    }
                    case ETTSFunction.ClearUserNick: {
                        let id = targetOrUserId // We can change nick for us or someone else by default
                        if (!id || user.source == EEventSource.TwitchReward) { // Except rewards, because they are publicly available
                            id = user.id
                        }
                        const isClearingNickOfOther = user.id !== id
                        const userData = await TwitchHelixHelper.getUserById(id)
                        if (
                            userData && (canSetThingsForOthers || (isClearingNickOfOther == canSetThingsForOthers))
                        ) {
                            // We clear the custom nick for the user, setting it to a clean one.
                            const cleanName = Utils.cleanName(userData.login)
                            states.textTagCache.lastTTSSetNickLogin = userData.display_name
                            states.textTagCache.lastTTSSetNickSubstitute = cleanName
                            const setting = new SettingUserName()
                            setting.shortName = cleanName
                            setting.editorUserId = user.id
                            setting.datetime = Utils.getISOTimestamp()
                            await DataBaseHelper.saveSetting(setting, id.toString())
                        }
                        break
                    }
                    case ETTSFunction.SetUserVoice: {
                        let id = targetOrUserId // We can change voice for us or someone else by default
                        if (!id || user.source == EEventSource.TwitchReward) { // Except rewards, because they are publicly available
                            id = user.id
                        }
                        const isSettingVoiceOfOther = user.id !== id
                        if (
                            id && userInputNoTags.length
                            && (canSetThingsForOthers || (isSettingVoiceOfOther == canSetThingsForOthers))
                        ) {
                            await modules.tts.setVoiceForUser(id, userInputNoTags)
                        }
                        break
                    }
                    case ETTSFunction.SetDictionaryEntry: {
                        let word = userInputHead.trim().toLowerCase()
                        const firstChar = word[0] ?? ''
                        word = ['+', '-'].includes(firstChar) ? word.substring(1) : word
                        const substitute = Utils.cleanSetting(userInputRest).toLowerCase()

                        let entry = await DataBaseHelper.loadSetting(new SettingDictionaryEntry(), word)
                        if(!entry) {
                            entry = new SettingDictionaryEntry()
                            entry.substitute = ''
                            entry.editorUserId = user.id
                            entry.datetime = Utils.getISOTimestamp()
                        }
                        const entries = entry.substitute.split(',')
                        entries.splice(entries.indexOf(word), 1)
                        switch (firstChar) {
                            case '+':
                                entries.push(substitute)
                                entry.substitute = entries.join(',')
                                break
                            case '-':
                                entries.splice(entries.indexOf(substitute), 1)
                                entry.substitute = entries.join(',')
                                break
                            default:
                                entry.substitute = substitute
                        }
                        states.textTagCache.lastDictionaryWord = word
                        states.textTagCache.lastDictionarySubstitute = entry.substitute
                        // Set substitute for word
                        if(word.length && substitute.length) {
                            const setting = new SettingDictionaryEntry()
                            setting.substitute = entry.substitute
                            await DataBaseHelper.saveSetting(setting, word)
                        }
                        // Clearing a word by setting it to itself
                        else if(word.length) {
                            entry.substitute = word
                            states.textTagCache.lastDictionarySubstitute = word
                            await DataBaseHelper.saveSetting(entry, word)
                        }
                        const fullDictionary = await DataBaseHelper.loadSettingsDictionary(new SettingDictionaryEntry())
                        if(fullDictionary) {
                            const dictionaryEntries = Object.entries(fullDictionary).map((pair)=>{
                                return { original: pair[0], substitute: pair[1].substitute } as IDictionaryEntry
                            })
                            modules.tts.setDictionary(dictionaryEntries)
                        } else {
                            Utils.log('TTS Dictionary: Could not load full dictionary to update TTS.', Color.DarkRed)
                        }
                        break
                    }
                    case ETTSFunction.GetDictionaryEntry: {
                        const word = userInputHead.trim().toLowerCase()
                        const entry = await DataBaseHelper.loadSetting(new SettingDictionaryEntry(), word)
                        if (entry) {
                            states.textTagCache.lastDictionaryWord = word
                            states.textTagCache.lastDictionarySubstitute = entry.substitute
                        } else {
                            states.textTagCache.lastDictionaryWord = word
                            states.textTagCache.lastDictionarySubstitute = ''
                        }
                        break
                    }
                    case ETTSFunction.SetUserGender: {
                        let id = targetOrUserId // We can change gender for us or someone else by default
                        if (!id || user.source == EEventSource.TwitchReward) { // Except rewards, because they are publicly available
                            id = user.id
                        }
                        const setting = await DataBaseHelper.loadSetting(new SettingUserVoice(), id.toString())
                        let gender = ''
                        // Use input for a specific gender
                        if (inputLowerCase.includes('f')) gender = 'female'
                        else if (inputLowerCase.includes('m')) gender = 'male'
                        // If missing, flip current or fall back to random.
                        if (gender.length == 0) {
                            if (setting) gender = setting.gender.toLowerCase() == 'male' ? 'female' : 'male'
                            else gender = Utils.randomFromArray(['male', 'female'])
                        }
                        modules.tts.setVoiceForUser(id, gender).then() // This will save the voice setting with the chosen gender.
                        break
                    }
                }
            }
        }
    }

    // endregion
}