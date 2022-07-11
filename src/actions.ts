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

    public static userDataFromRedemptionMessage(message?: ITwitchPubsubRewardMessage): IActionUser {
        return {
            id: message?.data?.redemption?.user?.id ?? '',
            login: message?.data?.redemption?.user?.login ?? '',
            name: message?.data?.redemption?.user?.display_name ?? '',
            input: message?.data?.redemption?.user_input ?? '',
            color: '',
            isBroadcaster: false,
            isModerator: false,
            isVIP: false,
            isSubscriber: false,
            bits: 0,
            bitsTotal: 0
        }
    }
    public static async userDataFromCheerMessage(message?: ITwitchPubsubCheerMessage): Promise<IActionUser> {
        const modules = ModulesSingleton.getInstance()
        const user = await modules.twitchHelix.getUserByLogin(message?.data?.user_id ?? '')
        return {
            id: user?.id ?? '',
            login: user?.login ?? '',
            name: user?.display_name ?? '',
            input: message?.data?.chat_message ?? '',
            color: '',
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
    public static async getEmptyUserDataForCommands(): Promise<IActionUser> {
        const modules = ModulesSingleton.getInstance()
        const user = await modules.twitchHelix.getUserByLogin(Config.twitch.channelName)
        return {
            id: user?.id ?? '',
            login: user?.login ?? '',
            name: user?.display_name ?? '',
            input: '',
            color: '',
            isBroadcaster: true,
            isModerator: false,
            isVIP: false,
            isSubscriber: false,
            bits: 0,
            bitsTotal: 0
        }
    }

    public static async registerReward(key: string, event: IEvent) {
        const modules = ModulesSingleton.getInstance()
        const actionCallback = this.buildActionCallback(key, event)
        const reward: ITwitchReward = {
            id: await Utils.getRewardId(key),
            callback: async (user, index, msg) => {
                // Prep for incremental reward // TODO: Move this out to above the registration?
                const rewardConfig = Utils.getEventConfig(key)?.triggers.reward
                let counter = await Settings.pullSetting<ITwitchRewardCounter>(Settings.TWITCH_REWARD_COUNTERS, 'key', key)
                if(Array.isArray(rewardConfig) && counter == null) counter = {key: key, count: 0}
                
                // Trigger actions, main thing that happens for all rewards
                actionCallback(user, counter?.count, msg)

                // Switch to the next incremental reward if it has more configs available
                if(Array.isArray(rewardConfig) && counter != undefined) {                       
                    counter.count++
                    const newRewardConfig = rewardConfig[counter.count]
                    if(newRewardConfig != undefined) {
                        await Settings.pushSetting(Settings.TWITCH_REWARD_COUNTERS, 'key', counter)
                        modules.twitchHelix.updateReward(await Utils.getRewardId(key), newRewardConfig)
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

    public static async registerCommand(key: string, event: IEvent) {
        const modules = ModulesSingleton.getInstance()
        const triggers = key.split('|')
        for(const trigger of triggers) {
            let command = event?.triggers.command
            const actionCallback = this.buildActionCallback(trigger, event)
            const useThisCommand = <ITwitchCommandConfig> (
                command?.cooldown == undefined 
                    ? {...event.triggers.command, trigger: trigger, callback: actionCallback}
                    : {...event.triggers.command, trigger: trigger, cooldownCallback: actionCallback}
            )
            modules.twitch.registerCommand(useThisCommand)
        }
    }

    public static async registerRemoteCommand(key: string, event: IEvent) {
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

    public static async registerCheer(key: string, event: IEvent) {
        const modules = ModulesSingleton.getInstance()
        const actionCallback = this.buildActionCallback(key, event)
        const cheer: ITwitchCheer = {
            bits: event.triggers.cheer ?? 0,
            callback: async (user, index, msg) => {
                actionCallback(user, index, msg)
            }
        }
        if(cheer.bits > 0) {
            modules.twitchPubsub.registerCheer(cheer)
        } else {
            Utils.logWithBold(`Cannot register cheer event for: <${key}>, it might be missing a cheer config.`, 'red')
        }
    }

    public static async registerTimer(key: string, event: IEvent) {
        const actionCallback = this.buildActionCallback(key, event)
        const user = await this.getEmptyUserDataForCommands()
        const config = event.triggers.timer
        let handle: number = -1
        let count = 0
        const times = config?.times ?? 0
        const interval = config?.interval ?? 10
        const delay = Math.max(0, (config?.delay ?? 10) - interval)
        setTimeout(()=>{
            handle = setInterval(()=>{
                actionCallback(user)
                count++
                if(times > 0) {
                    if(count >= times) clearInterval(handle)
                }
            }, interval*1000)
        }, delay*1000)
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

    private static buildActionCallback(key: string, event: IEvent): ITwitchActionCallback {
        const nonceTTS = Utils.getNonce('TTS') // Used to reference the TTS finishing before taking a screenshot.
        const timeline = Utils.getTimelineFromActions(event.actions)
        const callbacks: { [ms: number]: ITwitchActionCallback } = {}
        for(const [msStr, actions] of Object.entries(timeline)) {
            const ms = parseInt(msStr)

            // Build callbacks
            const commandCallback = Commands.callbacks[key]
            const rewardCallback = Rewards.callbacks[key]
            const obsCallback = this.buildOBSCallback(actions?.obs, key)
            const colorCallback = this.buildColorCallback(actions?.lights)
            const plugCallback = this.buildPlugCallback(actions?.plugs)
            const soundCallback = this.buildSoundAndSpeechCallback(
                actions?.audio, 
                actions?.speech,
                nonceTTS, 
                !!(actions?.speech)
            )
            const pipeCallback = this.buildPipeCallback(actions?.pipe)
            const openvr2wsSettingCallback = this.buildOpenVR2WSSettingCallback(actions?.openVR2WS)
            const signCallback = this.buildSignCallback(actions?.sign)
            const execCallback = this.buildExecCallback(actions?.exec)
            const webCallback = this.buildWebCallback(actions?.web)
            const screenshotCallback = this.buildScreenshotCallback(actions?.screenshots, key, nonceTTS)
            const discordMessageCallback = this.buildDiscordMessageCallback(actions?.discord, key)
            const twitchChatCallback = this.buildTwitchChatCallback(actions?.chat)
            const twitchWhisperCallback = this.buildTwitchWhisperCallback(actions?.whisper)
            const labelCallback = this.buildLabelCallback(actions?.label)
            const commandsCallback = this.buildCommandsCallback(actions?.commands)
            const remoteCommandCallback = this.buildRemoteCommandCallback(actions?.remoteCommand)
            const rewardStatesCallback = this.buildRewardStatesCallback(actions?.rewardStates)

            // Log result
            Utils.logWithBold(
                ` Built Action Callback: `
                    +(commandCallback?'☝':'')
                    +(rewardCallback?'🏆':'')
                    +(obsCallback?'🎬':'')
                    +(colorCallback?'🎨':'')
                    +(plugCallback?'🔌':'')
                    +(soundCallback?'🔊':'')
                    +(pipeCallback?'📺':'')
                    +(openvr2wsSettingCallback?'🔧':'')
                    +(execCallback?'🎓':'')
                    +(webCallback?'🌐':'')
                    +(screenshotCallback?'📷':'')
                    +(discordMessageCallback?'💬':'')
                    +(twitchChatCallback?'📄':'')
                    +(twitchWhisperCallback?'💭':'')
                    +(labelCallback?'🏷':'')
                    +(commandsCallback?'🖐':'')
                    +(remoteCommandCallback?'🤝':'')
                    +(rewardStatesCallback?'⏯':'')
                    +`: ${key}`, 
                Color.Green
            )
            

            // Return callback that triggers all the actions
            callbacks[ms] = async (user: IActionUser, index?: number, msg?: ITwitchPubsubRewardMessage) => {
                if(commandCallback) commandCallback(user, index)
                if(rewardCallback) rewardCallback(user, index, msg)
                if(obsCallback) obsCallback(user, index)
                if(colorCallback) colorCallback(user)
                if(plugCallback) plugCallback(user)
                if(soundCallback) soundCallback(user, index)
                if(pipeCallback) pipeCallback(user)
                if(openvr2wsSettingCallback) openvr2wsSettingCallback(user)
                if(signCallback) signCallback(user)
                if(execCallback) execCallback(user)
                if(webCallback) webCallback(user)
                if(screenshotCallback) screenshotCallback(user)
                if(discordMessageCallback) discordMessageCallback(user, index)
                if(twitchChatCallback) twitchChatCallback(user, index)
                if(twitchWhisperCallback) twitchWhisperCallback(user, index)
                if(labelCallback) labelCallback(user)
                if(commandsCallback) commandsCallback(user)
                if(remoteCommandCallback) remoteCommandCallback(user)
                if(rewardStatesCallback) rewardStatesCallback(user)
            }
        }
        return async (user: IActionUser, index?: number, msg?: ITwitchPubsubRewardMessage) => {
            for(const [key, callback] of Object.entries(callbacks)) {
                const ms = parseInt(key)
                setTimeout(()=>{
                    callback(user, index, msg)
                }, ms)
            }
        }
    }

    public static buildOBSCallback(config: IObsSourceConfig|IObsSourceConfig[]|undefined, key: string): ITwitchActionCallback|undefined {
        if(config) return (user: IActionUser, index?: number) => {
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

    public static buildColorCallback(config: IPhilipsHueColorConfig|IPhilipsHueColorConfig[]|undefined): ITwitchActionCallback|undefined {
        if(config) return (user: IActionUser) => {
            const modules = ModulesSingleton.getInstance()
            const cfg = Array.isArray(config) ? Utils.randomFromArray(config) : config
            const userName = user.login
            modules.tts.enqueueSpeakSentence('changed the color', userName, TTSType.Action)
            const lights:number[] = Config.philipshue.lightsIds
            lights.forEach(light => {
                modules.hue.setLightState(light, cfg.x, cfg.y)
            })
        }
    }

    public static buildPlugCallback(config: IPhilipsHuePlugConfig|undefined): ITwitchActionCallback|undefined {
        if(config) return (user: IActionUser) => {
            const modules = ModulesSingleton.getInstance()
            modules.hue.runPlugConfig(config)
        }
    }
    
    /**
     * Will play back a sound and/or speak.
     * @param config The config for the sound effect to be played.
     * @param speech What to be spoken, if TTS is enabled.
     * @param onTtsQueue If true the sound effect will be enqueued on the TTS queue, to not play back at the same time.
     * @returns 
     */
    public static buildSoundAndSpeechCallback(config: IAudio|undefined, speechConfig:ISpeechConfig|undefined, nonce: string, onTtsQueue:boolean = false):ITwitchActionCallback|undefined {
        if(config || speechConfig) return async (user: IActionUser, index?: number) => {
            const modules = ModulesSingleton.getInstance()
            let ttsString: string|undefined
            if(speechConfig && (Array.isArray(speechConfig.entries) || typeof speechConfig.entries == 'string')) {
                ttsString = <string> Utils.randomOrSpecificFromArray(speechConfig.entries, index)
                ttsString = await Utils.replaceTagsInText(ttsString, user)
                onTtsQueue = true
            }
            if(config) { // If we have an audio config, play it. Attach 
                const configClone = Utils.clone(config)
                const srcArr = Utils.ensureArray( configClone.src)
                for(let i in srcArr) {
                    srcArr[i] = await Utils.replaceTagsInText(srcArr[i], user) // To support audio URLs in input
                }
                configClone.src = srcArr
                if(onTtsQueue) modules.tts.enqueueSoundEffect(configClone)
                else modules.audioPlayer.enqueueAudio(configClone)
            }
            if(ttsString && speechConfig) modules.tts.enqueueSpeakSentence(
                ttsString,
                await Utils.replaceTagsInText(speechConfig.voiceOfUser ?? Config.twitch.chatbotName, user), 
                speechConfig.type ?? TTSType.Announcement, 
                nonce
            )
        }
    }

    public static buildPipeCallback(config: IPipeMessagePreset|IPipeMessagePreset[]|undefined): ITwitchActionCallback|undefined {
        if(config) return async (user: IActionUser) => {
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
                if(cfg.texts) for(const t in cfg.texts) {
                    cfg.texts[t] = await Utils.replaceTagsInText(cfg.texts[t], user)
                }

                // If no image is supplied, use the redeemer user image instead.
                if(cfg.imageData == null && cfg.imagePath == null) {
                    const userData = await modules.twitchHelix.getUserById(parseInt(user.id))
                    cfg.imagePath = userData?.profile_image_url
                }

                // Show it
                modules.pipe.showPreset(cfg)
            }
        }
    }

    public static buildOpenVR2WSSettingCallback(config: IOpenVR2WSSetting|IOpenVR2WSSetting[]|undefined): ITwitchActionCallback|undefined {
        if(config) return (user: IActionUser) => {
            const modules = ModulesSingleton.getInstance()
            modules.openvr2ws.setSetting(config)
        }
    }

    public static buildSignCallback(config: ISignShowConfig|undefined): ITwitchActionCallback|undefined {
        if(config) return (user: IActionUser) => {
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

    public static buildExecCallback(config: IExecConfig|undefined): ITwitchActionCallback|undefined {
        if(config) return async (user: IActionUser) => {
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

    private static buildWebCallback(url: string|undefined): ITwitchActionCallback|undefined {
        if(url) return (user: IActionUser) => {
            fetch(url, {mode: 'no-cors'}).then(result => console.log(result))
        }
    }

    private static buildScreenshotCallback(config: IScreenshot|undefined, key: string, nonce: string): ITwitchActionCallback|undefined {
        if(config) return (user: IActionUser) => {
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

    private static buildDiscordMessageCallback(message: string|string[]|undefined, key: string): ITwitchActionCallback|undefined {
        if(message && message.length > 0) return async (user: IActionUser, index?: number) => {
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

    private static buildTwitchChatCallback(message: string|string[]|undefined): ITwitchActionCallback|undefined {
        if(message && message.length > 0) return async (user: IActionUser, index?: number) => {
            const modules = ModulesSingleton.getInstance()
            modules.twitch._twitchChatOut.sendMessageToChannel(
                await Utils.replaceTagsInText(Utils.randomOrSpecificFromArray(message, index), user)
            )
        }
    }

    private static buildTwitchWhisperCallback(config: IWhisperConfig|undefined): ITwitchActionCallback|undefined {
        if(config) return async (user: IActionUser, index?: number) => {
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

    private static buildLabelCallback(config: ILabelConfig|undefined): ITwitchActionCallback|undefined {
        if(config) return async (user: IActionUser) => {
            if(config.append) {
                Settings.appendSetting(config.fileName, await Utils.replaceTagsInText(config.text, user))
            } else {
                Settings.pushLabel(config.fileName, await Utils.replaceTagsInText(config.text, user))
            }
        }
    }

    private static buildCommandsCallback(config: ICommandConfig|undefined): ITwitchActionCallback|undefined {
        if(config) return (user: IActionUser) => {
            const modules = ModulesSingleton.getInstance()
            const interval = config.interval ?? 0
            let delay = 0
            const commands = Utils.ensureArray(config.entries)
            for(const command of commands) {
                console.log(`Executing command: ${command} in ${delay} seconds...`)
                let inputText = user.input
                if(command.includes(' ')) inputText = Utils.splitOnFirst(' ', inputText)[0]
                setTimeout(()=>{
                    modules.twitch.runCommand(command, {...user, input: inputText})
                }, delay*1000)
                delay += interval
            }
        }
    }

    private static buildRemoteCommandCallback(commandStr: string|undefined): ITwitchActionCallback|undefined {
        if(commandStr && commandStr.length > 0) return (user: IActionUser) => {
            const modules = ModulesSingleton.getInstance()
            modules.twitch.sendRemoteCommand(commandStr)
        }
    }

    private static buildRewardStatesCallback(config: IRewardStatesConfig|undefined): ITwitchActionCallback|undefined {
        if(config) return async (user: IActionUser) => {
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