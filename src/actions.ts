class Actions {
    public static async init() {
        Utils.log('=== Registering Triggers for Events ===', Color.DarkGreen)
        for(const event of Object.entries(Config.events)) {
            if(event[1].triggers.reward) await this.registerReward(event[0], event[1])
            if(event[1].triggers.command) await this.registerCommand(event[0], event[1])
        }
    }

    public static userDataFromRedemptionMessage(message: ITwitchPubsubRewardMessage): IActionUser {
        return {
            id: message?.data?.redemption?.user?.id ?? '',
            login: message?.data?.redemption?.user?.login ?? '',
            name: message?.data?.redemption?.user?.display_name ?? '',
            input: message?.data?.redemption?.user_input ?? '',
            color: '',
            isBroadcaster: false,
            isModerator: false,
            isVIP: false,
            isSubscriber: false
        }
    }
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
            isSubscriber: false
        }
    }

    public static async registerReward(key: string, event: IEvent) {
        const modules = ModulesSingleton.getInstance()
        const actionCallback = this.buildActionCallback(key, event)
        const reward:ITwitchReward = {
            id: await Utils.getRewardId(key),
            callback: async (user, index, msg) => {
                // Prep for incremental reward // TODO: Move this out to above the registration?
                const rewardConfig = Utils.getEventConfig(key)?.triggers.reward
                let counter = await Settings.pullSetting<ITwitchRewardCounter>(Settings.TWITCH_REWARD_COUNTERS, 'key', key)
                if(Array.isArray(rewardConfig) && counter == null) counter = {key: key, count: 0}
                
                // Trigger actions
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
        let command = event?.triggers.command
        if(!event.triggers.command) {
            event.triggers.command = {
                trigger: key,
                permissions: {}
            }
        } else if(command) command.trigger = key
        const actionCallback = this.buildActionCallback(key, event)
        const useThisCommand = <ITwitchCommandConfig> (
            command?.cooldown == undefined 
            ? {...event.triggers.command, callback: actionCallback}
            : {...event.triggers.command, cooldownCallback: actionCallback}
        )
        modules.twitch.registerCommand(useThisCommand)
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
        const actions = event.actions

        // Build callbacks
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
        const audioUrlCallback = this.buildAudioUrlCallback(actions?.audioUrl)
        const twitchChatCallback = this.buildTwitchChatCallback(actions?.chat)
        const labelCallback = this.buildLabelCallback(actions?.label)

        // Log result
        Utils.logWithBold(
            `Built Action Callback: `
            +(rewardCallback?'💩':'')
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
            +(audioUrlCallback?'🎵':'')
            +(twitchChatCallback?'📄':'')
            +(labelCallback?'🏷':'')
            +`: ${key}`, Color.Green)

        // Return callback that triggers all the actions
        return async (user: IActionUser, index?: number, msg?: ITwitchPubsubRewardMessage) => {
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
            if(audioUrlCallback) audioUrlCallback(user)
            if(twitchChatCallback) twitchChatCallback(user, index)
            if(labelCallback) labelCallback(user)
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
            modules.tts.enqueueSpeakSentence('changed the color', userName, GoogleTTS.TYPE_ACTION)
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
    public static buildSoundAndSpeechCallback(config: IAudio|undefined, speech:string|string[]|undefined, nonce: string, onTtsQueue:boolean = false):ITwitchActionCallback|undefined {
        if(config || speech) return async (user: IActionUser, index?: number) => {
            const modules = ModulesSingleton.getInstance()
            let ttsString: string|undefined
            if(Array.isArray(speech) || typeof speech == 'string') {
                ttsString = <string> Utils.randomOrSpecificFromArray(speech, index)
                ttsString = await Utils.replaceTagsInText(ttsString, user)
                onTtsQueue = true
            }
            if(config) { // If we have an audio config, play it. Attach 
                if(onTtsQueue) modules.tts.enqueueSoundEffect(config)
                else modules.audioPlayer.enqueueAudio(config)
            }
            if(ttsString) modules.tts.enqueueSpeakSentence(ttsString, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT, nonce)
        }
    }

    private static buildAudioUrlCallback(config: IAudioBase|undefined): ITwitchActionCallback|undefined {
        if(config) return (user: IActionUser) => {
            const modules = ModulesSingleton.getInstance()
            if(user.input) modules.audioPlayer.enqueueAudio({...config, ...{src: user.input}})
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

    private static buildLabelCallback(labelSettingKey: string|undefined): ITwitchActionCallback|undefined {
        if(labelSettingKey) return (user: IActionUser) => {
            const modules = ModulesSingleton.getInstance()
            Settings.pushLabel(labelSettingKey, user.input)
        }
    }
}    