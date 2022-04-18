class AutoRewards {
    public static async init() {
        /*
        ..####...##..##..######...####...........#####...######..##...##...####...#####...#####....####..
        .##..##..##..##....##....##..##..........##..##..##......##...##..##..##..##..##..##..##..##.....
        .######..##..##....##....##..##..######..#####...####....##.#.##..######..#####...##..##...####..
        .##..##..##..##....##....##..##..........##..##..##......#######..##..##..##..##..##..##......##.
        .##..##...####.....##.....####...........##..##..######...##.##...##..##..##..##..#####....####..
        */
        const modules = ModulesSingleton.getInstance()

        for(const key of Config.twitch.autoRewards) {
            const nonceTTS = Utils.getNonce('TTS') // Used to reference the TTS finishing before taking a screenshot.
            const obsCallback = AutoRewards.buildOBSCallback(Config.obs.configs[key], key)
            const colorCallback = AutoRewards.buildColorCallback(Config.philipshue.lightConfigs[key])
            const plugCallback = AutoRewards.buildPlugCallback(Config.philipshue.plugConfigs[key])
            const soundCallback = AutoRewards.buildSoundAndSpeechCallback(
                Config.audioplayer.configs[key], 
                Config.controller.speechReferences[key], 
                nonceTTS, 
                Config.controller.speechReferences[key] != undefined
            )
            const pipeCallback = AutoRewards.buildPipeCallback(Config.pipe.configs[key])
            const openvr2wsSettingCallback = AutoRewards.buildOpenVR2WSSettingCallback(Config.openvr2ws.configs[key])
            const signCallback = AutoRewards.buildSignCallback(Config.sign.configs[key])
            const runCallback = AutoRewards.buildRunCallback(Config.run.configs[key])
            const webCallback = AutoRewards.buildWebCallback(Config.web.configs[key])
            const screenshotCallback = AutoRewards.buildScreenshotCallback(Config.screenshots.configs[key], key, nonceTTS)

            const reward:ITwitchReward = {
                id: await Utils.getRewardId(key),
                callback: async (data:ITwitchRedemptionMessage)=>{
                    // Prep for incremental reward
                    const rewardConfig = Config.twitch.rewardConfigs[key]
                    let counter = await Settings.pullSetting<ITwitchRewardCounter>(Settings.TWITCH_REWARD_COUNTERS, 'key', key)
                    if(Array.isArray(rewardConfig) && counter == null) counter = {key: key, count: 0}

                    // Disable reward after use
                    if(Config.twitch.disableAutoRewardAfterUse.indexOf(key) > -1) {
                        const id = await Utils.getRewardId(key)
                        modules.twitchHelix.updateReward(id, {is_enabled: false})
                    }

                    // Main callbacks
                    if(obsCallback != null) obsCallback(data)
                    if(colorCallback != null) colorCallback(data)
                    if(plugCallback != null) plugCallback(data)
                    if(soundCallback != null) soundCallback(data, counter?.count)
                    if(pipeCallback != null) pipeCallback(data)
                    if(openvr2wsSettingCallback != null) openvr2wsSettingCallback(data)
                    if(signCallback != null) signCallback(data)
                    if(runCallback != null) runCallback(data)
                    if(webCallback != null) webCallback(data)
                    if(screenshotCallback != null) screenshotCallback(data)
            
                    // Switch to the next incremental reward if it has more configs available
                    if(Array.isArray(rewardConfig) && counter != undefined) {                       
                        counter.count++
                        const newRewardConfig = rewardConfig[counter.count]
                        if(newRewardConfig != undefined) {
                            Settings.pushSetting(Settings.TWITCH_REWARD_COUNTERS, 'key', counter)
                            modules.twitchHelix.updateReward(await Utils.getRewardId(key), newRewardConfig)
                        }
                    }
                }
            }
            if(reward.id != null) {
                Utils.logWithBold(
                    `Registering Automatic Reward `
                    +(obsCallback?'🎬':'')
                    +(colorCallback?'🎨':'')
                    +(plugCallback?'🔌':'')
                    +(soundCallback?'🔊':'')
                    +(pipeCallback?'📺':'')
                    +(openvr2wsSettingCallback?'🔧':'')
                    +(runCallback?'🛴':'')
                    +(webCallback?'🌐':'')
                    +(screenshotCallback?'📷':'')
                    +`: ${key}`, 'green')
                modules.twitch.registerReward(reward)
            } else {
                Utils.logWithBold(`No Reward ID for <${key}>, it might be missing a reward config.`, 'red')
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

    public static buildOBSCallback(config: IObsSourceConfig|undefined, key: string): ITwitchRedemptionCallback|undefined {
        if(config) return (message: ITwitchRedemptionMessage) => {
            const modules = ModulesSingleton.getInstance()
            config.key = key
            console.log("OBS Reward triggered")
            modules.obs.show(config)
        } 
    }

    public static buildColorCallback(config: IPhilipsHueColorConfig|IPhilipsHueColorConfig[]|undefined): ITwitchRedemptionCallback|undefined {
        if(config) return (message: ITwitchRedemptionMessage) => {
            const modules = ModulesSingleton.getInstance()
            const cfg = Array.isArray(config) ? Utils.randomFromArray(config) : config
            const userName = message?.redemption?.user?.login
            modules.tts.enqueueSpeakSentence('changed the color', userName, GoogleTTS.TYPE_ACTION)
            const lights:number[] = Config.philipshue.lightsIds
            lights.forEach(light => {
                modules.hue.setLightState(light, cfg.x, cfg.y)
            })
        }
    }

    public static buildPlugCallback(config: IPhilipsHuePlugConfig|undefined): ITwitchRedemptionCallback|undefined {
        if(config) return (message: ITwitchRedemptionMessage) => {
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
    public static buildSoundAndSpeechCallback(config: IAudio|undefined, speech:string|string[]|undefined, nonce: string, onTtsQueue:boolean = false):ITwitchRedemptionCallback|undefined {
        if(config || speech) return (message: ITwitchRedemptionMessage, index?: number) => {
            const states = StatesSingleton.getInstance()
            const modules = ModulesSingleton.getInstance()
            let ttsString: string|undefined
            if(Array.isArray(speech) || typeof speech == 'string') {
                ttsString = index != undefined && Array.isArray(speech) && speech.length > index
                    ? speech[index]
                    : Utils.randomFromArray(speech)
                ttsString = Utils.replaceTagsInString(ttsString, message)
                if(ttsString.indexOf('%s') > -1) ttsString = Utils.template(ttsString, message?.redemption?.user_input ?? '')
                onTtsQueue = true
            }
            
            if(config) { // If we have an audio config, play it. Attach 
                if(onTtsQueue) modules.tts.enqueueSoundEffect(config)
                else modules.audioPlayer.enqueueAudio(config)
            }
            if(ttsString) modules.tts.enqueueSpeakSentence(ttsString, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT, nonce)
        }
    }

    public static buildPipeCallback(config: IPipeMessagePreset|IPipeMessagePreset[]|undefined): ITwitchRedemptionCallback|undefined {
        if(config) {
            return async (message: ITwitchRedemptionMessage) => {
                /*
                * We check if we don't have enough texts to fill the preset 
                * and fill the empty spots up with the redeemer's display name.
                */            
                let asyncConfig = Utils.clone(config)
                if(!Array.isArray(asyncConfig)) asyncConfig = [asyncConfig]
                const modules = ModulesSingleton.getInstance()
                for(const cfg of asyncConfig) {
                    const textAreaCount = cfg.config.customProperties?.textAreas?.length ?? 0
                    if(textAreaCount > 0 && cfg.texts == undefined) cfg.texts = []
                    const textCount = cfg.texts?.length ?? 0
                    if(textAreaCount > textCount && cfg.texts) {
                        cfg.texts.length = textAreaCount
                        cfg.texts.fill(message.redemption.user.display_name, textCount, textAreaCount)
                    }
                    if(cfg.imageData == null && cfg.imagePath == null) {
                        const user = await modules.twitchHelix.getUserById(parseInt(message?.redemption?.user?.id))
                        cfg.imagePath = user?.profile_image_url
                    }
                    modules.pipe.showPreset(cfg)
                }
            }
        }
    }

    public static buildOpenVR2WSSettingCallback(config: IOpenVR2WSSetting|IOpenVR2WSSetting[]|undefined): ITwitchRedemptionCallback|undefined {
        if(config) return (message: ITwitchRedemptionMessage) => {
            const modules = ModulesSingleton.getInstance()
            modules.openvr2ws.setSetting(config)
        }
    }

    public static buildSignCallback(config: ISignShowConfig|undefined): ITwitchRedemptionCallback|undefined {
        if(config) return (message: ITwitchRedemptionMessage) => {
            const modules = ModulesSingleton.getInstance()
            modules.twitchHelix.getUserById(parseInt(message?.redemption?.user?.id)).then(user => {
                const modules = ModulesSingleton.getInstance()
                const clonedConfig = Utils.clone(config)
                if(clonedConfig.title == undefined) clonedConfig.title = user?.display_name
                if(clonedConfig.subtitle == undefined) clonedConfig.subtitle = user?.display_name
                if(clonedConfig.image == undefined) clonedConfig.image = user?.profile_image_url
                modules.sign.enqueueSign(clonedConfig)
            })
        }
    }

    public static buildRunCallback(config: IRunCommand|undefined): ITwitchRedemptionCallback|undefined {
        if(config) return (message: ITwitchRedemptionMessage) => {
            const modules = ModulesSingleton.getInstance()
            const speech = message?.redemption?.reward?.title
            if(speech != undefined) modules.tts.enqueueSpeakSentence(`Running: ${speech}`, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
            Run.executeCommand(config)
        }
    }

    private static buildWebCallback(config: IWebRequestConfig|undefined) {
        if(config) return (message: ITwitchRedemptionMessage) => {
            fetch(config.url, {mode: 'no-cors'}).then(result => console.log(result))
        }
    }

    private static buildScreenshotCallback(config: IScreenshot|undefined, key: string, nonce: string) {
        if(config) return (message: ITwitchRedemptionMessage) => {
            const states = StatesSingleton.getInstance()
            const modules = ModulesSingleton.getInstance()
            const userInput = message?.redemption?.user_input
            if(userInput) {
                states.nonceCallbacks.set(nonce, ()=>{
                    if(config.obsSource) {
                        // OBS Source Screenshot
                        const messageId = modules.obs.takeSourceScreenshot(key, message, config.obsSource, config.delay ?? 0)
                        states.nonceCallbacks.set(messageId, ()=>{
                            modules.audioPlayer.enqueueAudio(Config.screenshots.callback.obsSourceCaptureDelayedSound)
                        })
                    } else {
                        // SuperScreenShotterVR
                        modules.sssvr.sendScreenshotRequest(key, message, config.delay ?? 0)
                    }    
                })
            } else {
                if(config.obsSource) {
                    // OBS Source Screenshot
                    modules.obs.takeSourceScreenshot(key, message, config.obsSource)
                } else {
                    // SuperScreenShotterVR
                    modules.sssvr.sendScreenshotRequest(key, message)
                }
            }
        }
    }
}    