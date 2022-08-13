class ActionHandler {
    options: IEventOptions = {}
    actionsEntries: IActions[] = []
    constructor(
        public key: string,
        public event: IEvent
    ) {
        this.options = event.options ?? {}
        this.actionsEntries = Utils.ensureArray(event.actionsEntries)
    }
    actionsMainCallback?: IActionsMainCallback

    public async call(user: IActionUser) {
        const modules = ModulesSingleton.getInstance()
        let index: number|undefined = undefined
        let counter: IEventCounter = {key: this.key, count: 0}
        let rewardConfigs: ITwitchHelixRewardUpdate[] = []
        /*
            Here we handle the different types of behavior of the event.
            This means we often rebuild the full main callback.
            As well as calculate and provide the index for action entries.
         */
        switch(this.options?.behavior) {
            case EBehavior.Random:
                this.actionsMainCallback = Actions.buildActionsMainCallback(this.key, [this.actionsEntries.getRandom() ?? {}])
                break
            case EBehavior.Incrementing:
                // Load incremental counter
                counter = await Settings.pullSetting<IEventCounter>(Settings.EVENT_COUNTERS_INCREMENTAL, 'key', this.key) ?? counter

                // Switch to the next incremental reward if it has more configs available
                rewardConfigs = Utils.ensureArray(this.event.triggers.reward)
                if(rewardConfigs.length > 1) {
                    counter.count++
                    const newRewardConfig = rewardConfigs[counter.count]
                    if (newRewardConfig) {
                        await Settings.pushSetting(Settings.EVENT_COUNTERS_INCREMENTAL, 'key', counter)
                        modules.twitchHelix.updateReward(await Utils.getRewardId(this.key), newRewardConfig).then()
                    }
                }
                // Register index and build callback for this step of the sequence
                index = (counter?.count ?? 1)-1
                this.actionsMainCallback = Actions.buildActionsMainCallback(this.key, Utils.ensureArray(this.event.actionsEntries).getAsType(index))
                break
            case EBehavior.Accumulating:
                // Load accumulating counter
                counter = await Settings.pullSetting<IEventCounter>(Settings.EVENT_COUNTERS_ACCUMULATING, 'key', this.key) ?? counter
                counter.count = parseInt(counter.count.toString()) + Math.max(user.rewardCost, 1) // Without the parse loop, what should be a number can be a string due to coming from PHP. Add 1 for commands.

                // Switch to the next incremental reward if it has more configs available
                rewardConfigs = Utils.ensureArray(this.event.triggers.reward)
                let rewardIndex = 0
                if(rewardConfigs.length >= 3 && counter.count >= (this.options.accumulationGoal ?? 0)) {
                    // Final reward (when goal has been reached)
                    index = 1
                    rewardIndex = 2
                } else if(rewardConfigs.length >= 2) {
                    // Intermediate reward (before reaching goal)
                    rewardIndex = 1
                }
                if(rewardIndex > 0) { // Update reward
                    const newRewardConfigClone = Utils.clone(rewardConfigs[rewardIndex])
                    if (newRewardConfigClone) {
                        await Settings.pushSetting(Settings.EVENT_COUNTERS_ACCUMULATING, 'key', counter)
                        newRewardConfigClone.title = await Utils.replaceTagsInText(newRewardConfigClone.title, user)
                        newRewardConfigClone.prompt = await Utils.replaceTagsInText(newRewardConfigClone.prompt, user)
                        modules.twitchHelix.updateReward(await Utils.getRewardId(this.key), newRewardConfigClone).then()
                    }
                }
                // Register index and build callback for this step of the sequence
                this.actionsMainCallback = Actions.buildActionsMainCallback(this.key, Utils.ensureArray(this.event.actionsEntries).getAsType(index))
                break
            default: // No special behavior, only generate the callback if it is missing
                if(!this.actionsMainCallback) this.actionsMainCallback = Actions.buildActionsMainCallback(this.key, Utils.ensureArray(this.event.actionsEntries))
                break
        }
        if(this.actionsMainCallback) this.actionsMainCallback(user, index) // Index is included here to supply it to entries-handling
        else console.warn(`Event with key "${this.key}" was not handled properly, as no callback was set, behavior: ${this.options?.behavior}`)
    }
}
class Actions {
    public static async init() {
        Utils.log('=== Registering Triggers for Events ===', Color.DarkGreen)
        for(const [key, event] of Object.entries(Config.events)) {
            if(event.triggers.reward) await this.registerReward(key, event)
            if(event.triggers.command) await this.registerCommand(key, event)
            if(event.triggers.remoteCommand) await this.registerRemoteCommand(key, event)
            if(event.triggers.cheer) await this.registerCheer(key, event)
            if(event.triggers.timer) await this.registerTimer(key, event)
            if(event.triggers.relay) await this.registerRelay(key, event)
        }
    }

