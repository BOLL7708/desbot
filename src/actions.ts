class Actions {
    public static async init() {
        Utils.log('=== Registering Triggers for Events ===', Color.DarkGreen)
        for(const [key, event] of Object.entries(Config.events)) {
            if(event.triggers.reward) await this.registerReward(key, event)
            if(event.triggers.command) await this.registerCommand(key, event)
            if(event.triggers.remoteCommand) await this.registerRemoteCommand(key, event)
            if(event.triggers.cheer) await this.registerCheer(key, event)
            if(event.triggers.timer) await this.registerTimer(key, event)
        }
    }

    public static async buildUserDataFromRedemptionMessage(message?: ITwitchPubsubRewardMessage): Promise<IActionUser> {
        const modules = ModulesSingleton.getInstance()
        const id = message?.data?.redemption?.user?.id ?? ''
        return {
            source: EEventSource.TwitchReward,
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
            rewardMessage: message
        }
    }
    public static async buildUserDataFromCheerMessage(message?: ITwitchPubsubCheerMessage): Promise<IActionUser> {
        const modules = ModulesSingleton.getInstance()
        const user = await modules.twitchHelix.getUserByLogin(message?.data?.user_id ?? '')
        const id = user?.id ?? ''
        return {
            source: EEventSource.TwitchCheer,
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
            bitsTotal: message?.data?.total_bits_used ?? 0
        }
    }
    /**
     * Used for programmatic command execution not done by a user.
     * @returns 
     */
    public static async buildEmptyUserData(source: EEventSource): Promise<IActionUser> {
        const modules = ModulesSingleton.getInstance()
        const user = await modules.twitchHelix.getUserByLogin(Config.twitch.channelName)
        return {
            source: source,
            id: user?.id ?? '',
            login: user?.login ?? '',
            name: user?.display_name ?? '',
            input: '',
            color: await modules.twitchHelix.getUserColor(user?.id ?? '') ?? '',
            isBroadcaster: true,
            isModerator: false,
            isVIP: false,
            isSubscriber: false,
            bits: 0,
            bitsTotal: 0
        }
    }

    /*
    .########..########..######...####..######..########.########.########.
    .##.....##.##.......##....##...##..##....##....##....##.......##.....##
    .##.....##.##.......##.........##..##..........##....##.......##.....##
    .########..######...##...####..##...######.....##....######...########.
    .##...##...##.......##....##...##........##....##....##.......##...##..
    .##....##..##.......##....##...##..##....##....##....##.......##....##.
    .##.....##.########..######...####..######.....##....########.##.....##
    */

    public static async registerReward(key: string, event: IEvent) {
        const modules = ModulesSingleton.getInstance()
        const actionCallback = this.buildActionCallback(key, event)
        const reward: ITwitchReward = {
            id: await Utils.getRewardId(key),
            callback: {
                tag: '1',
                description: 'Triggers a predefined reward function',
                call: async (user, index) => {
                    // Prep for incremental reward // TODO: Move this out to above the registration?
                    const rewardConfig = Utils.getEventConfig(key)?.triggers.reward
                    let counter = await Settings.pullSetting<ITwitchRewardCounter>(Settings.TWITCH_REWARD_COUNTERS, 'key', key)
                    if(Array.isArray(rewardConfig) && counter == null) counter = {key: key, count: 0}
                    
                    // Trigger actions, main thing that happens for all rewards
                    actionCallback.call(user, counter?.count)

                    // Switch to the next incremental reward if it has more configs available
                    if(Array.isArray(rewardConfig) && counter != undefined) {                       
                        counter.count++
                        const newRewardConfig = rewardConfig[counter.count]
                        if(newRewardConfig != undefined) {
                            await Settings.pushSetting(Settings.TWITCH_REWARD_COUNTERS, 'key', counter)
                            modules.twitchHelix.updateReward(await Utils.getRewardId(key), newRewardConfig).then()
                        }
                    }
                }
            }
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
            const triggers = Utils.ensureArray<string>(command.entries)
            for(const trigger of triggers) {
                const actionCallback = this.buildActionCallback(trigger, event)
                const useThisCommand = <ITwitchCommandConfig> (
                    command?.cooldown == undefined
                        ? {...event.triggers.command, trigger: trigger, callback: actionCallback}
                        : {...event.triggers.command, trigger: trigger, cooldownCallback: actionCallback}
                )
                modules.twitch.registerCommand(useThisCommand)
            }
        }
    }

    private static async registerRemoteCommand(key: string, event: IEvent) {
        const modules = ModulesSingleton.getInstance()        
        const triggers = key.split('|')
        for(const trigger of triggers) {
            let command = event?.triggers.command
            const actionCallback = this.buildActionCallback(trigger, event)
            const useThisCommand = <ITwitchCommandConfig> (
                command?.cooldown == undefined 
                    ? {...event.triggers.command, trigger: trigger, allowedUsers: Config.twitch.remoteCommandAllowedUsers, callback: actionCallback}
                    : {...event.triggers.command, trigger: trigger, allowedUsers: Config.twitch.remoteCommandAllowedUsers, cooldownCallback: actionCallback}
            )
            modules.twitch.registerRemoteCommand(useThisCommand)
        }
    }

    private static async registerCheer(key: string, event: IEvent) {
        const modules = ModulesSingleton.getInstance()
        const actionCallback = this.buildActionCallback(key, event)
        const cheer: ITwitchCheer = {
            bits: event.triggers.cheer ?? 0,
            callback: {
                tag: 'Cheer',
                description: 'Triggers callbacks on a specific cheer amount',
                call: async (user, index) => {
                    actionCallback.call(user, index)
                }
            }
        }
        if(cheer.bits > 0) {
            modules.twitchPubsub.registerCheer(cheer)
        } else {
            Utils.logWithBold(`Cannot register cheer event for: <${key}>, it might be missing a cheer config.`, 'red')
        }
    }

    private static async registerTimer(key: string, event: IEvent) {
        const actionCallback = this.buildActionCallback(key, event)
        const user = await this.buildEmptyUserData(EEventSource.Timer)
        const config = event.triggers.timer
        let handle: number = -1
        let count = 0
        const times = config?.times ?? 0
        const interval = config?.interval ?? 10
        const delay = Math.max(0, (config?.delay ?? 10) - interval)
        setTimeout(()=>{
            handle = setInterval(()=>{
                actionCallback.call(user)
                count++
                if(times > 0) {
                    if(count >= times) clearInterval(handle)
                }
            }, interval*1000)
        }, delay*1000)
    }

    /*
    .##.....##....###....####.##....##....########..##.....##.####.##.......########..########.########.
    .###...###...##.##....##..###...##....##.....##.##.....##..##..##.......##.....##.##.......##.....##
    .####.####..##...##...##..####..##....##.....##.##.....##..##..##.......##.....##.##.......##.....##
    .##.###.##.##.....##..##..##.##.##....########..##.....##..##..##.......##.....##.######...########.
    .##.....##.#########..##..##..####....##.....##.##.....##..##..##.......##.....##.##.......##...##..
    .##.....##.##.....##..##..##...###....##.....##.##.....##..##..##.......##.....##.##.......##....##.
    .##.....##.##.....##.####.##....##....########...#######..####.########.########..########.##.....##
    */

    private static buildActionCallback(key: string, event: IEvent): IActionCallback {
        /**
         * Handle all the different types of action constructs here.
         * 1. Single setup
         * 2. Multiple setup
         * 3. Single timeline setup
         * 4. Multiple timeline setup
         * 
         * The multiple setups can be set to be all, random, incremental, accumulating or multitier.
         * In the future, possible other alternatives, like leveling up/community challenge.
         * 
         * There will be a settings for the first one in an array to be the default.
         * Other action setups after this will then inherit from the original.
         * This does not work with timelines.
         */
        const nonceTTS = Utils.getNonce('TTS') // Used to reference the TTS finishing before taking a screenshot.
        const timeline = Utils.getTimelineFromActions(event.actions)
        const callbacks: { [ms: number]: IActionCallback } = {}
        for(const [msStr, actions] of Object.entries(timeline)) {
            const ms = parseInt(msStr)
            const stack: IActionAsyncCallback[] = []

            // Build callbacks
            stack.pushIfExists(this.buildTTSCallback(actions?.tts))
            stack.pushIfExists(actions?.custom)
            stack.pushIfExists(Commands.callbacks[key])
            stack.pushIfExists(Rewards.callbacks[key])
            stack.pushIfExists(this.buildOBSCallback(actions?.obs, key))
            stack.pushIfExists(this.buildColorCallback(actions?.lights))
            stack.pushIfExists(this.buildPlugCallback(actions?.plugs))
            stack.pushIfExists(this.buildSoundAndSpeechCallback(
                actions?.audio, 
                actions?.speech,
                nonceTTS, 
                !!(actions?.speech)
            ))
            stack.pushIfExists(this.buildPipeCallback(actions?.pipe))
            stack.pushIfExists(this.buildOpenVR2WSSettingCallback(actions?.openVR2WS))
            stack.pushIfExists(this.buildSignCallback(actions?.sign))
            stack.pushIfExists(this.buildExecCallback(actions?.exec))
            stack.pushIfExists(this.buildWebCallback(actions?.web))
            stack.pushIfExists(this.buildScreenshotCallback(actions?.screenshots, key, nonceTTS))
            stack.pushIfExists(this.buildDiscordMessageCallback(actions?.discord, key))
            stack.pushIfExists(this.buildTwitchChatCallback(actions?.chat))
            stack.pushIfExists(this.buildTwitchWhisperCallback(actions?.whisper))
            stack.pushIfExists(this.buildLabelCallback(actions?.label))
            stack.pushIfExists(this.buildCommandsCallback(actions?.commands))
            stack.pushIfExists(this.buildRemoteCommandCallback(actions?.remoteCommand))
            stack.pushIfExists(this.buildRewardStatesCallback(actions?.rewardStates))

            // Logging
            if(stack.length == 1) {
                Utils.logWithBold(` Built Action Callback for <${key}>: ${stack[0].tag} "${stack[0].description}"`, Color.Green)
            } else {
                Utils.logWithBold(` Built Action Callback for <${key}>: ${stack.map(ac => ac.tag).join(', ')}`, Color.Green)
            }

            // Return callback that triggers all the actions
            callbacks[ms] = {
                tag: '⏲',
                description: `Timeline callback that is called after a certain delay: ${ms}ms`,
                call: async (user: IActionUser, index?: number, msg?: ITwitchPubsubRewardMessage) => {
                    for(const callback of stack) {
                        if(callback.asyncCall) await callback.asyncCall(user, index)
                        if(callback.call) callback.call(user, index)
                    }
                }
            }
        }
        return {
            tag: '🏟',
            description: 'Main callback that triggers all the actions',
            call: async (user: IActionUser, index?: number, msg?: ITwitchPubsubRewardMessage) => {
                for(const [key, callback] of Object.entries(callbacks)) {
                    const ms = parseInt(key)
                    setTimeout(()=>{
                        callback.call(user, index)
                    }, ms)
                }
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

    private static buildOBSCallback(config: IObsAction|IObsAction[]|undefined, key: string): IActionCallback|undefined {
        if(config) return {
            tag: '🎬',
            description: 'Callback that triggers an OBS action',
            call: (user: IActionUser, index?: number) => {
                const singleConfig = Utils.randomOrSpecificFromArray(config, index)
                if(singleConfig) {
                    const modules = ModulesSingleton.getInstance()
                    singleConfig.key = key
                    const state = singleConfig.state ?? true
                    console.log("OBS Reward triggered")
                    modules.obs.toggle(singleConfig, state)
                }
            }
        }
    }

    private static buildColorCallback(config: IPhilipsHueColorAction|IPhilipsHueColorAction[]|undefined): IActionCallback|undefined {
        if(config) return {
            tag: '🎨',
            description: 'Callback that triggers a Philips Hue color action',
            call: () => {
                const modules = ModulesSingleton.getInstance()
                const cfg = Array.isArray(config) ? Utils.randomFromArray(config) : config
                const lights:number[] = Config.philipshue.lightsIds
                lights.forEach(light => {
                    modules.hue.setLightState(light, cfg.x, cfg.y)
                })
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
     * @param onTtsQueue If true the sound effect will be enqueued on the TTS queue, to not play back at the same time.
     * @returns 
     */
    private static buildSoundAndSpeechCallback(config: IAudioAction|undefined, speechConfig:ISpeechAction|undefined, nonce: string, onTtsQueue:boolean = false):IActionCallback|undefined {
        if(config || speechConfig) return {
            tag: '🔊',
            description: 'Callback that triggers a sound and/or speech action',
            call: async (user: IActionUser, index?: number) => {
                const modules = ModulesSingleton.getInstance()
                let ttsString: string|undefined
                if(speechConfig?.entries) {
                    ttsString = <string> Utils.randomOrSpecificFromArray(speechConfig.entries, index)
                    ttsString = await Utils.replaceTagsInText(ttsString, user)
                    onTtsQueue = true
                }
                if(config) { // If we have an audio config, play it. Attach 
                    const configClone = Utils.clone(config)
                    const srcArr = Utils.ensureArray( configClone.src)
                    for(let i = 0; i<srcArr.length; i++) {
                        srcArr[i] = await Utils.replaceTagsInText(srcArr[i], user) // To support audio URLs in input
                    }
                    configClone.src = srcArr
                    if(onTtsQueue) modules.tts.enqueueSoundEffect(configClone)
                    else modules.audioPlayer.enqueueAudio(configClone)
                }
                if(ttsString && speechConfig) await modules.tts.enqueueSpeakSentence(
                    ttsString,
                    await Utils.replaceTagsInText(speechConfig.voiceOfUser ?? Config.twitch.chatbotName, user), 
                    speechConfig.type ?? ETTSType.Announcement,
                    nonce,
                    undefined,
                    undefined,
                    speechConfig?.skipDictionary
                )
            }
        }
    }

    private static buildPipeCallback(config: IPipeAction|IPipeAction[]|undefined): IActionCallback|undefined {
        if(config) return {
            tag: '📺',
            description: 'Callback that triggers an OpenVRNotificationPipe action',
            call: async (user: IActionUser) => {
                /*
                * We check if we don't have enough texts to fill the preset 
                * and fill the empty spots up with the redeemer's display name.
                * Same with image and the avatar of the redeemer.
                */            
                let asyncConfig = Utils.clone(config)
                if(!Array.isArray(asyncConfig)) asyncConfig = [asyncConfig]
                const modules = ModulesSingleton.getInstance()
                for(const cfg of asyncConfig) {
                    const textAreaCount = cfg.config.customProperties?.textAreas?.length ?? 0
                    if(textAreaCount > 0 && cfg.texts == undefined) cfg.texts = []
                    const textCount = cfg.texts?.length ?? 0
                    
                    // If not enough texts for all areas, fill with redeemer's display name.
                    if(textAreaCount > textCount && cfg.texts) {
                        cfg.texts.length = textAreaCount
                        cfg.texts.fill(user.name, textCount, textAreaCount)
                    }
                    
                    // Replace tags in texts.
                    if(cfg.texts) for(let i=0; i<cfg.texts.length; i++) {
                        cfg.texts[i] = await Utils.replaceTagsInText(cfg.texts[i], user)
                    }

                    // If no image is supplied, use the redeemer user image instead.
                    if(cfg.imageData == null && cfg.imagePath == null) {
                        const userData = await modules.twitchHelix.getUserById(parseInt(user.id))
                        cfg.imagePath = userData?.profile_image_url
                    }

                    // Show it
                    modules.pipe.showPreset(cfg).then()
                }
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

    private static buildExecCallback(config: IExecAction|undefined): IActionCallback|undefined {
        if(config) return {
            tag: '🎓',
            description: 'Callback that triggers an Exec action',
            call: async (user: IActionUser) => {
                if(config.run) {
                    Exec.runKeyPressesFromPreset(config.run)
                }
                if(config.uri) {
                    if(Array.isArray(config.uri)) {
                        for(const u of config.uri) {
                            Exec.loadCustomURI(await Utils.replaceTagsInText(u, user))
                        }
                    } else {
                        Exec.loadCustomURI(await Utils.replaceTagsInText(config.uri, user))
                    }
                }
            }
        } 
    }

    private static buildWebCallback(url: string|undefined): IActionCallback|undefined {
        if(url) return {
            tag: '🌐',
            description: 'Callback that triggers a Web action',
            call: () => {
                fetch(url, {mode: 'no-cors'}).then(result => console.log(result))
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

    private static buildDiscordMessageCallback(message: string|string[]|undefined, key: string): IActionCallback|undefined {
        if(message && message.length > 0) return {
            tag: '💬',
            description: 'Callback that triggers a Discord message action',
            call: async (user: IActionUser, index?: number) => {
                const modules = ModulesSingleton.getInstance()
                const userData = await modules.twitchHelix.getUserById(parseInt(user.id))
                Discord.enqueueMessage(
                    Config.credentials.DiscordWebhooks[key],
                    user.name,
                    userData?.profile_image_url,
                    await Utils.replaceTagsInText(Utils.randomOrSpecificFromArray(message, index), user)
                )
            }
        }
    }

    private static buildTwitchChatCallback(message: string|string[]|undefined): IActionCallback|undefined {
        if(message && message.length > 0) return {
            tag: '📄',
            description: 'Callback that triggers a Twitch chat message action',
            call: async (user: IActionUser, index?: number) => {
                const modules = ModulesSingleton.getInstance()
                modules.twitch._twitchChatOut.sendMessageToChannel(
                    await Utils.replaceTagsInText(Utils.randomOrSpecificFromArray(message, index), user)
                )
            }
        }
    }
    private static buildTwitchWhisperCallback(config: IWhisperAction|undefined): IActionCallback|undefined {
        if(config) return {
            tag: '💭',
            description: 'Callback that triggers a Twitch whisper action',
            call: async (user: IActionUser, index?: number) => {
                const modules = ModulesSingleton.getInstance()
                modules.twitch._twitchChatOut.sendMessageToUser(
                    await Utils.replaceTagsInText(config.user, user),
                    await Utils.replaceTagsInText(
                        Utils.randomOrSpecificFromArray(
                            Utils.ensureArray(config.entries), 
                            index
                        ), 
                        user
                    )
                )
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
            call: (user: IActionUser) => {
                const modules = ModulesSingleton.getInstance()
                const interval = config.interval ?? 0
                let delay = 0
                const commands = Utils.ensureArray(config.entries)
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

    private static buildRemoteCommandCallback(commandStr: string|undefined): IActionCallback|undefined {
        if(commandStr && commandStr.length > 0) return {
            tag: '🤝',
            description: 'Callback that triggers a Remote Command action',
            call: () => {
                const modules = ModulesSingleton.getInstance()
                modules.twitch.sendRemoteCommand(commandStr).then()
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

    private static buildTTSCallback(config: ITTSAction|undefined): IActionAsyncCallback|undefined {
        if(config) return {
            tag: '🗣',
            description: 'Callback that executes a TTS function',
            asyncCall: async (user: IActionUser) => {
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
}