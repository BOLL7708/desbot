class MainController {
    private _twitch: Twitch = new Twitch()
    private _twitchHelix: TwitchHelix = new TwitchHelix()
    private _twitchTokens: TwitchTokens = new TwitchTokens()
    private _tts: GoogleTTS = new GoogleTTS()
    private _pipe: Pipe = new Pipe()
    private _obs: OBS = new OBS()
    private _screenshots: Screenshots = new Screenshots()
    private _discord: Discord = new Discord()
    private _hue: PhilipsHue = new PhilipsHue()
    private _openvr2ws: OpenVR2WS = new OpenVR2WS()
    private _audioPlayer: AudioPlayer = new AudioPlayer()
    private _sign: Sign = new Sign()
    
    private _ttsEnabledUsers: string[] = []
    private _ttsForAll: boolean = Config.controller.defaults.ttsForAll
    private _pipeAllChat: boolean = Config.controller.defaults.pipeAllChat
    private _pingForChat: boolean = Config.controller.defaults.pingForChat
    private _useGameSpecificRewards: boolean = Config.controller.defaults.useGameSpecificRewards // Used in func.call(this) so reference not counted, stupid TypeScript.
    private _logChatToDiscord: boolean = Config.controller.defaults.logChatToDiscord
    private _updateTwitchGameCategory: boolean = Config.controller.defaults.updateTwitchGameCategory  // Used in func.call(this) so reference not counted, stupid TypeScript.
    private _nonceCallbacks: Record<string, Function> = {}
    private _scaleIntervalHandle: number
    private _steamPlayerSummaryIntervalHandle: number // Used in func.call(this) so reference not counted, stupid TypeScript.
    private _steamAchievementsIntervalHandle: number // Used in func.call(this) so reference not counted, stupid TypeScript.
    private _lastSteamAppId: string|undefined // Used in func.call(this) so reference not counted, stupid TypeScript.

    constructor() {
        if(Config.controller.saveConsoleOutputToSettings) new LogWriter() // Saves log
        this.init() // To allow init to be async
    }
    
    private async init() {
        // Make sure settings are pre-cached
        await Settings.loadSettings(Settings.TTS_BLACKLIST)
        await Settings.loadSettings(Settings.TTS_USER_NAMES)
        await Settings.loadSettings(Settings.TTS_USER_VOICES)
        await Settings.loadSettings(Settings.TWITCH_TOKENS)
        await Settings.loadSettings(Settings.TWITCH_REWARDS)
        await Settings.loadSettings(Settings.TTS_DICTIONARY).then(dictionary => this._tts.setDictionary(dictionary))
        await Settings.loadSettings(Settings.TWITCH_CLIPS)
        await Settings.loadSettings(Settings.TWITCH_REWARD_COUNTERS)

        /*
        .####.##....##.####.########
        ..##..###...##..##.....##...
        ..##..####..##..##.....##...
        ..##..##.##.##..##.....##...
        ..##..##..####..##.....##...
        ..##..##...###..##.....##...
        .####.##....##.####....##...
        */
        await this._twitchTokens.refreshToken()
        await this._twitchHelix.init()

        this._pipe.setOverlayTitle("Streaming Widget")

        this.setEmptySoundForTTS.call(this)

        // Steam Web API intervals
        if(!Config.controller.websocketsUsed.openvr2ws) this.startSteamPlayerSummaryInterval()
        this.startSteamAchievementsInterval()

        /*
        .########..########.##......##....###....########..########...######.
        .##.....##.##.......##..##..##...##.##...##.....##.##.....##.##....##
        .##.....##.##.......##..##..##..##...##..##.....##.##.....##.##......
        .########..######...##..##..##.##.....##.########..##.....##..######.
        .##...##...##.......##..##..##.#########.##...##...##.....##.......##
        .##....##..##.......##..##..##.##.....##.##....##..##.....##.##....##
        .##.....##.########..###..###..##.....##.##.....##.########...######.
        */

        // Load reward IDs from settings
        let storedRewards:ITwitchRewardPair[] = Settings.getFullSettings(Settings.TWITCH_REWARDS)
        if(storedRewards == undefined) storedRewards = []

        // Create missing rewards if any
        const allRewardKeys = Object.keys(Config.twitch.rewardConfigs)
        const missingRewardKeys = allRewardKeys.filter(key => !storedRewards.find(reward => reward.key == key))
        for(const key of missingRewardKeys) {
            const setup = Config.twitch.rewardConfigs[key]
            let reward = await this._twitchHelix.createReward(Array.isArray(setup) ? setup[0] : setup)
            if(reward?.data?.length > 0) await Settings.pushSetting(Settings.TWITCH_REWARDS, 'key', {key: key, id: reward.data[0].id})
        }

        // Reset rewards with multiple steps
        for(const key of allRewardKeys) {
            if(Config.controller.resetIncrementingRewardsOnLoad.includes(key)) {
                const setup = Config.twitch.rewardConfigs[key]
                if(Array.isArray(setup)) {
                    const current: ITwitchRewardCounter = await Settings.pullSetting(Settings.TWITCH_REWARD_COUNTERS, 'key', key)
                    if((current?.count ?? 0) > 0) {
                        Utils.log(`Resetting incrementing reward: ${key}`, Color.Green)
                        const reset: ITwitchRewardCounter = {key: key, count: 0}
                        await Settings.pushSetting(Settings.TWITCH_REWARD_COUNTERS, 'key', reset)
                        await this._twitchHelix.updateReward(await Utils.getRewardId(key), setup[0])
                    }
                }
            }
        }

        // Toggle TTS rewards
        this._twitchHelix.updateReward(await Utils.getRewardId(Keys.KEY_TTSSPEAK), {is_enabled: !this._ttsForAll})
        this._twitchHelix.updateReward(await Utils.getRewardId(Keys.KEY_UNLOCKREWARDTIMER), {is_enabled: true})

        // Enable default rewards
        const enableRewards = Config.twitch.defaultRewards.filter(reward => { return !Config.twitch.disableRewards.includes(reward) })
        for(const key of enableRewards) {
            this._twitchHelix.updateReward(await Utils.getRewardId(key), {is_enabled: true})
        }
        
        // Disable unwanted rewards
        for(const key of Config.twitch.disableRewards) {
            this._twitchHelix.updateReward(await Utils.getRewardId(key), {is_enabled: false})
        }

        /*
        .######..######...####..
        ...##......##....##.....
        ...##......##.....####..
        ...##......##........##.
        ...##......##.....####..
        */
        this._twitch.registerReward({
            id: await Utils.getRewardId(Keys.KEY_TTSSPEAK),
            callback: (data:ITwitchRedemptionMessage) => {
                const userName = data?.redemption?.user?.login
                const inputText = data?.redemption?.user_input
                if(userName != null && inputText != null) {
                    Utils.log("TTS Message Reward", Color.DarkOrange)
                    this._tts.enqueueSpeakSentence(
                        inputText,
                        userName,
                        GoogleTTS.TYPE_SAID
                    )
                }
            }
        })
        this._twitch.registerReward({
            id: await Utils.getRewardId(Keys.KEY_TTSSETVOICE),
            callback: async (data:ITwitchRedemptionMessage) => {
                const userName = data?.redemption?.user?.login
                const displayName = data?.redemption?.user?.display_name
                const userInput = data?.redemption?.user_input
                Utils.log(`TTS Voice Set Reward: ${userName} -> ${userInput}`, Color.DarkOrange)
                const voiceName = await this._tts.setVoiceForUser(userName, userInput)
                this._twitch._twitchChat.sendMessageToChannel(`@${displayName} voice: ${voiceName}`)
            }
        })
        this._twitch.registerReward({
            id: await Utils.getRewardId(Keys.KEY_TTSSWITCHVOICEGENDER),
            callback: (data:ITwitchRedemptionMessage) => {
                const userName = data?.redemption?.user?.login
                Utils.log(`TTS Gender Set Reward: ${userName}`, Color.DarkOrange)
                Settings.pullSetting(Settings.TTS_USER_VOICES, 'userName', userName).then(voice => {
                    const voiceSetting:IUserVoice = voice
                    let gender:string = ''
                    if(voiceSetting != null) gender = voiceSetting.gender.toLowerCase() == 'male' ? 'female' : 'male'
                    this._tts.setVoiceForUser(userName, `reset ${gender}`)
                })
            }
        })

        /*
        ..####....####...#####...######..######..##..##...####...##..##...####...######...####..
        .##......##..##..##..##..##......##......###.##..##......##..##..##..##....##....##.....
        ..####...##......#####...####....####....##.###...####...######..##..##....##.....####..
        .....##..##..##..##..##..##......##......##..##......##..##..##..##..##....##........##.
        ..####....####...##..##..######..######..##..##...####...##..##...####.....##.....####..
        */
        this._twitch.registerReward({
            id: await Utils.getRewardId(Keys.KEY_SCREENSHOT),
            callback: (data:ITwitchRedemptionMessage) => {
                let userInput = data?.redemption?.user_input
                const nonce = Utils.getNonce('TTS')
                const speech = Config.controller.speechReferences[Keys.KEY_SCREENSHOT]
                this._tts.enqueueSpeakSentence(Utils.template(speech, userInput), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT, nonce)
                this._nonceCallbacks[nonce] = ()=>{
                    if(Config.controller.websocketsUsed.openvr2ws && this._lastSteamAppId != undefined) {
                        // SuperScreenShotterVR
                        this._screenshots.sendScreenshotRequest(Keys.KEY_SCREENSHOT, data, Config.screenshots.delayOnDescription)
                    } else {
                        // OBS Source Screenshot
                        setTimeout(async ()=>{
                            const userData = await this._twitchHelix.getUserById(parseInt(data.redemption.user.id))
                            const requestData: IScreenshotRequestData = { rewardKey: Keys.KEY_SCREENSHOT, userId: parseInt(userData.id), userName: userData.login, userInput: data.redemption.user_input }
                            this._obs.takeSourceScreenshot(requestData)
                        }, Config.screenshots.delayOnDescription*1000)
                    }    
                }
            }
        })
        // TODO: Change this into an auto-reward with a screenshot callback for SSSVR and OBS?
        this._twitch.registerReward({
            id: await Utils.getRewardId(Keys.KEY_INSTANTSCREENSHOT),
            callback: async (data:ITwitchRedemptionMessage) => {
                const speech = Config.controller.speechReferences[Keys.KEY_INSTANTSCREENSHOT]
                this._tts.enqueueSpeakSentence(speech, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                if(Config.controller.websocketsUsed.openvr2ws && this._lastSteamAppId != undefined) {
                    // SuperScreenShotterVR
                    this._screenshots.sendScreenshotRequest(Keys.KEY_INSTANTSCREENSHOT, data, 0)
                } else {
                    // OBS Source Screenshot
                    const userData = await this._twitchHelix.getUserById(parseInt(data.redemption.user.id))
                    const requestData: IScreenshotRequestData = { rewardKey: Keys.KEY_INSTANTSCREENSHOT, userId: parseInt(userData.id), userName: userData.login, userInput: data.redemption.user_input }
                    this._obs.takeSourceScreenshot(requestData)
                }
            }
        })

        /*
        .######..#####....####...#####...##..##..##..##.
        ...##....##..##..##..##..##..##..##..##...####..
        ...##....#####...##..##..#####...######....##...
        ...##....##..##..##..##..##......##..##....##...
        ...##....##..##...####...##......##..##....##...
        */
        this._twitch.registerReward({
            id: await Utils.getRewardId(Keys.KEY_CHANNELTROPHY),
            callback: async (message:ITwitchRedemptionMessage) => {
                // Save stat
                const row: IChannelTrophyStat = {
                    userId: message.redemption.user.id,
                    index: message.redemption.reward.redemptions_redeemed_current_stream,
                    cost: message.redemption.reward.cost.toString()
                }
                Settings.appendSetting(Settings.CHANNEL_TROPHY_STATS, row)

                const user = await this._twitchHelix.getUserById(parseInt(message.redemption.user.id))
                if(user == undefined) return Utils.log(`Could not retrieve user for reward: ${Keys.KEY_CHANNELTROPHY}`, Color.Red)
                
                // Effects
                const signCallback = this.buildSignCallback(this, Config.sign.configs[Keys.KEY_CHANNELTROPHY])
                signCallback?.call(this, message)
                const soundCallback = this.buildSoundAndSpeechCallback(this, Config.audioplayer.configs[Keys.KEY_CHANNELTROPHY], undefined, true)
                soundCallback?.call(this, message) // TODO: Should find a new sound for this.

                // Update reward
                const rewardId = await Utils.getRewardId(Keys.KEY_CHANNELTROPHY)
                const rewardData = await this._twitchHelix.getReward(rewardId)
                if(rewardData?.data?.length == 1) { // We only loaded one reward, so this should be 1
                    const cost = rewardData.data[0].cost
                    
                    // Do TTS
                    const funnyNumberConfig = ChannelTrophy.detectFunnyNumber(parseInt(row.cost))
                    if(funnyNumberConfig != null && Config.controller.channelTrophySettings.ttsOn) {
                        this._tts.enqueueSpeakSentence(
                            Utils.template(funnyNumberConfig.speech, user.login), 
                            Config.twitch.chatbotName, 
                            GoogleTTS.TYPE_ANNOUNCEMENT
                        )
                    }
                    // Update label in overlay
                    Settings.pushLabel(
                        Settings.CHANNEL_TROPHY_LABEL, 
                        Utils.template(Config.controller.channelTrophySettings.label, cost, user.display_name)
                    )
                    
                    // Update reward
                    const configArrOrNot = Config.twitch.rewardConfigs[Keys.KEY_CHANNELTROPHY]
                    const config = Array.isArray(configArrOrNot) ? configArrOrNot[0] : configArrOrNot
                    if(config != undefined) {
                        const newCost = cost+1;
                        const updatedReward = await this._twitchHelix.updateReward(rewardId, {
                            title: Utils.template(Config.controller.channelTrophySettings.rewardTitle, user.display_name),
                            cost: newCost,
                            is_global_cooldown_enabled: true,
                            global_cooldown_seconds: config.global_cooldown_seconds+Math.round(Math.log(newCost)*Config.controller.channelTrophySettings.rewardCooldownMultiplier),
                            prompt: Utils.template(Config.controller.channelTrophySettings.rewardPrompt, user.display_name, config.prompt, newCost)
                        })
                        if(updatedReward == undefined) Utils.log(`Channel Trophy redeemed, but could not be updated.`, Color.Red)
                    } else Utils.log(`Channel Trophy redeemed, but no config found.`, Color.Red)
                } else Utils.log(`Could not retrieve Reward Data for reward: ${Keys.KEY_CHANNELTROPHY}`, Color.Red)
            }
        })

        /*
        .##..##..##..##..##.......####....####...##..##.
        .##..##..###.##..##......##..##..##..##..##.##..
        .##..##..##.###..##......##..##..##......####...
        .##..##..##..##..##......##..##..##..##..##.##..
        ..####...##..##..######...####....####...##..##.
        */
        this._twitch.registerReward({
            id: await Utils.getRewardId(Keys.KEY_UNLOCKREWARDTIMER),
            callback: async (message: ITwitchRedemptionMessage) => {
                const speech = Config.controller.speechReferences[Keys.KEY_UNLOCKREWARDTIMER][0]
                await this._tts.enqueueSpeakSentence(speech, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                this._tts.enqueueSoundEffect(Config.audioplayer.configs[Keys.KEY_UNLOCKREWARDTIMER])
                this._twitchHelix.updateReward(await Utils.getRewardId(Keys.KEY_UNLOCKREWARDTIMER), {is_enabled: false})
                setTimeout(async ()=>{
                    const rewardId = await Utils.getRewardId(Config.controller.rewardReferences[Keys.KEY_UNLOCKREWARDTIMER])
                    const rewardData = await this._twitchHelix.getReward(rewardId)
                    const cost = rewardData.data[0].cost
                    const speech = Config.controller.speechReferences[Keys.KEY_UNLOCKREWARDTIMER][1]
                    this._tts.enqueueSoundEffect(Config.audioplayer.configs[Keys.KEY_UNLOCKREWARDTIMER])
                    this._tts.enqueueSpeakSentence(speech, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                    this._twitchHelix.updateReward(rewardId, {is_enabled: true, cost: cost+500})
                }, 30*60*1000)
            }
        })
        
        /*
        ..####...##..##..######...####...........#####...######..##...##...####...#####...#####....####..
        .##..##..##..##....##....##..##..........##..##..##......##...##..##..##..##..##..##..##..##.....
        .######..##..##....##....##..##..######..#####...####....##.#.##..######..#####...##..##...####..
        .##..##..##..##....##....##..##..........##..##..##......#######..##..##..##..##..##..##......##.
        .##..##...####.....##.....####...........##..##..######...##.##...##..##..##..##..#####....####..
        */
        for(const key of Config.twitch.autoRewards) {
            const obsCallback: null|((data: ITwitchRedemptionMessage) => void) = this.buildOBSCallback(this, Config.obs.configs[key])
            const colorCallback: null|((data: ITwitchRedemptionMessage) => void) = this.buildColorCallback(this, Config.philipshue.lightConfigs[key])
            const plugCallback: null|((data: ITwitchRedemptionMessage) => void) = this.buildPlugCallback(this, Config.philipshue.plugConfigs[key])
            const soundCallback: null|((data: ITwitchRedemptionMessage, rewardIndex: number) => void) = this.buildSoundAndSpeechCallback(this, Config.audioplayer.configs[key], Config.controller.speechReferences[key])
            const pipeCallback: null|((data: ITwitchRedemptionMessage) => void) = this.buildPipeCallback(this, Config.pipe.configs[key])
            const openvr2wsSettingCallback: null|((data: ITwitchRedemptionMessage) => void) = this.buildOpenVR2WSSettingCallback(this, Config.openvr2ws.configs[key])
            const signCallback: null|((data: ITwitchRedemptionMessage) => void) = this.buildSignCallback(this, Config.sign.configs[key])
            const runCallback: null|((data: ITwitchRedemptionMessage) => void) = this.buildRunCallback(this, Config.run.configs[key])
            const webCallback: null|((data: ITwitchRedemptionMessage) => void) = this.buildWebCallback(this, Config.web.configs[key])

            const reward:ITwitchReward = {
                id: await Utils.getRewardId(key),
                callback: async (data:ITwitchRedemptionMessage)=>{
                    // Prep for incremental reward
                    const rewardConfig = Config.twitch.rewardConfigs[key]
                    let counter: ITwitchRewardCounter = await Settings.pullSetting(Settings.TWITCH_REWARD_COUNTERS, 'key', key)
                    if(Array.isArray(rewardConfig) && counter == null) counter = {key: key, count: 0}

                    // Disable after use
                    if(Config.twitch.disableAutoRewardAfterUse.indexOf(key) > -1) {
                        const id = await Utils.getRewardId(key)
                        this._twitchHelix.updateReward(id, {is_enabled: false})
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
            
                    // Switch to next incremental reward if it has more configs available
                    if(counter != undefined) {                       
                        counter.count++
                        const newRewardConfig = rewardConfig[counter.count] ?? null
                        if(newRewardConfig != null) {
                            Settings.pushSetting(Settings.TWITCH_REWARD_COUNTERS, 'key', counter)
                            this._twitchHelix.updateReward(await Utils.getRewardId(key), newRewardConfig)
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
                    +`: ${key}`, 'green')
                this._twitch.registerReward(reward)
            } else {
                Utils.logWithBold(`No Reward ID for <${key}>, it might be missing a reward config.`, 'red')
            }
        }

        /*
        ..######...#######..##.....##.##.....##....###....##....##.########...######.
        .##....##.##.....##.###...###.###...###...##.##...###...##.##.....##.##....##
        .##.......##.....##.####.####.####.####..##...##..####..##.##.....##.##......
        .##.......##.....##.##.###.##.##.###.##.##.....##.##.##.##.##.....##..######.
        .##.......##.....##.##.....##.##.....##.#########.##..####.##.....##.......##
        .##....##.##.....##.##.....##.##.....##.##.....##.##...###.##.....##.##....##
        ..######...#######..##.....##.##.....##.##.....##.##....##.########...######.
        */

        /*
        .######..######...####..
        ...##......##....##.....
        ...##......##.....####..
        ...##......##........##.
        ...##......##.....####..
        */
        this._twitch.registerCommand({
            trigger: Keys.COMMAND_TTS_ON,
            callback: async (userData, input) => {
                const speech = Config.controller.speechReferences[Keys.COMMAND_TTS_ON]
                const onText:string = !this._ttsForAll ? speech[0] : speech[1]
                this._ttsForAll = true
                this._tts.enqueueSpeakSentence(onText, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                this._twitchHelix.updateReward(await Utils.getRewardId(Keys.KEY_TTSSPEAK), {is_enabled: false})
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_TTS_OFF,
            callback: async (userData, input) => {
                const speech = Config.controller.speechReferences[Keys.COMMAND_TTS_OFF]
                const offText = this._ttsForAll ? speech[0] : speech[1]
                this._ttsForAll = false
                this._tts.enqueueSpeakSentence(offText, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                this._twitchHelix.updateReward(await Utils.getRewardId(Keys.KEY_TTSSPEAK), {is_enabled: true})
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_TTS_SILENCE,
            callback: (userData, input) => {
                this._tts.stopSpeaking()
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_TTS_DIE,
            callback: (userData, input) => {
                this._tts.stopSpeaking(true)
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_TTS_SAY,
            callback: (userData, input) => {
                this._tts.enqueueSpeakSentence(input, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_TTS_NICK,
            callback: (userData, input) => {
                const parts = Utils.splitOnFirst(' ', input)
                let userToRename:string = null
                let newName:string = null
                // Rename someone else
                if((userData.isBroadcaster || userData.isModerator) && parts[0].indexOf('@') > -1) { 
                    userToRename = Utils.cleanUserName(parts[0])
                    newName = parts[1].toLowerCase()
                } else { // Rename yourself
                    userToRename = userData.userName
                    newName = input.toLowerCase()
                }
                if(userToRename != null || newName != null) {                    
                    Settings.pushSetting(Settings.TTS_USER_NAMES, 'userName', {userName: userToRename, shortName: newName})
                    const speech = Config.controller.speechReferences[Keys.COMMAND_TTS_NICK]
                    this._tts.enqueueSpeakSentence(Utils.template(speech, userToRename, newName), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                }
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_TTS_MUTE,
            callback: async (userData, input) => {
                const parts = Utils.splitOnFirst(' ', input)
                const name = Utils.cleanUserName(parts[0] ?? '')
                if(name.length > 0 && name != Config.twitch.chatbotName.toLowerCase()) {
                    let reason = (parts[1] ?? '').replace('|', ' ').replace(';', ' ')
                    const blacklist: IBlacklistEntry = await Settings.pullSetting(Settings.TTS_BLACKLIST, 'userName', name)
                    const cleanName = await Utils.loadCleanName(name)                       
                    const speech = Config.controller.speechReferences[Keys.COMMAND_TTS_MUTE]
                    if(blacklist == null || blacklist.active == false) {
                        Settings.pushSetting(Settings.TTS_BLACKLIST, 'userName', { userName: name, active: true, reason: reason })
                        this._tts.enqueueSpeakSentence(Utils.template(speech[0], cleanName), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                    } else {
                        this._tts.enqueueSpeakSentence(Utils.template(speech[1], cleanName), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                    }                    
                }
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_TTS_UNMUTE,
            callback: async (userData, input) => {
                const parts = Utils.splitOnFirst(' ', input)
                const name = Utils.cleanUserName(parts[0] ?? '')
                if(name.length == 0) return
                const blacklist: IBlacklistEntry = await Settings.pullSetting(Settings.TTS_BLACKLIST, 'userName', name)
                const cleanName = await Utils.loadCleanName(name)
                const speech = Config.controller.speechReferences[Keys.COMMAND_TTS_UNMUTE]
                if(blacklist != null && blacklist.active) {
                    const reason = Utils.cleanSetting(parts[1] ?? '')
                    Settings.pushSetting(Settings.TTS_BLACKLIST, 'userName', { userName: name, active: false, reason: reason })    
                    this._tts.enqueueSpeakSentence(Utils.template(speech[0], cleanName), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                } else {
                    this._tts.enqueueSpeakSentence(Utils.template(speech[1], cleanName), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                }
            }
        })

        /*
        ..####...##..##...####...######.
        .##..##..##..##..##..##....##...
        .##......######..######....##...
        .##..##..##..##..##..##....##...
        ..####...##..##..##..##....##...
        */
        this._twitch.registerCommand({
            trigger: Keys.COMMAND_CHAT,
            callback: (userData, input) => {
                this._pipe.sendBasic(input)
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_CHAT_ON,
            callback: (userData, input) => {
                this._pipeAllChat = true
                const speech = Config.controller.speechReferences[Keys.COMMAND_CHAT_ON]
                this._tts.enqueueSpeakSentence(speech, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_CHAT_OFF,
            callback: (userData, input) => {
                this._pipeAllChat = false
                const speech = Config.controller.speechReferences[Keys.COMMAND_CHAT_OFF]
                this._tts.enqueueSpeakSentence(speech, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_PING_ON,
            callback: (userData, input) => {
                this._pingForChat = true
                this.setEmptySoundForTTS.call(this)
                const speech = Config.controller.speechReferences[Keys.COMMAND_PING_ON]
                this._tts.enqueueSpeakSentence(speech, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_PING_OFF,
            callback: (userData, input) => {
                this._pingForChat = false
                this.setEmptySoundForTTS.call(this)
                const speech = Config.controller.speechReferences[Keys.COMMAND_PING_OFF]
                this._tts.enqueueSpeakSentence(speech, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        /*
        .##.......####....####..
        .##......##..##..##.....
        .##......##..##..##.###.
        .##......##..##..##..##.
        .######...####....####..
        */
        this._twitch.registerCommand({
            trigger: Keys.COMMAND_LOG_ON,
            callback: (userData, input) => {
                this._logChatToDiscord = true
                const speech = Config.controller.speechReferences[Keys.COMMAND_LOG_ON]
                this._tts.enqueueSpeakSentence(speech, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_LOG_OFF,
            callback: (userData, input) => {
                this._logChatToDiscord = false
                const speech = Config.controller.speechReferences[Keys.COMMAND_LOG_OFF]
                this._tts.enqueueSpeakSentence(speech, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        /*
        ..####....####...##...##.
        .##..##..##..##..###.###.
        .##......######..##.#.##.
        .##..##..##..##..##...##.
        ..####...##..##..##...##.
        */
        this._twitch.registerCommand({
            trigger: Keys.COMMAND_CAMERA_ON,
            callback: (userData, input) => {
                const key = Config.controller.commandReferences[Keys.COMMAND_CAMERA_ON]
                const speech = Config.controller.speechReferences[Keys.COMMAND_CAMERA_ON]
                this._tts.enqueueSpeakSentence(speech, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                this._obs.show(Config.obs.configs[key], true)
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_CAMERA_OFF,
            callback: (userData, input) => {
                const key = Config.controller.commandReferences[Keys.COMMAND_CAMERA_OFF]
                const speech = Config.controller.speechReferences[Keys.COMMAND_CAMERA_OFF]
                this._tts.enqueueSpeakSentence(speech, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                this._obs.hide(Config.obs.configs[key])
            }
        })

        /*
        ..####....####....####...##......######.
        .##......##..##..##..##..##......##.....
        ..####...##......######..##......####...
        .....##..##..##..##..##..##......##.....
        ..####....####...##..##..######..######.
        */
        this._twitch.registerCommand({
            trigger: Keys.COMMAND_SCALE,
            callback: (userData, input) => {
                const parts = input.split(' ')
                const speech = Config.controller.speechReferences[Keys.COMMAND_SCALE]
                if(parts.length == 3) {
                    const fromScale = parseInt(parts[0])
                    const toScale = parseInt(parts[1])
                    const forMinutes = parseInt(parts[2])
                    const intervalMs = 10000 // 10s
                    const steps = forMinutes*60*1000/intervalMs
                    if(isNaN(fromScale) || isNaN(toScale) || isNaN(forMinutes)) { 
                        // Fail to start interval
                        this._tts.enqueueSpeakSentence(Utils.template(speech[3]), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                    } else { 
                        // TODO: Disable all scale rewards
                        // Launch interval
                        this._tts.enqueueSpeakSentence(Utils.template(speech[1], fromScale, toScale, forMinutes), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                        let currentScale = fromScale
                        let currentStep = 0
                        const multiple = Math.pow((toScale/fromScale), 1/steps)

                        clearInterval(this._scaleIntervalHandle)
                        this._scaleIntervalHandle = setInterval(
                            ()=>{
                                this._openvr2ws.setSetting({
                                    type: OpenVR2WS.TYPE_WORLDSCALE,
                                    value: currentScale/100.0
                                })
                                Settings.pushLabel(Settings.WORLD_SCALE_LABEL, `🌍 ${Math.round(currentScale*100)/100}%`)
                                currentScale *= multiple
                                if(currentStep == steps) {
                                    this._tts.enqueueSpeakSentence(Utils.template(speech[2]), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                                    clearInterval(this._scaleIntervalHandle)
                                    setTimeout(()=>{
                                        Settings.pushLabel(Settings.WORLD_SCALE_LABEL, "")
                                        // TODO: Enable the right scale rewards again? Maybe
                                    }, intervalMs)
                                }
                                currentStep++
                            }, 
                            intervalMs
                        )
                    }
                } else {
                    const scale = parseInt(input)
                    if(isNaN(scale) && ['reset', 'kill', 'off', 'done', 'end'].indexOf(input) > -1) { // Terminate interval
                        const speech = Config.controller.speechReferences[Keys.COMMAND_SCALE]
                        clearInterval(this._scaleIntervalHandle)
                        Settings.pushLabel(Settings.WORLD_SCALE_LABEL, "")
                        this._tts.enqueueSpeakSentence(Utils.template(speech[4]), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                    } else { // Manual setting
                        const value = Math.max(10, Math.min(1000, scale || 100))
                        this._tts.enqueueSpeakSentence(Utils.template(speech[0], value), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                        this._openvr2ws.setSetting({
                            type: OpenVR2WS.TYPE_WORLDSCALE,
                            value: value/100.0
                        })    
                    }
                }
            }
        })

        /*
        ..####...######..######...####...##...##..##..##..#####..
        .##........##....##......##..##..###.###..##..##..##..##.
        ..####.....##....####....######..##.#.##..##..##..#####..
        .....##....##....##......##..##..##...##...####...##..##.
        ..####.....##....######..##..##..##...##....##....##..##.
        */
        this._twitch.registerCommand({ // TODO: WIP - Should only work with what the headset supports
            trigger: Keys.COMMAND_BRIGHTNESS,
            callback: (userData, input) => {
                const brightness = parseInt(input) || 130
                const speech = Config.controller.speechReferences[Keys.COMMAND_BRIGHTNESS]
                const value = Math.max(0, Math.min(160, brightness)) // TODO: There are properties in SteamVR to read out for safe min/max values or if available at all! https://github.com/ValveSoftware/openvr/blob/4c85abcb7f7f1f02adaf3812018c99fc593bc341/headers/openvr.h#L475
                this._tts.enqueueSpeakSentence(Utils.template(speech, value), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                this._openvr2ws.setSetting({
                    type: OpenVR2WS.TYPE_BRIGHTNESS,
                    value: value/100.0
                })
            }
        })

        this._twitch.registerCommand({ // TODO: WIP - Should only work with what the headset supports
            trigger: Keys.COMMAND_REFRESHRATE,
            callback: (userData, input) => {
                const validRefreshRates = [80, 90, 120, 144] // TODO: Load from OpenVR2WS so we don't set unsupported frame-rates as it breaks the headset.
                const possibleRefreshRate = parseInt(input) || 120
                const refreshRate = (validRefreshRates.indexOf(possibleRefreshRate) != -1) ? possibleRefreshRate : 120
                const speech = Config.controller.speechReferences[Keys.COMMAND_REFRESHRATE]
                const value = Math.max(0, Math.min(160, refreshRate)) // TODO: Are there also properties for supported frame-rates?! https://github.com/ValveSoftware/openvr/blob/4c85abcb7f7f1f02adaf3812018c99fc593bc341/headers/openvr.h#L470
                this._tts.enqueueSpeakSentence(Utils.template(speech, value), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                this._openvr2ws.setSetting({
                    type: OpenVR2WS.TYPE_REFRESHRATE,
                    value: value
                })
            }
        })

        this._twitch.registerCommand({ // Currently not actually effective due to how the VR View does not listen to config changes
            trigger: Keys.COMMAND_VRVIEWEYE,
            callback: (userData, input) => {
                const eyeMode = parseInt(input) || 4
                const speech = Config.controller.speechReferences[Keys.COMMAND_VRVIEWEYE]
                const value = Math.max(0, Math.min(5, eyeMode))
                this._tts.enqueueSpeakSentence(Utils.template(speech, value), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                this._openvr2ws.setSetting({
                    type: OpenVR2WS.TYPE_VRVIEWEYE,
                    value: value
                })
            }
        })

        /*
        .#####...######...####...######..######...####...##..##...####...#####...##..##.
        .##..##....##....##..##....##......##....##..##..###.##..##..##..##..##...####..
        .##..##....##....##........##......##....##..##..##.###..######..#####.....##...
        .##..##....##....##..##....##......##....##..##..##..##..##..##..##..##....##...
        .#####...######...####.....##....######...####...##..##..##..##..##..##....##...
        */
        this._twitch.registerCommand({
            trigger: Keys.COMMAND_DICTIONARY,
            callback: async (userData, input) => {
                const words = Utils.splitOnFirst(' ', input)
                const speech = Config.controller.speechReferences[Keys.COMMAND_DICTIONARY]
                if(words.length == 2 && words[1].trim().length > 0) {
                    Settings.pushSetting(Settings.TTS_DICTIONARY, 'original', {original: words[0].toLowerCase(), substitute: words[1].toLowerCase()})
                    this._tts.setDictionary(<IDictionaryPair[]> Settings.getFullSettings(Settings.TTS_DICTIONARY))
                    this._tts.enqueueSpeakSentence(Utils.template(speech[0], words[0], words[1]), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT, '', null, [], true)
                } else { // Messed up
                    Utils.loadCleanName(userData.userName).then(cleanName => {
                        this._tts.enqueueSpeakSentence(Utils.template(speech[1], cleanName), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                    })
                }
            }
        })

        /*
        .#####...######..##...##...####...#####...#####....####..
        .##..##..##......##...##..##..##..##..##..##..##..##.....
        .#####...####....##.#.##..######..#####...##..##...####..
        .##..##..##......#######..##..##..##..##..##..##......##.
        .##..##..######...##.##...##..##..##..##..#####....####..
        */
        this._twitch.registerCommand({
            trigger: Keys.COMMAND_UPDATEREWARDS,
            callback: async (userData, input) => {
                let storedRewards:ITwitchRewardPair[] = Settings.getFullSettings(Settings.TWITCH_REWARDS)
                if(storedRewards == undefined) storedRewards = []
                for(const pair of storedRewards) {
                    const configArrOrNot = Config.twitch.rewardConfigs[pair.key]
                    const config = Array.isArray(configArrOrNot) ? configArrOrNot[0] : configArrOrNot
                    if(config != undefined && Config.twitch.skipUpdatingRewards.indexOf(pair.key) == -1) {
                        const response = await this._twitchHelix.updateReward(pair.id, config)
                        if(response != null && response.data != null) {
                            const success = response?.data[0]?.id == pair.id
                            Utils.logWithBold(`Reward <${pair.key}> updated: <${success?'YES':'NO'}>`, success ? Color.Green : Color.Red)
                            
                            // If update was successful, also reset incremental setting as the reward should have been reset.
                            if(Array.isArray(configArrOrNot)) {
                                const reset: ITwitchRewardCounter = {key: pair.key, count: 0}
                                Settings.pushSetting(Settings.TWITCH_REWARD_COUNTERS, 'key', reset)
                            }
                        } else {
                            Utils.logWithBold(`Reward <${pair.key}> update unsuccessful.`, Color.Red)
                        }                       
                    } else {
                        Utils.logWithBold(`Reward <${pair.key}> update skipped or unavailable.`, Color.Purple)
                    }
                }
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_GAMEREWARDS_ON,
            callback: (userData, input) => {
                this._useGameSpecificRewards = true
                const speech = Config.controller.speechReferences[Keys.COMMAND_GAMEREWARDS_ON]
                this._tts.enqueueSpeakSentence(speech, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                this.appIdCallback(this._lastSteamAppId)
            }
        })
        
        this._twitch.registerCommand({
            trigger: Keys.COMMAND_GAMEREWARDS_OFF,
            callback: (userData, input) => {
                this._useGameSpecificRewards = false
                const speech = Config.controller.speechReferences[Keys.COMMAND_GAMEREWARDS_OFF]
                this._tts.enqueueSpeakSentence(speech, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                this.appIdCallback('')
            }
        })

        /*
        .######..######..##...##..#####..
        ...##....##......###.###..##..##.
        ...##....####....##.#.##..#####..
        ...##....##......##...##..##.....
        ...##....######..##...##..##.....
        */
        this._twitch.registerCommand({
            trigger: Keys.COMMAND_SOURCESCREENSHOT,
            callback: (userData, input) => {
                // TODO: Add SSSVR support here for Doc? Also perhaps move all screenshot functionality
                if(input.length > 0) {
                    const nonce = Utils.getNonce('TTS')
                    const speech = Config.controller.speechReferences[Keys.KEY_SCREENSHOT] // TODO: Separate key here?
                    this._tts.enqueueSpeakSentence(Utils.template(speech, input), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT, nonce)
                    this._nonceCallbacks[nonce] = ()=>{
                        setTimeout(()=>{
                            const requestData:IScreenshotRequestData = { rewardKey: '', userId: parseInt(userData.userId), userName: userData.userName, userInput: input }
                            this._obs.takeSourceScreenshot(requestData)
                        }, Config.screenshots.delayOnDescription*1000)
                    }
                } else {
                    this._obs.takeSourceScreenshot({ rewardKey: '', userId: parseInt(userData.userId), userName: userData.userName, userInput: '' })
                }
            }
        })

        /*
        ..####...##..##...####...######..######..##...##.
        .##.......####...##........##....##......###.###.
        ..####.....##.....####.....##....####....##.#.##.
        .....##....##........##....##....##......##...##.
        ..####.....##.....####.....##....######..##...##.
        */
        this._twitch.registerCommand({
            trigger: Keys.COMMAND_RELOADWIDGET,
            callback: (userData, input) => {
                window.location.reload();
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_CHANNELTROPHY_STATS,
            callback: async (userData, input) => {
                const speech = Config.controller.speechReferences[Keys.COMMAND_CHANNELTROPHY_STATS]
                const numberOfStreams = await ChannelTrophy.getNumberOfStreams()
                const streamNumber = parseInt(input)
				if(input == "all") {
                    this._tts.enqueueSpeakSentence(speech[0], Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                    for(let i=0; i<numberOfStreams; i++) {
                        const embeds = await ChannelTrophy.createStatisticsEmbedsForDiscord(this._twitchHelix, i)
                        this._discord.sendPayload(Config.credentials.DiscordWebhooks[Keys.COMMAND_CHANNELTROPHY_STATS], {
                            content: Utils.numberToDiscordEmote(i+1, true),
                            embeds: embeds
                        })
                        await Utils.delay(5000)
                    }
                    this._tts.enqueueSpeakSentence(speech[1], Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                } else if (!isNaN(streamNumber)) {
                    this._tts.enqueueSpeakSentence(speech[2], Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
					const embeds = await ChannelTrophy.createStatisticsEmbedsForDiscord(this._twitchHelix, streamNumber-1)
					const response = await this._discord.sendPayload(Config.credentials.DiscordWebhooks[Keys.COMMAND_CHANNELTROPHY_STATS], {
                        content: Utils.numberToDiscordEmote(streamNumber, true),
						embeds: embeds
					})
                    this._tts.enqueueSpeakSentence(speech[response != null ? 3 : 4], Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
				} else {
                    this._tts.enqueueSpeakSentence(speech[2], Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
					const embeds = await ChannelTrophy.createStatisticsEmbedsForDiscord(this._twitchHelix)
					const response = await this._discord.sendPayload(Config.credentials.DiscordWebhooks[Keys.COMMAND_CHANNELTROPHY_STATS], {
                        content: Utils.numberToDiscordEmote(numberOfStreams, true),
						embeds: embeds
					})
                    this._tts.enqueueSpeakSentence(speech[response != null ? 3 : 4], Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
				}
            }
        })

        this._twitch.registerCommand({
            trigger: "t",
            callback: async (userData, input) => {
                // this._pipe.showPreset(Config.pipe.configs[Keys.KEY_MIXED_HYDRATE])
                this._pipe.sendBasic(input, userData.displayName)
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_CLIPS,
            callback: async (userData, input) => {
                const pageCount = 20
                let lastCount = pageCount
                const oldClips:ITwitchClip[] = await Settings.getFullSettings(Settings.TWITCH_CLIPS)
                const speech = Config.controller.speechReferences[Keys.COMMAND_CLIPS]
                this._tts.enqueueSpeakSentence(Utils.template(speech[0]), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)

                // Get all clips
                const allClips:ITwitchHelixClipResponseData[] = []
                let pagination:string = undefined
                let i = 0
                while(i == 0 || (pagination != null && pagination.length > 0)) {
                    const clipsResponse = await this._twitchHelix.getClips(pageCount, pagination)
                    allClips.push(...clipsResponse.data)
                    lastCount = clipsResponse.data.length
                    pagination = clipsResponse.pagination?.cursor
                    i++
                }
                const oldClipIds = oldClips == undefined ? [] : oldClips.map((clip)=>{
                    return clip.id
                })
                const newClips = allClips.filter((clip)=>{
                    return oldClipIds.indexOf(clip.id) == -1
                })
                const sortedClips = newClips.sort((a,b)=>{
                    return Date.parse(a.created_at) - Date.parse(b.created_at)
                })
                this._tts.enqueueSpeakSentence(Utils.template(speech[1], oldClipIds.length, newClips.length), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)

                // Post to Discord
                let count = oldClipIds.length+1
                for(const clip of sortedClips) {
                    await Utils.delay(5000);
                    let user = await this._twitchHelix.getUserById(parseInt(clip.creator_id))
                    let game = await this._twitchHelix.getGameById(parseInt(clip.game_id))
                    let response = await this._discord.sendPayload(Config.credentials.DiscordWebhooks[Keys.COMMAND_CLIPS], {
                        username: user?.display_name ?? '[Deleted User]',
                        avatar_url: user?.profile_image_url ?? '',
                        content: [
                            Utils.numberToDiscordEmote(count++, true),
                            `**Title**: ${clip.title}`,
                            `**Creator**: ${user?.display_name ?? '[Deleted User]'}`,
                            `**Created**: ${Utils.getDiscordTimetag(clip.created_at)}`,
                            `**Game**: ${game != undefined ? game.name : 'N/A'}`,
                            `**Link**: ${clip.url}`
                        ].join("\n")
                    })
                    if(response != null) Settings.pushSetting(Settings.TWITCH_CLIPS, 'id', {id: clip.id})
                    else break // Something is broken, don't post things out of order by stopping.
                }
                this._tts.enqueueSpeakSentence(Utils.template(speech[2], count-1-oldClipIds.length), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        /*
        .#####...##..##..#####...##......######...####..
        .##..##..##..##..##..##..##........##....##..##.
        .#####...##..##..#####...##........##....##.....
        .##......##..##..##..##..##........##....##..##.
        .##.......####...#####...######..######...####..
        */
        this._twitch.registerCommand({
            trigger: Keys.COMMAND_GAME,
            cooldown: 3*60,
            cooldownCallback: async (userData, input) => {
                if(this._lastSteamAppId != undefined) {
                    const gameData = await SteamStore.getGameMeta(this._lastSteamAppId)
                    const price = SteamStore.getPrice(gameData)
                    const releaseDate = gameData.release_date?.date ?? 'N/A'
                    const name = gameData.name ?? 'N/A'
                    const link = gameData.steam_appid != undefined ? `https://store.steampowered.com/app/${gameData.steam_appid}` : 'N/A'
                    this._twitch._twitchChat.sendMessageToChannel(`Game: ${name} - Released: ${releaseDate} - Price: ${price} - Link: ${link}`)
                    this._sign.enqueueSign({
                        title: 'Current Game',
                        image: gameData.header_image,
                        subtitle: `${name}\n${price}`,
                        durationMs: 10000
                    })
                }
            }
        })

        /*
        ..######.....###....##.......##.......########.....###.....######..##....##..######.
        .##....##...##.##...##.......##.......##.....##...##.##...##....##.##...##..##....##
        .##........##...##..##.......##.......##.....##..##...##..##.......##..##...##......
        .##.......##.....##.##.......##.......########..##.....##.##.......#####.....######.
        .##.......#########.##.......##.......##.....##.#########.##.......##..##.........##
        .##....##.##.....##.##.......##.......##.....##.##.....##.##....##.##...##..##....##
        ..######..##.....##.########.########.########..##.....##..######..##....##..######.
        */

        /*
        ..####...##..##...####...######.
        .##..##..##..##..##..##....##...
        .##......######..######....##...
        .##..##..##..##..##..##....##...
        ..####...##..##..##..##....##...
        */
        this._twitch.registerAnnouncement({
            userName: Config.twitch.announcerName.toLowerCase(),
            triggers: Config.twitch.announcerTriggers,
            callback: async (userData, messageData, firstWord) => {
                // TTS
                if(Config.audioplayer.configs.hasOwnProperty(firstWord)) {
                    this._tts.enqueueSoundEffect(Config.audioplayer.configs[firstWord])
                }
                this._tts.enqueueSpeakSentence(messageData.text, userData.userName, GoogleTTS.TYPE_ANNOUNCEMENT)

                // Pipe to VR (basic)
                const user = await this._twitchHelix.getUserById(parseInt(userData.userId))
                this._pipe.sendBasicObj(messageData, userData, user)
            }
        })

        this._twitch.setChatCheerCallback(async (userData, messageData) => {
            const clearRanges = TwitchFactory.getEmotePositions(messageData.emotes)
            // TTS
            this._tts.enqueueSpeakSentence(messageData.text, userData.userName, GoogleTTS.TYPE_CHEER, Utils.getNonce('TTS'), messageData.bits, clearRanges)

            // Pipe to VR (basic)
            const user = await this._twitchHelix.getUserById(parseInt(userData.userId))
            this._pipe.sendBasicObj(messageData, userData, user)
        })

        this._twitch.setChatCallback(async (userData, messageData) => {
            const clearRanges = TwitchFactory.getEmotePositions(messageData.emotes)
            let type = GoogleTTS.TYPE_SAID
            if(messageData.isAction) type = GoogleTTS.TYPE_ACTION
            
            if(this._ttsForAll) { 
                // TTS is on for everyone
                this._tts.enqueueSpeakSentence(messageData.text, userData.userName, type, null, Utils.getNonce('TTS'), clearRanges)
            } else if(this._ttsEnabledUsers.indexOf(userData.userName) > -1) {
                // Reward users
                this._tts.enqueueSpeakSentence(messageData.text, userData.userName, type, null, Utils.getNonce('TTS'), clearRanges)
            } else if(this._pingForChat && Config.audioplayer.configs[Keys.KEY_MIXED_CHAT] != null) {
                // Chat sound
                const soundEffect = Config.audioplayer.configs[Keys.KEY_MIXED_CHAT]
                if(!Utils.matchFirstChar(messageData.text, Config.controller.secretChatSymbols)) this._tts.enqueueSoundEffect(soundEffect)
            }

            // Pipe to VR (basic)
            if(this._pipeAllChat) {
                const user = await this._twitchHelix.getUserById(parseInt(userData.userId))
                this._pipe.sendBasicObj(messageData, userData, user)
            }
        })

        this._twitch.setAllChatCallback((message:ITwitchMessageCmd) => {
            const rewardId = message?.properties?.["custom-reward-id"]           
            if(rewardId) return // Skip rewards as handled elsewhere
            const bits = parseInt(message?.properties?.bits)
            
            // Discord
            this._twitchHelix.getUserById(parseInt(message?.properties["user-id"])).then(user => {
                let text = message?.message?.text
                if(text == null || text.length == 0) return

                // Format text
                let logText = Utils.escapeForDiscord(text)
                if(message?.message?.isAction) logText = `_${logText}_`
                
                // Label messages with bits
                let label = ''
                if(!isNaN(bits) && bits > 0) {
                    const unit = bits == 1 ? 'bit' : 'bits'
                    label = `${Config.discord.prefixCheer}**Cheered ${bits} ${unit}**: `
                }
                
                // TODO: Add more things like sub messages? Need to check that from raw logs.
                // TODO: Reference Jeppe's twitch logger for the other messages! :D
                
                if(this._logChatToDiscord) {
                    this._discord.sendMessage(
                        Config.credentials.DiscordWebhooks[Keys.KEY_DISCORD_CHAT],
                        user?.display_name,
                        user?.profile_image_url,
                        `${label}${logText}`
                    )
                }
            })
        })

        /*
        .#####...######..##...##...####...#####...#####....####..
        .##..##..##......##...##..##..##..##..##..##..##..##.....
        .#####...####....##.#.##..######..#####...##..##...####..
        .##..##..##......#######..##..##..##..##..##..##......##.
        .##..##..######...##.##...##..##..##..##..#####....####..
        */
        // This callback was added as rewards with no text input does not come in through the chat callback
        this._twitch.setAllRewardsCallback(async (message:ITwitchRedemptionMessage) => {
            const user = await this._twitchHelix.getUserById(parseInt(message.redemption.user.id))          
            const rewardPair:ITwitchRewardPair = await Settings.pullSetting(Settings.TWITCH_REWARDS, 'id', message.redemption.reward.id)

            // Discord
            const amount = message.redemption.reward.redemptions_redeemed_current_stream
            const amountStr = amount != null ? ` #${amount}` : ''
            let description = `${Config.discord.prefixReward}**${message.redemption.reward.title}${amountStr}** (${message.redemption.reward.cost})`
            if(message.redemption.user_input) description += `: ${Utils.escapeForDiscord(Utils.fixLinks(message.redemption.user_input))}`
            if(this._logChatToDiscord) {
                this._discord.sendMessage(
                    Config.credentials.DiscordWebhooks[Keys.KEY_DISCORD_CHAT],
                    user?.display_name,
                    user?.profile_image_url,
                    description
                )
            }
            const rewardSpecificWebhook = Config.credentials.DiscordWebhooks[rewardPair.key] || null
            if(rewardSpecificWebhook != null) {
                this._discord.sendMessage(
                    rewardSpecificWebhook,
                    user?.display_name,
                    user?.profile_image_url,
                    description
                )
            }

            // Pipe to VR (basic)
            const showReward = Config.pipe.showRewardsWithKeys.indexOf(rewardPair.key) > -1
            if(showReward) {
                this._pipe.sendBasic(
                    message.redemption.user_input, 
                    user?.display_name, 
                    TwitchFactory.userColors[message.redemption.user.id] ?? Color.White,
                    user.profile_image_url
                )
            }
        })

        /*
        ..####....####...#####...######..######..##..##...####...##..##...####...######...####..
        .##......##..##..##..##..##......##......###.##..##......##..##..##..##....##....##.....
        ..####...##......#####...####....####....##.###...####...######..##..##....##.....####..
        .....##..##..##..##..##..##......##......##..##......##..##..##..##..##....##........##.
        ..####....####...##..##..######..######..##..##...####...##..##...####.....##.....####..
        */
        this._screenshots.setScreenshotCallback(async (responseData) => {
            const requestData = responseData.nonce 
                ? this._screenshots.getScreenshotRequest(parseInt(responseData.nonce))
                : null
            const discordCfg = Config.credentials.DiscordWebhooks[Keys.KEY_DISCORD_SSSVR]
            const blob = Utils.b64toBlob(responseData.image)
            const dataUrl = Utils.b64ToDataUrl(responseData.image)
            const gameData = await SteamStore.getGameMeta(this._openvr2ws._currentAppId)
            const gameTitle = gameData != null ? gameData.name : this._openvr2ws._currentAppId
            if(requestData != null) {
                const userData = await this._twitchHelix.getUserById(requestData.userId)
                const authorName = userData?.display_name ?? ''
                
                // Discord
                const description = requestData.userInput
                const authorUrl = `https://twitch.tv/${userData.login ?? ''}`
                const authorIconUrl = userData?.profile_image_url ?? ''
                const color = Utils.hexToDecColor(
                    TwitchFactory.userColors[requestData.userId] ?? Config.discord.remoteScreenshotEmbedColor
                )
                const descriptionText = description?.trim().length > 0
                    ? Utils.template(Config.screenshots.callback.discordRewardTitle, description) 
                    : Config.screenshots.callback.discordRewardInstantTitle
                this._discord.sendPayloadEmbed(discordCfg, blob, color, descriptionText, authorName, authorUrl, authorIconUrl, gameTitle)

                // Sign
                this._sign.enqueueSign({
                    title: Config.screenshots.callback.signTitle,
                    image: dataUrl,
                    subtitle: authorName,
                    durationMs: Config.screenshots.callback.signDurationMs
                })
            } else {
                // Discord
                const color = Utils.hexToDecColor(Config.discord.manualScreenshotEmbedColor)
                this._discord.sendPayloadEmbed(discordCfg, blob, color, Config.screenshots.callback.discordManualTitle, null, null, null, gameTitle)

                // Sign
                this._sign.enqueueSign({
                    title: Config.screenshots.callback.signTitle,
                    image: dataUrl,
                    subtitle: Config.screenshots.callback.signManualSubtitle,
                    durationMs: Config.screenshots.callback.signDurationMs
                })
            }

            // Pipe
            if(
                Config.screenshots.callback.pipeEnabledForRewards.includes(requestData?.rewardKey)
                || (requestData == null && Config.screenshots.callback.pipeEnabledForManual)
            ) {
                const preset = Config.screenshots.callback.pipeMessagePreset
                if(preset != undefined) {
                    const configClone: IPipeCustomMessage = Utils.clone(preset.config)
                    configClone.imageData = responseData.image
                    configClone.customProperties.durationMs = preset.durationMs
                    if(configClone.customProperties.textAreas.length > 0) {
                        configClone.customProperties.textAreas[0].text = `${responseData.width}x${responseData.height}`
                    }
                    if(requestData != null && configClone.customProperties.textAreas.length > 1) {
                        const userData = await this._twitchHelix.getUserById(requestData.userId)
                        const title = requestData.userInput 
                            ? `"${requestData.userInput}"\n${userData.display_name}`
                            : userData.display_name
                        configClone.customProperties.textAreas[1].text = title
                    }
                    this._pipe.sendCustom(configClone)
                }
            }
        })

        this._obs.registerSourceScreenshotCallback(async (img, requestData) => {
            const b64data = img.split(',').pop()
            const discordCfg = Config.credentials.DiscordWebhooks[Keys.COMMAND_SOURCESCREENSHOT]
            const blob = Utils.b64toBlob(b64data)
            const dataUrl = Utils.b64ToDataUrl(b64data)

            if(requestData != null) {
                const gameData = await SteamStore.getGameMeta(this._openvr2ws._currentAppId)
                const gameTitle = gameData != null ? gameData.name : Config.obs.sourceScreenshotConfig.discordGameTitle

                const userData = await this._twitchHelix.getUserById(requestData.userId)
                const authorName = userData?.display_name ?? ''
                        
                // Discord
                const description = requestData.userInput
                const authorUrl = `https://twitch.tv/${userData.login ?? ''}`
                const authorIconUrl = userData?.profile_image_url ?? ''
                const color = Utils.hexToDecColor(
                    TwitchFactory.userColors[requestData.userId] ?? Config.discord.remoteScreenshotEmbedColor
                )
                const descriptionText = description?.trim().length > 0
                ? Utils.template(Config.screenshots.callback.discordRewardTitle, description) 
                : Config.obs.sourceScreenshotConfig.discordDescription
                this._discord.sendPayloadEmbed(discordCfg, blob, color, descriptionText, authorName, authorUrl, authorIconUrl, gameTitle)

                // Sign
                this._sign.enqueueSign({
                    title: Config.screenshots.callback.signTitle,
                    image: dataUrl,
                    subtitle: authorName,
                    durationMs: Config.screenshots.callback.signDurationMs
                })

                // Sound effect
                const soundConfig = Config.audioplayer.configs[Keys.COMMAND_SOURCESCREENSHOT]
                if(soundConfig != undefined) this._audioPlayer.enqueueAudio(soundConfig)
            }
        })

        /*
        ..####...#####....####..
        .##..##..##..##..##.....
        .##..##..#####....####..
        .##..##..##..##......##.
        ..####...#####....####..
        */
        this._obs.registerSceneChangeCallback((sceneName) => {
            // let filterScene = Config.obs.filterOnScenes.indexOf(sceneName) > -1
            // this._ttsForAll = !filterScene
        })

        /*
        ..####...##..##..#####...######...####..
        .##..##..##..##..##..##....##....##..##.
        .######..##..##..##..##....##....##..##.
        .##..##..##..##..##..##....##....##..##.
        .##..##...####...#####...######...####..
        */
        this._audioPlayer.setPlayedCallback((nonce:string, status:number) => {
            console.log(`Audio Player: Nonce finished playing -> ${nonce} [${status}]`)
            const callback = this._nonceCallbacks[nonce] || null
            if(callback != null) {
                if(status == AudioPlayer.STATUS_OK) callback()
                delete this._nonceCallbacks[nonce]
            }
        })

        this._tts.setHasSpokenCallback((nonce:string, status:number) => {
            console.log(`TTS: Nonce finished playing -> ${nonce} [${status}]`)
            const callback = this._nonceCallbacks[nonce] || null
            if(callback != null) {
                if(status == AudioPlayer.STATUS_OK) callback()
                delete this._nonceCallbacks[nonce]
            }
        })

        /*
        .##..##..#####..
        .##..##..##..##.
        .##..##..#####..
        ..####...##..##.
        ...##....##..##.
        */
        this._openvr2ws.setInputCallback((key, data) => {
            switch(data.input) {
                case "Proximity": if(data.source == 'Head') {
                    // TODO: This is unreliable as it does not always register, and dashboard will mess it up.
                    // this._obs.toggleSource(Config.obs.rewards[Keys.KEY_ROOMPEEK], !data.value)
                    console.log(`OpenVR2WS: Headset proximity changed: ${data.value}`)
                }
            }
        })

        this._openvr2ws.setStatusCallback((status) => {
            if(status) {
                console.log('OpenVR2WS: Connected')
                // We are playing VR so we're scrapping the WebApi timer.
                clearInterval(this._steamPlayerSummaryIntervalHandle)
            } else {
                console.log('OpenVR2WS: Disconnected')
                // We do not get the app ID from OpenVR2WS so we use the Steam Web API instead.
                this.startSteamPlayerSummaryInterval()
            }
        })

        /*
        ..####...#####...#####...........######..#####..
        .##..##..##..##..##..##............##....##..##.
        .######..#####...#####.............##....##..##.
        .##..##..##......##................##....##..##.
        .##..##..##......##..............######..#####..
        */
        this._openvr2ws.setAppIdCallback(async (appId) => {
            this.appIdCallback.call(this, appId)
        })

        /*
        .####.##....##.####.########
        ..##..###...##..##.....##...
        ..##..####..##..##.....##...
        ..##..##.##.##..##.....##...
        ..##..##..####..##.....##...
        ..##..##...###..##.....##...
        .####.##....##.####....##...
        */
        this._twitch.init(Config.controller.websocketsUsed.twitchChat, Config.controller.websocketsUsed.twitchPubsub)
        if(Config.controller.websocketsUsed.openvr2ws) this._openvr2ws.init()
        if(Config.controller.websocketsUsed.pipe) this._pipe.init()
        if(Config.controller.websocketsUsed.obs) this._obs.init()
        if(Config.controller.websocketsUsed.screenshots) this._screenshots.init()
    }

    /*
    .########.##.....##.##....##..######..########.####..#######..##....##..######.
    .##.......##.....##.###...##.##....##....##.....##..##.....##.###...##.##....##
    .##.......##.....##.####..##.##..........##.....##..##.....##.####..##.##......
    .######...##.....##.##.##.##.##..........##.....##..##.....##.##.##.##..######.
    .##.......##.....##.##..####.##..........##.....##..##.....##.##..####.......##
    .##.......##.....##.##...###.##....##....##.....##..##.....##.##...###.##....##
    .##........#######..##....##..######.....##....####..#######..##....##..######.
    */
    private setEmptySoundForTTS() {
        const audio = this._pingForChat ? Config.audioplayer.configs[Keys.KEY_MIXED_CHAT] : null           
        this._tts.setEmptyMessageSound(audio)
    }

    private async appIdCallback(appId: string) {
        // Skip if we should ignore this app ID.
        if(Config.steam.ignoredAppIds.indexOf(appId) !== -1) return console.log(`Steam: Ignored AppId: ${appId}`)

        // Skip if it's the last app ID again.
        if(appId != undefined && appId.length > 0) {
            if(appId == this._lastSteamAppId) return
            console.log(`Steam AppId changed: ${appId}`)
            this._lastSteamAppId = appId
        }

        /**
         * Controller defaults loading
         */
        if(appId != undefined) {
            const controllerGameDefaults = Config.controller.gameDefaults[appId]
            let combinedSettings = Config.controller.defaults
            if(controllerGameDefaults != undefined) {
                combinedSettings = {...combinedSettings, ...controllerGameDefaults}
                Utils.log(`Applying controller settings for: ${appId}`, Color.Green )
            } else {
                Utils.log(`Applying default, as no controller settings for: ${appId}`, Color.Green )
            }
            
            // TTS runs the command due to doing more things than just toggling the flag.
            this._twitch.runCommand(combinedSettings.ttsForAll ? Keys.COMMAND_TTS_ON : Keys.COMMAND_TTS_OFF)
            this._pipeAllChat = combinedSettings.pipeAllChat
            this._pingForChat = combinedSettings.pingForChat
            this.setEmptySoundForTTS.call(this) // Needed as that is down in a module and does not read the fla directly.
            this._logChatToDiscord = combinedSettings.logChatToDiscord
            this._useGameSpecificRewards = combinedSettings.useGameSpecificRewards // OBS: Running the command for this will create infinite loop.
            this._updateTwitchGameCategory = combinedSettings.updateTwitchGameCategory
        }

        /**
         * General reward toggling
         */
        const defaultProfile = Config.twitch.rewardConfigProfileDefault
        const profile = Config.twitch.rewardConfigProfilePerGame[appId]
        if(appId == undefined) {
            Utils.log(`Applying profile for no game as app ID was undefined`, Color.Green)
            this._twitchHelix.toggleRewards({...defaultProfile, ...Config.twitch.rewardConfigProfileNoGame})
        } else if(profile != undefined) {
            Utils.log(`Applying game reward profile for: ${appId}`, Color.Green)
            this._twitchHelix.toggleRewards({...defaultProfile, ...profile})
        } else {
            Utils.log(`Applying default, as no game reward profile for: ${appId}`, Color.Green)
            this._twitchHelix.toggleRewards(defaultProfile)
        }

        /**
         * Game specific reward configuration
         */
        const allGameRewardKeys = Config.twitch.gameSpecificRewards
        const gameSpecificRewards = this._useGameSpecificRewards ? Config.twitch.gameSpecificRewardsPerGame[appId] : undefined
        const availableRewardKeys = gameSpecificRewards != undefined ? Object.keys(gameSpecificRewards) : []

        /**
         * Toggle individual rewards on/off depending on the app ID
         */
        for(const rewardKey of Object.keys(Config.twitch.turnOnRewardForGames)) {
            const games = Config.twitch.turnOnRewardForGames[rewardKey] ?? []
            Utils.log(`Toggling reward <${rewardKey}> depending on game.`, Color.Green)
            this._twitchHelix.toggleRewards({[rewardKey]: games.indexOf(appId) != -1})
        }
        for(const rewardKey of Object.keys(Config.twitch.turnOffRewardForGames)) {
            const games = Config.twitch.turnOffRewardForGames[rewardKey] ?? []
            Utils.log(`Toggling reward <${rewardKey}> depending on game.`, Color.Green)
            this._twitchHelix.toggleRewards({[rewardKey]: games.indexOf(appId) == -1})
        }

        // Update rewards

        // Disable all resuable generic rewards that are not in use.
        const unavailableRewardKeys = allGameRewardKeys.filter((key) => !availableRewardKeys.includes(key))
        for(const rewardKey of unavailableRewardKeys) {
            const rewardId = await Utils.getRewardId(rewardKey)
            Utils.log(`Disabling reward: <${rewardKey}:${rewardId}>`, 'red')
            this._twitchHelix.updateReward(rewardId, {
                is_enabled: false
            })
        }

        // Update and enable all reusable generic rewards in use.
        for(const rewardKey in gameSpecificRewards) {
            const rewardId = await Utils.getRewardId(rewardKey)
            const rewardConfig = gameSpecificRewards[rewardKey]
            Utils.logWithBold(`Updating reward: <${rewardKey}:${rewardId}>`, 'purple')
            this._twitchHelix.updateReward(rewardId, {
                ...rewardConfig,
                ...{is_enabled: true}
            })
        }

        // Update reward callbacks
        const runConfigs = Config.run.gameSpecificConfigs[appId]
        for(const rewardKey in gameSpecificRewards) {
            const rewardId = await Utils.getRewardId(rewardKey)
            const runConfig = runConfigs[rewardKey]
            if(runConfig != undefined) {
                this._twitch.registerReward({
                    id: rewardId,
                    callback: this.buildRunCallback(this, runConfig)
                })
            } else Utils.logWithBold(`Could not find run config for <${appId}:${rewardKey}>`, 'red')
        }

        // Show game in sign
        if(appId != undefined) {
            const gameData = await SteamStore.getGameMeta(appId)
            const price = SteamStore.getPrice(gameData)
            const name = gameData.name ?? 'N/A'
            this._sign.enqueueSign({
                title: 'Current Game',
                image: gameData.header_image,
                subtitle: `${name}\n${price}`,
                durationMs: 20000
            })
        }

        // Update category on Twitch
        if(appId != undefined && this._updateTwitchGameCategory) {
            const gameData = await SteamStore.getGameMeta(appId)
            let twitchGameData = await this._twitchHelix.searchForGame(gameData.name)
            if(twitchGameData == null && typeof gameData.name == 'string') {
                let nameParts = gameData.name.split(' ')
                if(nameParts.length >= 2) {
                    // This is to also match games that are "name VR" on Steam but "name" on Twitch
                    // so we effectively trim off VR and see if we get a match.
                    nameParts.pop()
                    twitchGameData = await this._twitchHelix.searchForGame(nameParts.join(' '))
                }
            }
            if(twitchGameData == null) {
                // If still no Twitch match, we load a possible default category.
                twitchGameData = await this._twitchHelix.searchForGame(Config.controller.defaultTwitchGameCategory)
            }
            if(twitchGameData != undefined) {
                const request: ITwitchHelixChannelRequest = {
                    game_id: twitchGameData.id
                }
                const response = await this._twitchHelix.updateChannelInformation(request)
                const speech = Config.controller.speechReferences[Keys.KEY_CALLBACK_APPID]
                Utils.log(`Steam title: ${gameData.name} -> Twitch category: ${twitchGameData.name}`, Color.RoyalBlue)
                if(response) {
                    this._tts.enqueueSpeakSentence(Utils.template(speech[0], twitchGameData.name), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                } else {
                    this._tts.enqueueSpeakSentence(Utils.template(speech[1], gameData.name), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                }
            } else {
                Utils.log(`Steam title: ${gameData.name} did not match any Twitch Category`, Color.Red)
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

    private buildOBSCallback(_this: MainController, config: IObsSourceConfig|undefined): ITwitchRedemptionCallback|null {
        if(config) return (message: ITwitchRedemptionMessage) => {
            console.log("OBS Reward triggered")
            _this._obs.show(config)
        } 
        else return null
    }

    private buildColorCallback(_this: MainController, config: IPhilipsHueColorConfig|IPhilipsHueColorConfig[]|undefined): ITwitchRedemptionCallback|null {
        if(config) return (message: ITwitchRedemptionMessage) => {
            const cfg = Array.isArray(config) ? Utils.randomFromArray(config) : config
            const userName = message?.redemption?.user?.login
            _this._tts.enqueueSpeakSentence('changed the color', userName, GoogleTTS.TYPE_ACTION)
            const lights:number[] = Config.philipshue.lightsIds
            lights.forEach(light => {
                _this._hue.setLightState(light, cfg.x, cfg.y)
            })
        }
        else return null
    }

    private buildPlugCallback(_this: MainController, config: IPhilipsHuePlugConfig|undefined): ITwitchRedemptionCallback|null {
        if(config) return (message: ITwitchRedemptionMessage) => {
            _this._hue.runPlugConfig(config)
        }
        else return null
    }
    
    private buildSoundAndSpeechCallback(_this: MainController, config: IAudio|undefined, speech:string|string[]|undefined, onTtsQueue:boolean = false):ITwitchRedemptionCallback|null {
        if(config || speech) return (message: ITwitchRedemptionMessage, index: number) => {
            let ttsString: string = undefined
            if(Array.isArray(speech) || typeof speech == 'string') {
                ttsString = index != undefined && Array.isArray(speech) && speech.length > index
                    ? speech[index]
                    : Utils.randomFromArray(speech)
                ttsString = Utils.replaceTagsInString(ttsString, message)
                onTtsQueue = true
            }
            if(onTtsQueue) _this._tts.enqueueSoundEffect(config)
            else _this._audioPlayer.enqueueAudio(config)
            if(ttsString) _this._tts.enqueueSpeakSentence(ttsString, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
        }
        else return null
    }

    private buildPipeCallback(_this: MainController, config: IPipeMessagePreset|IPipeMessagePreset[]|undefined) {
        if(config) return async (message: ITwitchRedemptionMessage) => {
            /*
             * We check if we don't have enough texts to fill the preset 
             * and fill the empty spots up with the redeemer's display name.
             */
            if(!Array.isArray(config)) config = [config]
            for(const cfg of config) {
                const configClone = Utils.clone(cfg)
                const textAreaCount = configClone.config.customProperties.textAreas?.length ?? 0
                if(textAreaCount > 0 && configClone.texts == undefined) configClone.texts = []
                const textCount = configClone.texts?.length ?? 0
                if(textAreaCount > textCount) {
                    configClone.texts.length = textAreaCount
                    configClone.texts.fill(message.redemption.user.display_name, textCount, textAreaCount)
                }
                if(configClone.imageData == null && configClone.imagePath == null) {
                    const user = await this._twitchHelix.getUserById(parseInt(message?.redemption?.user?.id))
                    configClone.imagePath = user.profile_image_url
                }
                _this._pipe.showPreset(configClone)
            }
        }
        else return null
    }

    private buildOpenVR2WSSettingCallback(_this: MainController, config: IOpenVR2WSSetting) {
        if(config) return (message: ITwitchRedemptionMessage) => {
            _this._openvr2ws.setSetting(config)
        }
    }

    private buildSignCallback(_this: MainController, config: ISignShowConfig) {
        if(config) return (message: ITwitchRedemptionMessage) => {
            this._twitchHelix.getUserById(parseInt(message?.redemption?.user?.id)).then(user => {
                const clonedConfig = Utils.clone(config)
                if(clonedConfig.title == undefined) clonedConfig.title = user.display_name
                if(clonedConfig.subtitle == undefined) clonedConfig.subtitle = user.display_name
                if(clonedConfig.image == undefined) clonedConfig.image = user.profile_image_url
                _this._sign.enqueueSign(clonedConfig)
            })
        }
    }

    private buildRunCallback(_this: MainController, config: IRunCommand) {
        if(config) return (message: ITwitchRedemptionMessage) => {
            const speech = message?.redemption?.reward?.title
            if(speech != undefined) _this._tts.enqueueSpeakSentence(`Running: ${speech}`, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
            Run.executeCommand(config)
        }
    }

    private buildWebCallback(_this: MainController, config: IWebRequestConfig) {
        if(config) return (message: ITwitchRedemptionMessage) => {
            fetch(config.url, {mode: 'no-cors'}).then(result => console.log(result))
        }
    }

    /*
    .####.##....##.########.########.########..##.....##....###....##........######.
    ..##..###...##....##....##.......##.....##.##.....##...##.##...##.......##....##
    ..##..####..##....##....##.......##.....##.##.....##..##...##..##.......##......
    ..##..##.##.##....##....######...########..##.....##.##.....##.##........######.
    ..##..##..####....##....##.......##...##....##...##..#########.##.............##
    ..##..##...###....##....##.......##....##....##.##...##.....##.##.......##....##
    .####.##....##....##....########.##.....##....###....##.....##.########..######.
    */

    private startSteamPlayerSummaryInterval() {
        if(Config.steam.playerSummaryIntervalMs) {
            Utils.log('Starting Steam player summary interval', Color.Green)
            this._steamPlayerSummaryIntervalHandle = setInterval(() => {
            SteamWebApi.getPlayerSummary().then(summary => {
                const id = parseInt(summary.gameid)
                Utils.log(`Steam player summary game ID: ${id}`, Color.DarkBlue)
                if(!isNaN(id) && id > 0) this.appIdCallback.call(this, `steam.app.${id}`)
            })
        }, Config.steam.playerSummaryIntervalMs)}
    }

    private startSteamAchievementsInterval() {
        if(Config.steam.achievementsIntervalMs) this._steamAchievementsIntervalHandle = setInterval(async () => {
            console.log('Steam achievements interval')
            if(this._lastSteamAppId != undefined && this._lastSteamAppId.length > 0) {
                const achievements = await SteamWebApi.getAchievements(this._lastSteamAppId)
                
                // TODO: Save achievement states to settings
                // TODO: Load and cache global achievement data
                // TODO: Load and cache game achievement detailed data
                // TODO: Compare incoming achievements with stored ones
                    // If there are new ones that are from less than 24h ago, announce them.
                    // Possibly post to Discord with image?

                console.log(achievements)
            }
        }, Config.steam.achievementsIntervalMs)
    }
}