    // region User Data Builders
    public static async buildUserDataFromRedemptionMessage(key: string, message?: ITwitchPubsubRewardMessage): Promise<IActionUser> {
        const modules = ModulesSingleton.getInstance()
        const id = message?.data?.redemption?.user?.id ?? ''
        return {
            source: EEventSource.TwitchReward,
            eventKey: key,
            id: id,
            login: message?.data?.redemption?.user?.login ?? '',
            name: message?.data?.redemption?.user?.display_name ?? '',
            input: message?.data?.redemption?.user_input ?? '',
            color: await modules.twitchHelix.getUserColor(id) ?? '',
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
    public static async buildUserDataFromCheerMessage(key: string, message?: ITwitchPubsubCheerMessage): Promise<IActionUser> {
        const modules = ModulesSingleton.getInstance()
        const user = await modules.twitchHelix.getUserByLogin(message?.data?.user_id ?? '')
        const id = user?.id ?? ''
        return {
            source: EEventSource.TwitchCheer,
            eventKey: key,
            id: id,
            login: user?.login ?? '',
            name: user?.display_name ?? '',
            input: message?.data?.chat_message ?? '',
            color: await modules.twitchHelix.getUserColor(id) ?? '',
            isBroadcaster: false,
            isModerator: false,
            isVIP: false,
            isSubscriber: false,
            bits: message?.data?.bits_used ?? 0,
            bitsTotal: message?.data?.total_bits_used ?? 0,
            rewardCost: 0
        }
    }
    /**
     * Used for programmatic command execution not done by an actual user.
     * @returns 
     */
    public static async buildEmptyUserData(source: EEventSource, userName?: string, userInput?: string): Promise<IActionUser> {
        const modules = ModulesSingleton.getInstance()
        const user = await modules.twitchHelix.getUserByLogin(userName ?? Config.twitch.channelName)
        return {
            source: source,
            eventKey: '',
            id: user?.id ?? '',
            login: user?.login ?? '',
            name: user?.display_name ?? '',
            input: userInput ?? '',
            color: await modules.twitchHelix.getUserColor(user?.id ?? '') ?? '',
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

    /*
    .########..########..######...####..######..########.########.########.
    .##.....##.##.......##....##...##..##....##....##....##.......##.....##
    .##.....##.##.......##.........##..##..........##....##.......##.....##
    .########..######...##...####..##...######.....##....######...########.
    .##...##...##.......##....##...##........##....##....##.......##...##..
    .##....##..##.......##....##...##..##....##....##....##.......##....##.
    .##.....##.########..######...####..######.....##....########.##.....##
    */


    // region Trigger Registration
    public static async registerReward(key: string, event: IEvent) {
        const modules = ModulesSingleton.getInstance()
        const actionHandler = new ActionHandler(key, event)
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

    private static async registerCommand(key: string, event: IEvent) {
        const modules = ModulesSingleton.getInstance()
        let command = event?.triggers.command
        if(command) {
            const triggers = Utils.ensureArray(command.entries)
            for(let trigger of triggers) {
                trigger = Utils.replaceTags(trigger, {eventKey: key})
                const actionHandler = new ActionHandler(key, event)
                const useThisCommand = <ITwitchCommandConfig> (
                    command?.cooldown == undefined
                        ? {...event.triggers.command, trigger: trigger, handler: actionHandler}
                        : {...event.triggers.command, trigger: trigger, cooldownHandler: actionHandler}
                )
                modules.twitch.registerCommand(useThisCommand)
            }
        }
    }

    private static async registerRemoteCommand(key: string, event: IEvent) {
        const modules = ModulesSingleton.getInstance()        
        const remoteCommand = event?.triggers.remoteCommand
        if(remoteCommand) {
            const triggers = Utils.ensureArray(remoteCommand.entries)
            for(let trigger of triggers) {
                trigger = Utils.replaceTags(trigger, {eventKey: key})
                let command = event?.triggers.command
                const actionHandler = new ActionHandler(trigger, event)
                const useThisCommand = <ITwitchCommandConfig> (
                    command?.cooldown == undefined
                        ? {...event.triggers.command, trigger: trigger, allowedUsers: Config.twitch.remoteCommandAllowedUsers, handler: actionHandler}
                        : {...event.triggers.command, trigger: trigger, allowedUsers: Config.twitch.remoteCommandAllowedUsers, cooldownHandler: actionHandler}
                )
                modules.twitch.registerRemoteCommand(useThisCommand)
            }
        }
    }

    private static async registerCheer(key: string, event: IEvent) {
        const modules = ModulesSingleton.getInstance()
        const actionHandler = new ActionHandler(key, event)
        const cheer: ITwitchCheer = {
            bits: event.triggers.cheer ?? 0,
            handler: actionHandler
        }
        if(cheer.bits > 0) {
            modules.twitchPubsub.registerCheer(cheer)
        } else {
            Utils.logWithBold(`Cannot register cheer event for: <${key}>, it might be missing a cheer config.`, 'red')
        }
    }

    private static async registerTimer(key: string, event: IEvent) {
        const actionHandler = new ActionHandler(key, event)
        const user = await this.buildEmptyUserData(EEventSource.Timer)
        const config = event.triggers.timer
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

    private static async registerRelay(key: string, event: IEvent) {
        const relay: IOpenVR2WSRelay = {
            key: Utils.replaceTags(event.triggers.relay ?? '', {eventKey: key}),
            handler: new ActionHandler(key, event)
        }
        if(relay.key.length > 0) {
            Callbacks.registerRelay(relay)
        } else {
            Utils.logWithBold(`Cannot register relay event for: <${key}>, it might be missing a relay config.`, 'red')
        }
    }
    // endregion

    /*
    .##.....##....###....####.##....##....########..##.....##.####.##.......########..########.########.
    .###...###...##.##....##..###...##....##.....##.##.....##..##..##.......##.....##.##.......##.....##
    .####.####..##...##...##..####..##....##.....##.##.....##..##..##.......##.....##.##.......##.....##
    .##.###.##.##.....##..##..##.##.##....########..##.....##..##..##.......##.....##.######...########.
    .##.....##.#########..##..##..####....##.....##.##.....##..##..##.......##.....##.##.......##...##..
    .##.....##.##.....##..##..##...###....##.....##.##.....##..##..##.......##.....##.##.......##....##.
    .##.....##.##.....##.####.##....##....########...#######..####.########.########..########.##.....##
    */

    public static buildActionsMainCallback(key: string, actionsArr: IActions[]): IActionsMainCallback {
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
            actionCallbacks.pushIfExists(Commands.callbacks[key])
            actionCallbacks.pushIfExists(Rewards.callbacks[key])
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
            actionCallbacks.pushIfExists(this.buildOpenVR2WSSettingCallback(actions?.openVR2WS))
            actionCallbacks.pushIfExists(this.buildSignCallback(actions?.sign))
            actionCallbacks.pushIfExists(this.buildKeysCallback(actions?.keys))
            actionCallbacks.pushIfExists(this.buildURICallback(actions?.uri))
            actionCallbacks.pushIfExists(this.buildWebCallback(actions?.web))
            actionCallbacks.pushIfExists(this.buildScreenshotCallback(actions?.screenshots, key, nonceTTS))
            actionCallbacks.pushIfExists(this.buildDiscordMessageCallback(actions?.discord, key))
            actionCallbacks.pushIfExists(this.buildTwitchChatCallback(actions?.chat))
            actionCallbacks.pushIfExists(this.buildTwitchWhisperCallback(actions?.whisper))
            actionCallbacks.pushIfExists(this.buildLabelCallback(actions?.label))
            actionCallbacks.pushIfExists(this.buildCommandsCallback(actions?.commands))
            actionCallbacks.pushIfExists(this.buildRemoteCommandCallback(actions?.remoteCommand))
            actionCallbacks.pushIfExists(this.buildRewardStatesCallback(actions?.rewardStates))

            // Logging
            if(actionCallbacks.length == 1) {
                Utils.logWithBold(` Built Action Callback for <${key}>: ${actionCallbacks[0].tag} "${actionCallbacks[0].description}"`, Color.Green)
            } else {
                Utils.logWithBold(` Built Action Callback for <${key}>: ${actionCallbacks.map(ac => ac.tag).join(', ')}`, Color.Green)
            }

            // Push item with callback that triggers all the actions generated.
            actionsExecutors.push({
                timeMs: actions._timeMs,
                delayMs: actions._delayMs,
                execute: async (user: IActionUser, index?: number) => {
                    for (const stackCallback of actionCallbacks) {
                        if (stackCallback.call) stackCallback.call(user, index)
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

    /*
    .########..##.....##.####.##.......########..########.########...######.
    .##.....##.##.....##..##..##.......##.....##.##.......##.....##.##....##
    .##.....##.##.....##..##..##.......##.....##.##.......##.....##.##......
    .########..##.....##..##..##.......##.....##.######...########...######.
    .##.....##.##.....##..##..##.......##.....##.##.......##...##.........##
    .##.....##.##.....##..##..##.......##.....##.##.......##....##..##....##
    .########...#######..####.########.########..########.##.....##..######.
    */

    // region Action Builders
    private static buildOBSCallback(config: IObsAction|undefined, key: string): IActionCallback|undefined {
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
                        Utils.ensureArray(configClone.srcEntries).getAsType(index),
                        user
                    )
                    if(onTtsQueue) modules.tts.enqueueSoundEffect(configClone)
                    else modules.audioPlayer.enqueueAudio(configClone)
                }
                if(speechConfig && ttsStrings.length > 0) {
                    for(const ttsStr of ttsStrings) {
                        await modules.tts.enqueueSpeakSentence(
                            ttsStr,
                            await Utils.replaceTagsInText(speechConfig.voiceOfUser ?? Config.twitch.chatbotName, user),
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

    private static buildOpenVR2WSSettingCallback(config: IOpenVR2WSSetting|IOpenVR2WSSetting[]|undefined): IActionCallback|undefined {
        if(config) return {
            tag: '🔧',
            description: 'Callback that triggers an OpenVR2WSSetting action',
            call: () => {
                const modules = ModulesSingleton.getInstance()
                modules.openvr2ws.setSetting(config).then()
            }
        }
    }

    private static buildSignCallback(config: ISignAction|undefined): IActionCallback|undefined {
        if(config) return {
            tag: '🚦',
            description: 'Callback that triggers a Sign action',
            call: (user: IActionUser) => {
                const modules = ModulesSingleton.getInstance()
                modules.twitchHelix.getUserById(parseInt(user.id)).then(async userData => {
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

    private static buildKeysCallback(config: IPressKeysAction|undefined): IActionCallback|undefined {
        if(config) return {
            tag: '🎓',
            description: 'Callback that triggers an Exec action',
            call: async () => {
                Exec.runKeyPressesFromPreset(config)
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
                    Exec.loadCustomURI(await Utils.replaceTagsInText(entry, user))
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

    private static buildScreenshotCallback(config: IScreenshotAction|undefined, key: string, nonce: string): IActionCallback|undefined {
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

    private static buildDiscordMessageCallback(config: IEntriesAction|undefined, key: string): IActionCallback|undefined {
        if(config) return {
            tag: '💬',
            description: 'Callback that triggers a Discord message action',
            call: async (user: IActionUser, index?: number) => {
                const modules = ModulesSingleton.getInstance()
                const userData = await modules.twitchHelix.getUserById(parseInt(user.id))
                const entries = Utils.ensureArray(config.entries).getAsType(index)
                for(const entry of entries ) {
                    Discord.enqueueMessage(
                        Config.credentials.DiscordWebhooks[key],
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
                    Settings.appendSetting(config.fileName, await Utils.replaceTagsInText(config.text, user)).then()
                } else {
                    Settings.pushLabel(config.fileName, await Utils.replaceTagsInText(config.text, user)).then()
                }
            }
        }
    }

    private static buildCommandsCallback(config: ICommandAction|undefined): IActionCallback|undefined {
        if(config) return {
            tag: '🖐',
            description: 'Callback that triggers a Commands action',
            call: (user, index) => {
                const modules = ModulesSingleton.getInstance()
                const interval = config.interval ?? 0
                let delay = 0
                const commands = Utils.ensureArray(config.entries).getAsType(index)
                for(const command of commands) {
                    console.log(`Executing command: ${command} in ${delay} seconds...`)
                    let inputText = user.input
                    if(command.includes(' ')) inputText = Utils.splitOnFirst(' ', inputText)[0]
                    setTimeout(()=>{
                        modules.twitch.runCommand(command, {...user, input: inputText}).then()
                    }, delay*1000)
                    delay += interval
                }
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

    private static buildRewardStatesCallback(config: IRewardStatesAction|undefined): IActionCallback|undefined {
        if(config) return {
            tag: '⏯',
            description: 'Callback that triggers a Reward States action',
            call: async () => {
                const modules = ModulesSingleton.getInstance()
                
                // Change the overrides to make this persistent this session.
                for(const [key, state] of Object.entries(config)) {
                    const on = Config.twitch.alwaysOnRewards
                    const off = Config.twitch.alwaysOffRewards
                    if(state) {
                        if(!on.includes(key)) on.push(key)
                        if(off.includes(key)) delete off[off.indexOf(key)]
                    } else {
                        if(!off.includes(key)) off.push(key)
                        if(on.includes(key)) delete on[on.indexOf(key)]
                    }
                }
                
                // Toggle the reward(s) on Twitch
                await modules.twitchHelix.toggleRewards(config)
            }
        }
    }

    private static buildTTSCallback(config: ITTSAction|undefined): IActionCallback|undefined {
        if(config) return {
            tag: '🗣',
            description: 'Callback that executes a TTS function',
            call: async (user: IActionUser) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                const input = await Utils.replaceTagsInText(config.inputOverride ?? user.input, user)
                const inputLowerCase = input.toLowerCase()
                const targetLogin = await Utils.replaceTagsInText('%targetLogin', user)
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
                    case ETTSFunction.SetUserEnabled:
                        if(targetLogin.length == 0) break
                        Settings.pushSetting(Settings.TTS_BLACKLIST, 'userName', { userName: targetLogin, active: false, reason: userInputRest }).then()
                        break
                    case ETTSFunction.SetUserDisabled:
                        if(targetLogin.length == 0) break
                        Settings.pushSetting(Settings.TTS_BLACKLIST, 'userName', { userName: targetLogin, active: true, reason: userInputRest }).then()
                        break
                    case ETTSFunction.SetUserNick:
                        let setUserNickLogin = targetOrUserLogin // We can change nick for us or someone else by default
                        if(user.source == EEventSource.TwitchReward) { // Except rewards, because they are publicly available
                            setUserNickLogin = user.login
                        }
                        const isSettingNickOfOther = user.login !== setUserNickLogin
                        const setNickNewName = userInputNoTags

                        // Cancel if the user does not actually exist on Twitch
                        const setNickUserData = await modules.twitchHelix.getUserByLogin(setUserNickLogin)
                        if(!setNickUserData) return Utils.log(`TTS Nick: User "${setUserNickLogin}" does not exist.`, Color.Red)

                        if(
                            setUserNickLogin.length && setNickNewName.length
                            && (canSetThingsForOthers || (isSettingNickOfOther == canSetThingsForOthers))
                        ) {
                            // We rename the user
                            states.textTagCache.lastTTSSetNickLogin = setUserNickLogin
                            states.textTagCache.lastTTSSetNickSubstitute = setNickNewName
                            const setting = <IUserName> {userName: setUserNickLogin, shortName: setNickNewName, editor: user.login, datetime: Utils.getISOTimestamp()}
                            await Settings.pushSetting(Settings.TTS_USER_NAMES, 'userName', setting)
                        } else {
                            // We do nothing
                            states.textTagCache.lastTTSSetNickLogin =
                            states.textTagCache.lastTTSSetNickSubstitute = ''
                        }
                        break
                    case ETTSFunction.GetUserNick:
                        const getNickUserData = await modules.twitchHelix.getUserByLogin(targetOrUserLogin)
                        if(getNickUserData && getNickUserData.login.length) {
                            const currentName = await Settings.pullSetting<IUserName>(Settings.TTS_USER_NAMES, 'userName', getNickUserData.login)
                            if(currentName) {
                                states.textTagCache.lastTTSSetNickLogin = currentName.userName
                                states.textTagCache.lastTTSSetNickSubstitute = currentName.shortName
                            } else {
                                states.textTagCache.lastTTSSetNickLogin = getNickUserData.login
                                states.textTagCache.lastTTSSetNickSubstitute = ''
                            }
                        }
                        break
                    case ETTSFunction.ClearUserNick:
                        let clearUserNickLogin = targetOrUserLogin // We can change nick for us or someone else by default
                        if(user.source == EEventSource.TwitchReward) { // Except rewards, because they are publicly available
                            clearUserNickLogin = user.login
                        }
                        const isClearingNickOfOther = user.login !== clearUserNickLogin
                        if(
                            clearUserNickLogin.length
                            && (canSetThingsForOthers || (isClearingNickOfOther == canSetThingsForOthers))
                        ) {
                            // We clear the custom nick for the user, setting it to a clean one.
                            const cleanName = Utils.cleanName(clearUserNickLogin)
                            states.textTagCache.lastTTSSetNickLogin = clearUserNickLogin
                            states.textTagCache.lastTTSSetNickSubstitute = cleanName
                            const setting = <IUserName> {userName: clearUserNickLogin, shortName: cleanName, editor: user.login, datetime: Utils.getISOTimestamp()}
                            await Settings.pushSetting(Settings.TTS_USER_NAMES, 'userName', setting)
                        }
                        break
                    case ETTSFunction.SetUserVoice:
                        let setUserVoiceLogin = targetOrUserLogin // We can change voice for us or someone else by default
                        if(user.source == EEventSource.TwitchReward) { // Except rewards, because they are publicly available
                            setUserVoiceLogin = user.login
                        }
                        const isSettingVoiceOfOther = user.login !== setUserVoiceLogin
                        if(
                            setUserVoiceLogin.length && userInputNoTags.length
                            && (canSetThingsForOthers || (isSettingVoiceOfOther == canSetThingsForOthers))
                        ) {
                            await modules.tts.setVoiceForUser(setUserVoiceLogin, userInputNoTags)
                        }
                        break
                    case ETTSFunction.SetDictionaryEntry:
                        const dicWord = userInputHead.trim().toLowerCase()
                        const dicSubstitute = Utils.cleanSetting(userInputRest).toLowerCase()
                        const setDictionaryEntry = <IDictionaryEntry> {
                            original: dicWord,
                            substitute: dicSubstitute,
                            editor: user.login,
                            datetime: Utils.getISOTimestamp()
                        }
                        states.textTagCache.lastDictionaryWord = dicWord
                        states.textTagCache.lastDictionarySubstitute = dicSubstitute
                        // Set substitute for word
                        if(dicWord.length && dicSubstitute.length) {
                            await Settings.pushSetting(Settings.TTS_DICTIONARY, 'original', setDictionaryEntry)
                        }
                        // Clearing a word by setting it to itself
                        else if(dicWord.length) {
                            setDictionaryEntry.substitute = dicWord
                            states.textTagCache.lastDictionarySubstitute = dicWord
                            await Settings.pushSetting(Settings.TTS_DICTIONARY, 'original', setDictionaryEntry)
                        }
                        modules.tts.setDictionary(<IDictionaryEntry[]> Settings.getFullSettings(Settings.TTS_DICTIONARY))
                        break
                    case ETTSFunction.GetDictionaryEntry:
                        const getDicWord = userInputHead.trim().toLowerCase()
                        const getDicEntry = await Settings.pullSetting<IDictionaryEntry>(Settings.TTS_DICTIONARY, 'original', getDicWord)
                        if(getDicEntry) {
                            states.textTagCache.lastDictionaryWord = getDicEntry.original
                            states.textTagCache.lastDictionarySubstitute = getDicEntry.substitute
                        } else {
                            states.textTagCache.lastDictionaryWord = getDicWord
                            states.textTagCache.lastDictionarySubstitute = ''
                        }
                        break
                    case ETTSFunction.SetUserGender:
                        let setUserGenderLogin = targetOrUserLogin // We can change gender for us or someone else by default
                        if(user.source == EEventSource.TwitchReward) { // Except rewards, because they are publicly available
                            setUserGenderLogin = user.login
                        }
                        const voiceSetting = await Settings.pullSetting<IUserVoice>(Settings.TTS_USER_VOICES, 'userName', setUserGenderLogin)
                        let gender = ''
                        // Use input for a specific gender
                        if(inputLowerCase.includes('f')) gender = 'female'
                        else if(inputLowerCase.includes('m')) gender = 'male'
                        // If missing, flip current or fall back to random.
                        if(gender.length == 0) {
                            if(voiceSetting) gender = voiceSetting.gender.toLowerCase() == 'male' ? 'female' : 'male'
                            else gender = Utils.randomFromArray(['male', 'female'])
                        }
                        modules.tts.setVoiceForUser(setUserGenderLogin, gender).then()
                        break
                }
            }
        }
    }

    // endregion
}