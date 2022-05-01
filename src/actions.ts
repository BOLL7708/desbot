class Actions {
    public static async init() {
        for(const entry of Object.entries(Config.twitch.rewardConfigs)) {
            await this.registerReward(entry[0], entry[1])
        }
        // TODO: Add registration of commands
    }

    public static userDataFromRedemptionMessage(message: ITwitchRedemptionMessage): ITwitchActionUser {
        return {
            id: message?.redemption?.user?.id ?? '',
            login: message?.redemption?.user?.login ?? '',
            name: message?.redemption?.user?.display_name ?? '',
            input: message?.redemption?.user_input ?? '',
            color: '',
            isBroadcaster: false,
            isModerator: false,
            isVIP: false,
            isSubscriber: false
        }
    }
    public static async getEmptyUserDataForCommands(): Promise<ITwitchActionUser> {
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

    public static async registerReward(key: string, cfg: ITwitchRewardConfig) {
        const modules = ModulesSingleton.getInstance()
        const nonceTTS = Utils.getNonce('TTS') // Used to reference the TTS finishing before taking a screenshot.
        const obsCallback = Actions.buildOBSCallback(cfg?.obs, key)
        const colorCallback = Actions.buildColorCallback(cfg?.lights)
        const plugCallback = Actions.buildPlugCallback(cfg?.plugs)
        const soundCallback = Actions.buildSoundAndSpeechCallback(
            cfg?.audio, 
            cfg?.speech,
            nonceTTS, 
            !!(cfg?.speech)
        )
        const pipeCallback = Actions.buildPipeCallback(cfg?.pipe)
        const openvr2wsSettingCallback = Actions.buildOpenVR2WSSettingCallback(cfg?.openVR2WS)
        const signCallback = Actions.buildSignCallback(cfg?.sign)
        const execCallback = Actions.buildExecCallback(cfg?.exec)
        const webCallback = Actions.buildWebCallback(cfg?.web)
        const screenshotCallback = Actions.buildScreenshotCallback(cfg?.screenshots, key, nonceTTS)

        const reward:ITwitchReward = {
            id: await Utils.getRewardId(key),
            callback: async (data:ITwitchActionUser)=>{
                // Prep for incremental reward
                const rewardConfig = Utils.getRewardConfig(key)
                let counter = await Settings.pullSetting<ITwitchRewardCounter>(Settings.TWITCH_REWARD_COUNTERS, 'key', key)
                if(Array.isArray(rewardConfig?.reward) && counter == null) counter = {key: key, count: 0}

                // Main callbacks
                if(obsCallback != null) obsCallback(data)
                if(colorCallback != null) colorCallback(data)
                if(plugCallback != null) plugCallback(data)
                if(soundCallback != null) soundCallback(data, counter?.count)
                if(pipeCallback != null) pipeCallback(data)
                if(openvr2wsSettingCallback != null) openvr2wsSettingCallback(data)
                if(signCallback != null) signCallback(data)
                if(execCallback != null) execCallback(data)
                if(webCallback != null) webCallback(data)
                if(screenshotCallback != null) screenshotCallback(data)
        
                // Switch to the next incremental reward if it has more configs available
                if(Array.isArray(rewardConfig?.reward) && counter != undefined) {                       
                    counter.count++
                    const newRewardConfig = rewardConfig?.reward[counter.count]
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
                +(execCallback?'🎓':'')
                +(webCallback?'🌐':'')
                +(screenshotCallback?'📷':'')
                +`: ${key}`, 'green')
            modules.twitch.registerReward(reward)
        } else {
            Utils.logWithBold(`No Reward ID for <${key}>, it might be missing a reward config.`, 'red')
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

    public static buildOBSCallback(config: IObsSourceConfig|undefined, key: string): ITwitchActionCallback|undefined {
        if(config) return (userData: ITwitchActionUser) => {
            const modules = ModulesSingleton.getInstance()
            config.key = key
            console.log("OBS Reward triggered")
            modules.obs.show(config)
        } 
    }

    public static buildColorCallback(config: IPhilipsHueColorConfig|IPhilipsHueColorConfig[]|undefined): ITwitchActionCallback|undefined {
        if(config) return (userData: ITwitchActionUser) => {
            const modules = ModulesSingleton.getInstance()
            const cfg = Array.isArray(config) ? Utils.randomFromArray(config) : config
            const userName = userData.login
            modules.tts.enqueueSpeakSentence('changed the color', userName, GoogleTTS.TYPE_ACTION)
            const lights:number[] = Config.philipshue.lightsIds
            lights.forEach(light => {
                modules.hue.setLightState(light, cfg.x, cfg.y)
            })
        }
    }

    public static buildPlugCallback(config: IPhilipsHuePlugConfig|undefined): ITwitchActionCallback|undefined {
        if(config) return (userData: ITwitchActionUser) => {
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
        if(config || speech) return (userData: ITwitchActionUser, index?: number) => {
            const modules = ModulesSingleton.getInstance()
            let ttsString: string|undefined
            if(Array.isArray(speech) || typeof speech == 'string') {
                ttsString = index != undefined && Array.isArray(speech) && speech.length > index
                    ? speech[index]
                    : Utils.randomFromArray(speech)
                ttsString = Utils.replaceTagsForTTS(ttsString, userData)
                if(ttsString.indexOf('%s') > -1) ttsString = Utils.template(ttsString, userData.input)
                onTtsQueue = true
            }
            
            if(config) { // If we have an audio config, play it. Attach 
                if(onTtsQueue) modules.tts.enqueueSoundEffect(config)
                else modules.audioPlayer.enqueueAudio(config)
            }
            if(ttsString) modules.tts.enqueueSpeakSentence(ttsString, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT, nonce)
        }
    }

    public static buildPipeCallback(config: IPipeMessagePreset|IPipeMessagePreset[]|undefined): ITwitchActionCallback|undefined {
        if(config) {
            return async (userData: ITwitchActionUser) => {
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
                        cfg.texts.fill(userData.name, textCount, textAreaCount)
                    }
                    
                    // Replace all empty text values with redeemer's display name.
                    cfg.texts = cfg.texts?.map((text)=>{ return (text.length == 0) ? userData.name : text })

                    // Replace tags in texts.
                    cfg.texts = cfg.texts?.map((text)=>{ return Utils.replaceTagsForText(text, userData)})

                    // If no image is supplied, use the redeemer user image instead.
                    if(cfg.imageData == null && cfg.imagePath == null) {
                        const user = await modules.twitchHelix.getUserById(parseInt(userData.id))
                        cfg.imagePath = user?.profile_image_url
                    }

                    // Show it
                    modules.pipe.showPreset(cfg)
                }
            }
        }
    }

    public static buildOpenVR2WSSettingCallback(config: IOpenVR2WSSetting|IOpenVR2WSSetting[]|undefined): ITwitchActionCallback|undefined {
        if(config) return (userData: ITwitchActionUser) => {
            const modules = ModulesSingleton.getInstance()
            modules.openvr2ws.setSetting(config)
        }
    }

    public static buildSignCallback(config: ISignShowConfig|undefined): ITwitchActionCallback|undefined {
        if(config) return (userData: ITwitchActionUser) => {
            const modules = ModulesSingleton.getInstance()
            modules.twitchHelix.getUserById(parseInt(userData.id)).then(user => {
                const modules = ModulesSingleton.getInstance()
                const clonedConfig = Utils.clone(config)
                if(clonedConfig.title == undefined) clonedConfig.title = user?.display_name
                if(clonedConfig.subtitle == undefined) clonedConfig.subtitle = user?.display_name
                if(clonedConfig.image == undefined) clonedConfig.image = user?.profile_image_url
                modules.sign.enqueueSign(clonedConfig)
            })
        }
    }

    public static buildExecCallback(config: IExecConfig|undefined): ITwitchActionCallback|undefined {
        if(config) return (userData: ITwitchActionUser) => {
            if(config.run) {
                Exec.runKeyPressesFromPreset(config.run)
            }
            if(config.uri) {
                if(Array.isArray(config.uri)) {
                    for(const u of config.uri) {
                        Exec.loadCustomURI(u)
                    }
                } else {
                    Exec.loadCustomURI(config.uri)
                }
            }
        }
    }

    private static buildWebCallback(url: string|undefined): ITwitchActionCallback|undefined {
        if(url) return (userData: ITwitchActionUser) => {
            fetch(url, {mode: 'no-cors'}).then(result => console.log(result))
        }
    }

    private static buildScreenshotCallback(config: IScreenshot|undefined, key: string, nonce: string): ITwitchActionCallback|undefined {
        if(config) return (userData: ITwitchActionUser) => {
            const states = StatesSingleton.getInstance()
            const modules = ModulesSingleton.getInstance()
            const userInput = userData.input
            if(userInput) {
                // This is executed after the TTS with the same nonce has finished.
                states.nonceCallbacks.set(nonce, ()=>{
                    if(config.obsSource) {
                        // OBS Source Screenshot
                        const messageId = modules.obs.takeSourceScreenshot(key, userData, config.obsSource, config.delay ?? 0)
                        states.nonceCallbacks.set(messageId, ()=>{
                            modules.audioPlayer.enqueueAudio(Config.screenshots.callback.soundEffectForOBSScreenshots)
                        })
                    } else {
                        // SuperScreenShotterVR
                        modules.sssvr.sendScreenshotRequest(key, userData, config.delay ?? 0)
                    }    
                })
            } else {
                if(config.obsSource) {
                    // OBS Source Screenshot
                    modules.audioPlayer.enqueueAudio(Config.screenshots.callback.soundEffectForOBSScreenshots)
                    modules.obs.takeSourceScreenshot(key, userData, config.obsSource)
                } else {
                    // SuperScreenShotterVR
                    modules.sssvr.sendScreenshotRequest(key, userData)
                }
            }
        }
    }
}    