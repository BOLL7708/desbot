class MainController {
    private _twitch: Twitch = new Twitch()
    private _twitchHelix: TwitchHelix = new TwitchHelix()
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
    private _ttsForAll: boolean = Config.controller.ttsForAllDefault
    private _pipeForAll: boolean = Config.controller.pipeForAllDefault
    private _pingForChat: boolean = Config.controller.pingForChat
    private _useGameSpecificRewards: boolean = Config.controller.useGameSpecificRewards
    private _logChatToDiscord: boolean = Config.controller.logChatToDiscordDefault
    private _nonceCallbacks: Record<string, Function> = {}

    constructor() {
        this.init() // To allow init to be async
    }
    
    private async init() {
        // Make sure settings are precached
        await Settings.loadSettings(Settings.TTS_BLACKLIST)
        await Settings.loadSettings(Settings.TTS_USER_NAMES)
        await Settings.loadSettings(Settings.TTS_USER_VOICES)
        await Settings.loadSettings(Settings.TWITCH_TOKENS)
        await Settings.loadSettings(Settings.TWITCH_REWARDS)
        await Settings.loadSettings(Settings.LABELS)
        await Settings.loadSettings(Settings.DICTIONARY).then(dictionary => this._tts.setDictionary(dictionary))

        /*
        ██ ███    ██ ██ ████████ 
        ██ ████   ██ ██    ██    
        ██ ██ ██  ██ ██    ██    
        ██ ██  ██ ██ ██    ██    
        ██ ██   ████ ██    ██    
        */
        
        this._pipe.setOverlayTitle("Streaming Widget")

        function setEmptySoundForTTS() {
            const audio = this._pingForChat ? Config.audioplayer.configs[Keys.KEY_SOUND_CHAT] : null           
            this._tts.setEmptyMessageSound(audio)
        }

        setEmptySoundForTTS.call(this)

        /*
        ██████  ███████ ██     ██  █████  ██████  ██████  ███████ 
        ██   ██ ██      ██     ██ ██   ██ ██   ██ ██   ██ ██      
        ██████  █████   ██  █  ██ ███████ ██████  ██   ██ ███████ 
        ██   ██ ██      ██ ███ ██ ██   ██ ██   ██ ██   ██      ██ 
        ██   ██ ███████  ███ ███  ██   ██ ██   ██ ██████  ███████ 
        */

        // Load reward IDs from settings
        let storedRewards:ITwitchRewardPair[] = Settings.getFullSettings(Settings.TWITCH_REWARDS)
        if(storedRewards == undefined) storedRewards = []

        // Create missing rewards if any
        const allRewardKeys = Object.keys(Config.twitch.rewardConfigs)
        const missingRewardKeys = allRewardKeys.filter(key => !storedRewards.find(reward => reward.key == key))        
        for(const key of missingRewardKeys) {
            const setup = Config.twitch.rewardConfigs[key]
            let reward = await this._twitchHelix.createReward(setup)
            if(reward?.data?.length > 0) await Settings.pushSetting(Settings.TWITCH_REWARDS, 'key', {key: key, id: reward.data[0].id})
        }

        this._twitchHelix.updateReward(await Utils.getRewardId(Keys.KEY_TTSSPEAK), {is_enabled: !this._ttsForAll})
        this._twitchHelix.updateReward(await Utils.getRewardId(Keys.KEY_TTSSPEAKTIME), {is_enabled: !this._ttsForAll})
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

        /** TTS */
        this._twitch.registerReward({
            id: await Utils.getRewardId(Keys.KEY_TTSSPEAK),
            callback: (data:ITwitchRedemptionMessage) => {
                let userName = data?.redemption?.user?.login
                let inputText = data?.redemption?.user_input
                if(userName != null && inputText != null) {
                    console.log("TTS Message Reward")
                    this._tts.enqueueSpeakSentence(
                        inputText,
                        userName,
                        GoogleTTS.TYPE_SAID
                    )
                }
            }
        })
        this._twitch.registerReward({
            id: await Utils.getRewardId(Keys.KEY_TTSSPEAKTIME),
            callback: (data:ITwitchRedemptionMessage) => {
                console.log("TTS Time Reward")
                let username = data?.redemption?.user?.login
                if(username != null && username.length != 0 && this._ttsEnabledUsers.indexOf(username) < 0) {
                    this._ttsEnabledUsers.push(username)
                    console.log(`User added to TTS list: ${username}`)
                }
                setTimeout(()=>{
                    let index = this._ttsEnabledUsers.indexOf(username)
                    let removed = this._ttsEnabledUsers.splice(index)
                    console.log(`User removed from TTS list: ${removed}`)
                }, 10*60*1000)
            }
        })
        this._twitch.registerReward({
            id: await Utils.getRewardId(Keys.KEY_TTSSETVOICE),
            callback: (data:ITwitchRedemptionMessage) => {
                let userName = data?.redemption?.user?.login
                let userInput = data?.redemption?.user_input
                console.log(`TTS Voice Set Reward: ${userName} -> ${userInput}`)
                this._tts.setVoiceForUser(userName, userInput)
            }
        })
        this._twitch.registerReward({
            id: await Utils.getRewardId(Keys.KEY_TTSSWITCHVOICEGENDER),
            callback: (data:ITwitchRedemptionMessage) => {
                let userName = data?.redemption?.user?.login
                console.log(`TTS Gender Set Reward: ${userName}`)
                Settings.pullSetting(Settings.TTS_USER_VOICES, 'userName', userName).then(voice => {
                    const voiceSetting:IUserVoice = voice
                    let gender:string = ''
                    if(voiceSetting != null) gender = voiceSetting.gender.toLowerCase() == 'male' ? 'female' : 'male'
                    this._tts.setVoiceForUser(userName, `reset ${gender}`)
                })
            }
        })
        this._twitch.registerReward({
            id: await Utils.getRewardId(Keys.KEY_SCREENSHOT),
            callback: (data:ITwitchRedemptionMessage) => {
                let userInput = data?.redemption?.user_input
                const nonce = Utils.getNonce('TTS')
                const speech = Config.controller.speechReferences[Keys.KEY_SCREENSHOT]
                this._tts.enqueueSpeakSentence(Utils.template(speech, userInput), Config.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT, nonce)
                this._nonceCallbacks[nonce] = ()=>{
                    this._screenshots.sendScreenshotRequest(data, Config.screenshots.delay)
                }
            }
        })
        this._twitch.registerReward({
            id: await Utils.getRewardId(Keys.KEY_INSTANTSCREENSHOT),
            callback: (data:ITwitchRedemptionMessage) => {
                const speech = Config.controller.speechReferences[Keys.KEY_INSTANTSCREENSHOT]
                this._tts.enqueueSpeakSentence(speech, Config.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                if(Config.controller.websocketsUsed.openvr2ws && this._openvr2ws._lastAppId != undefined) {
                    this._screenshots.sendScreenshotRequest(data, 0)
                } else {
                    this._obs.takeSourceScreenshot(data)
                }
            }
        })

        this._twitch.registerReward({
            id: await Utils.getRewardId(Keys.KEY_FAVORITEVIEWER),
            callback: (message:ITwitchRedemptionMessage) => {
                const userName = message?.redemption?.user?.login
                const userId = message?.redemption?.user?.id
                this._twitchHelix.getUser(parseInt(userId), true).then(response => {
                    const profileUrl = response?.profile_image_url
                    const displayName = response?.display_name

                    // TODO: Not sure if this is a good idea or not to have always on display.
                    /* 
                    this._sign.enqueueSign({
                        title: 'Favorite Viewer',
                        image: profileUrl,
                        subtitle: displayName,
                        duration: -1
                    })
                    */

                    const data: ILabel = {
                        key: 'FavoriteViewer',
                        userName: userName,
                        displayName: displayName,
                        profileUrl: profileUrl
                    }
                    Settings.pushSetting(Settings.LABELS, 'key', data)
                    Utils.loadCleanName(userName).then(cleanName => {
                        const speech = Config.controller.speechReferences[Keys.KEY_FAVORITEVIEWER]
                        // TODO: Add audience_cheers_13.wav SFX
                        this._tts.enqueueSpeakSentence(Utils.template(speech, cleanName), Config.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                    })
                })
            }
        })

        this._twitch.registerReward({
            id: await Utils.getRewardId(Keys.KEY_CHANNELTROPHY),
            callback: async (message:ITwitchRedemptionMessage) => {
                const user = await this._twitchHelix.getUser(parseInt(message.redemption.user.id))
                if(user == undefined) return Utils.log(`Could not retrieve user for reward: ${Keys.KEY_CHANNELTROPHY}`, 'red')
                
                const signCallback = this.buildSignCallback(this, Config.sign.configs[Keys.KEY_CHANNELTROPHY])
                signCallback?.call(this, message)
                const soundCallback = this.buildSoundCallback(this, Config.audioplayer.configs[Keys.KEY_CHANNELTROPHY])
                soundCallback?.call(this, message)

                const rewardId = await Utils.getRewardId(Keys.KEY_CHANNELTROPHY)
                const rewardData = await this._twitchHelix.getReward(rewardId)
                if(rewardData?.data?.length == 1) {
                    const cost = rewardData.data[0].cost
                    const config = Config.twitch.rewardConfigs[Keys.KEY_CHANNELTROPHY]
                    Settings.pushLabel(Settings.LABEL_CHANNEL_TROPHY, `🏆 Channel Trophy #${cost}\n${user.display_name}`)
                    if(config != undefined) {
                        let titleArr = config.title.split(' ')
                        titleArr.pop()
                        titleArr.push(`${user.display_name}!`)
                        const updatedReward = await this._twitchHelix.updateReward(rewardId, {
                            title: titleArr.join(' '),
                            cost: cost+1,
                            prompt: `Currently held by ${user.display_name}! ${config.prompt}`
                        })
                        if(updatedReward == undefined) Utils.log(`Channel Trophy redeemed, but could not be updated.`, 'red')
                    } else Utils.log(`Channel Trophy redeemed, but no config found.`, 'red')
                } else Utils.log(`Could not retrieve Reward Data for reward: ${Keys.KEY_CHANNELTROPHY}`, 'red')
            }
        })

        this._twitch.registerReward({
            id: await Utils.getRewardId(Keys.KEY_UNLOCKREWARDTIMER),
            callback: async (message: ITwitchRedemptionMessage) => {
                const speech = Config.controller.speechReferences[Keys.KEY_UNLOCKREWARDTIMER][0]
                await this._tts.enqueueSpeakSentence(speech, Config.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                this._tts.enqueueSoundEffect(Config.audioplayer.configs[Keys.KEY_UNLOCKREWARDTIMER])
                this._twitchHelix.updateReward(await Utils.getRewardId(Keys.KEY_UNLOCKREWARDTIMER), {is_enabled: false})
                setTimeout(async ()=>{
                    const rewardId = await Utils.getRewardId(Config.controller.rewardReferences[Keys.KEY_UNLOCKREWARDTIMER])
                    const rewardData = await this._twitchHelix.getReward(rewardId)
                    const cost = rewardData.data[0].cost
                    const speech = Config.controller.speechReferences[Keys.KEY_UNLOCKREWARDTIMER][1]
                    this._tts.enqueueSoundEffect(Config.audioplayer.configs[Keys.KEY_UNLOCKREWARDTIMER])
                    this._tts.enqueueSpeakSentence(speech, Config.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                    this._twitchHelix.updateReward(rewardId, {is_enabled: true, cost: cost+500})
                }, 30*60*1000)
            }
        })

        /*
         █████  ██    ██ ████████  ██████      ██████  ███████ ██     ██  █████  ██████  ██████  ███████ 
        ██   ██ ██    ██    ██    ██    ██     ██   ██ ██      ██     ██ ██   ██ ██   ██ ██   ██ ██      
        ███████ ██    ██    ██    ██    ██     ██████  █████   ██  █  ██ ███████ ██████  ██   ██ ███████ 
        ██   ██ ██    ██    ██    ██    ██     ██   ██ ██      ██ ███ ██ ██   ██ ██   ██ ██   ██      ██ 
        ██   ██  ██████     ██     ██████      ██   ██ ███████  ███ ███  ██   ██ ██   ██ ██████  ███████ 
        */

        for(const key of Config.twitch.autoRewards) {
            let obsCallback: null|((data: ITwitchRedemptionMessage) => void) = this.buildOBSCallback(this, Config.obs.configs[key])
            let colorCallback: null|((data: ITwitchRedemptionMessage) => void) = this.buildColorCallback(this, Config.philipshue.configs[key])
            let soundCallback: null|((data: ITwitchRedemptionMessage) => void) = this.buildSoundCallback(this, Config.audioplayer.configs[key])
            let pipeCallback: null|((data: ITwitchRedemptionMessage) => void) = this.buildPipeCallback(this, Config.pipe.configs[key])
            let openvr2wsSettingCallback: null|((data: ITwitchRedemptionMessage) => void) = this.buildOpenVR2WSSettingCallback(this, Config.openvr2ws.configs[key])
            let signCallback: null|((data: ITwitchRedemptionMessage) => void) = this.buildSignCallback(this, Config.sign.configs[key])
            let runCallback: null|((data: ITwitchRedemptionMessage) => void) = this.buildRunCallback(this, Config.run[key])

            const reward:ITwitchReward = {
                id: await Utils.getRewardId(key),
                callback: async (data:ITwitchRedemptionMessage)=>{
                    if(Config.twitch.disableAutoRewardAfterUse.indexOf(key) > -1) {
                        const id = await Utils.getRewardId(key)
                        this._twitchHelix.updateReward(id, {is_enabled: false})
                    }
                    if(obsCallback != null) obsCallback(data)
                    if(colorCallback != null) colorCallback(data)
                    if(soundCallback != null) soundCallback(data)
                    if(pipeCallback != null) pipeCallback(data)
                    if(openvr2wsSettingCallback != null) openvr2wsSettingCallback(data)
                    if(signCallback != null) signCallback(data)
                    if(runCallback != null) runCallback(data)
                }
            }
            if(reward.id != null) {
                Utils.logWithBold(`Registering Automatic Reward ${obsCallback?'🎬':''}${colorCallback?'🎨':''}${soundCallback?'🔊':''}${pipeCallback?'🧪':''}${openvr2wsSettingCallback?'📝':''}${runCallback?'🛴':''}: ${key}`, 'green')
                this._twitch.registerReward(reward)
            } else {
                Utils.logWithBold(`No Reward ID for <${key}>, it might be missing a reward config.`, 'red')
            }
        }

        /*
         ██████  ██████  ███    ███ ███    ███  █████  ███    ██ ██████  ███████ 
        ██      ██    ██ ████  ████ ████  ████ ██   ██ ████   ██ ██   ██ ██      
        ██      ██    ██ ██ ████ ██ ██ ████ ██ ███████ ██ ██  ██ ██   ██ ███████ 
        ██      ██    ██ ██  ██  ██ ██  ██  ██ ██   ██ ██  ██ ██ ██   ██      ██ 
         ██████  ██████  ██      ██ ██      ██ ██   ██ ██   ████ ██████  ███████ 
        */

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_TTS_ON,
            callback: async (userData, input) => {
                const speech = Config.controller.speechReferences[Keys.COMMAND_TTS_ON]
                const onText:string = !this._ttsForAll ? speech[0] : speech[1]
                this._ttsForAll = true
                this._tts.enqueueSpeakSentence(onText, Config.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                this._twitchHelix.updateReward(await Utils.getRewardId(Keys.KEY_TTSSPEAK), {is_enabled: false})
                this._twitchHelix.updateReward(await Utils.getRewardId(Keys.KEY_TTSSPEAKTIME), {is_enabled: false})
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_TTS_OFF,
            callback: async (userData, input) => {
                const speech = Config.controller.speechReferences[Keys.COMMAND_TTS_OFF]
                const offText = this._ttsForAll ? speech[0] : speech[1]
                this._ttsForAll = false
                this._tts.enqueueSpeakSentence(offText, Config.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                this._twitchHelix.updateReward(await Utils.getRewardId(Keys.KEY_TTSSPEAK), {is_enabled: true})
                this._twitchHelix.updateReward(await Utils.getRewardId(Keys.KEY_TTSSPEAKTIME), {is_enabled: true})
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
                this._tts.enqueueSpeakSentence(input, Config.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_TTS_NICK,
            permissions: Config.controller.commandPermissionsReferences[Keys.COMMAND_TTS_NICK],
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
                    this._tts.enqueueSpeakSentence(Utils.template(speech, userToRename, newName), Config.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                }
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_TTS_MUTE,
            callback: (userData, input) => {
                const parts = Utils.splitOnFirst(' ', input)
                const name = Utils.cleanUserName(parts[0] ?? '')
                if(name.length > 0 && name != Config.twitch.botName.toLowerCase()) {
                    let reason = (parts[1] ?? '').replace('|', ' ').replace(';', ' ')
                    Settings.pushSetting(Settings.TTS_BLACKLIST, 'userName', { userName: name, active: true, reason: reason })
                    Utils.loadCleanName(name).then(cleanName => {
                        const speech = Config.controller.speechReferences[Keys.COMMAND_TTS_MUTE]
                        this._tts.enqueueSpeakSentence(Utils.template(speech, cleanName), Config.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                    })
                }
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_TTS_UNMUTE,
            callback: (userData, input) => {
                const parts = Utils.splitOnFirst(' ', input)
                const name = Utils.cleanUserName(parts[0] ?? '')
                if(name.length == 0) return
                Settings.pullSetting(Settings.TTS_BLACKLIST, 'userName', name).then(blacklist => {
                    Utils.loadCleanName(name).then(cleanName => {
                        const speech = Config.controller.speechReferences[Keys.COMMAND_TTS_UNMUTE]
                        if(blacklist != null && blacklist.active) {
                            const reason = Utils.cleanSetting(parts[1] ?? '')
                            Settings.pushSetting(Settings.TTS_BLACKLIST, 'userName', { userName: name, active: false, reason: reason })    
                            this._tts.enqueueSpeakSentence(Utils.template(speech[0], cleanName), Config.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                        } else {
                            this._tts.enqueueSpeakSentence(Utils.template(speech[1], cleanName), Config.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                        }
                    })
                })
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_CHAT,
            callback: (userData, input) => {
                this._pipe.sendBasic('', input)
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_CHAT_ON,
            callback: (userData, input) => {
                this._pipeForAll = true
                const speech = Config.controller.speechReferences[Keys.COMMAND_CHAT_ON]
                this._tts.enqueueSpeakSentence(speech, Config.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_CHAT_OFF,
            callback: (userData, input) => {
                this._pipeForAll = false
                const speech = Config.controller.speechReferences[Keys.COMMAND_CHAT_OFF]
                this._tts.enqueueSpeakSentence(speech, Config.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_PING_ON,
            callback: (userData, input) => {
                this._pingForChat = true
                setEmptySoundForTTS.call(this)
                const speech = Config.controller.speechReferences[Keys.COMMAND_PING_ON]
                this._tts.enqueueSpeakSentence(speech, Config.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_PING_OFF,
            callback: (userData, input) => {
                this._pingForChat = false
                setEmptySoundForTTS.call(this)
                const speech = Config.controller.speechReferences[Keys.COMMAND_PING_OFF]
                this._tts.enqueueSpeakSentence(speech, Config.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_LOG_ON,
            permissions: Config.controller.commandPermissionsReferences[Keys.COMMAND_LOG_ON],
            callback: (userData, input) => {
                this._logChatToDiscord = true
                const speech = Config.controller.speechReferences[Keys.COMMAND_LOG_ON]
                this._tts.enqueueSpeakSentence(speech, Config.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_LOG_OFF,
            permissions: Config.controller.commandPermissionsReferences[Keys.COMMAND_LOG_OFF],
            callback: (userData, input) => {
                this._logChatToDiscord = false
                const speech = Config.controller.speechReferences[Keys.COMMAND_LOG_OFF]
                this._tts.enqueueSpeakSentence(speech, Config.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_CAMERA_ON,
            callback: (userData, input) => {
                const key = Config.controller.commandReferences[Keys.COMMAND_CAMERA_ON]
                const speech = Config.controller.speechReferences[Keys.COMMAND_CAMERA_ON]
                this._tts.enqueueSpeakSentence(speech, Config.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                this._obs.showSource(Config.obs.configs[key], true)
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_CAMERA_OFF,
            callback: (userData, input) => {
                const key = Config.controller.commandReferences[Keys.COMMAND_CAMERA_OFF]
                const speech = Config.controller.speechReferences[Keys.COMMAND_CAMERA_OFF]
                this._tts.enqueueSpeakSentence(speech, Config.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                this._obs.hideSource(Config.obs.configs[key])
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_SCALE,
            callback: (userData, input) => {
                const value = input == '' ? 100 : Math.max(10, Math.min(1000, parseFloat(input)))
                const speech = Config.controller.speechReferences[Keys.COMMAND_SCALE]
                this._tts.enqueueSpeakSentence(Utils.template(speech, value), Config.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                this._openvr2ws.setSetting({
                    type: OpenVR2WS.TYPE_WORLDSCALE,
                    value: value/100.0
                })
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_DICTIONARY,
            callback: (userData, input) => {
                const words = Utils.splitOnFirst(' ', input)
                const speech = Config.controller.speechReferences[Keys.COMMAND_DICTIONARY]
                if(words.length == 2) {
                    Settings.pushSetting(Settings.DICTIONARY, 'original', {original: words[0].toLowerCase(), substitute: words[1].toLowerCase()})
                    this._tts.setDictionary(<IDictionaryPair[]> Settings.getFullSettings(Settings.DICTIONARY))
                    this._tts.enqueueSpeakSentence(Utils.template(speech[0], words[0], words[1]), Config.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT, '', null, [], false)
                } else {
                    Utils.loadCleanName(userData.userName).then(cleanName => {
                        this._tts.enqueueSpeakSentence(Utils.template(speech[1], cleanName), Config.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                    })
                }
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_UPDATEREWARDS,
            callback: async (userData, input) => {
                let storedRewards:ITwitchRewardPair[] = Settings.getFullSettings(Settings.TWITCH_REWARDS)
                if(storedRewards == undefined) storedRewards = []
                for(const pair of storedRewards) {
                    const config = Config.twitch.rewardConfigs[pair.key]
                    if(config != undefined && Config.twitch.skipUpdatingRewards.indexOf(pair.key) < 0) {
                        const response = await this._twitchHelix.updateReward(pair.id, config)
                        const success = response?.data[0]?.id == pair.id
                        Utils.logWithBold(`Reward <${pair.key}> updated: <${success?'YES':'NO'}>`, success?'green':'red')
                    } else {
                        Utils.logWithBold(`Reward <${pair.key}> update skipped or unavailable.`, 'purple')
                    }
                }
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_RELOADWIDGET,
            callback: (userData, input) => {
                window.location.reload();
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_GAMEREWARDS_ON,
            callback: (userData, input) => {
                this._useGameSpecificRewards = true
                const speech = Config.controller.speechReferences[Keys.COMMAND_GAMEREWARDS_ON]
                this._tts.enqueueSpeakSentence(speech, Config.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                this._openvr2ws.triggerAppIdCallback(this._openvr2ws._lastAppId)
            }
        })
        
        this._twitch.registerCommand({
            trigger: Keys.COMMAND_GAMEREWARDS_OFF,
            callback: (userData, input) => {
                this._useGameSpecificRewards = false
                const speech = Config.controller.speechReferences[Keys.COMMAND_GAMEREWARDS_OFF]
                this._tts.enqueueSpeakSentence(speech, Config.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                this._openvr2ws.triggerAppIdCallback('')
            }
        })

        this._twitch.registerCommand({
            trigger: Keys.COMMAND_SOURCESCREENSHOT,
            callback: (userData, input) => {
                this._obs.takeSourceScreenshot(null)
            }
        })

        /*
         ██████  █████  ██      ██      ██████   █████   ██████ ██   ██ ███████ 
        ██      ██   ██ ██      ██      ██   ██ ██   ██ ██      ██  ██  ██      
        ██      ███████ ██      ██      ██████  ███████ ██      █████   ███████ 
        ██      ██   ██ ██      ██      ██   ██ ██   ██ ██      ██  ██       ██ 
         ██████ ██   ██ ███████ ███████ ██████  ██   ██  ██████ ██   ██ ███████ 
        */

        this._twitch.registerAnnouncement({
            userName: Config.twitch.announcerName.toLowerCase(),
            triggers: Config.twitch.announcerTriggers,
            callback: (userData, messageData, firstWord) => {
                // TTS
                if(Config.audioplayer.configs.hasOwnProperty(firstWord)) {
                    this._tts.enqueueSoundEffect(Config.audioplayer.configs[firstWord])
                }
                this._tts.enqueueSpeakSentence(messageData.text, userData.userName, GoogleTTS.TYPE_ANNOUNCEMENT)

                // Pipe to VR (basic)
                this._twitchHelix.getUser(parseInt(userData.userId)).then(user => {
                    if(user?.profile_image_url) {
                        ImageLoader.getBase64(user?.profile_image_url, true).then(image => {
                            this._pipe.sendBasic(userData.displayName, messageData.text, image, false)
                        })
                    } else {
                        this._pipe.sendBasic(userData.displayName, messageData.text, null, false)
                    }
                })
            }
        })

        this._twitch.setChatCheerCallback((userData, messageData) => {
            const clearRanges = TwitchFactory.getEmotePositions(messageData.emotes)
            // TTS
            this._tts.enqueueSpeakSentence(messageData.text, userData.userName, GoogleTTS.TYPE_CHEER, Utils.getNonce('TTS'), messageData.bits, clearRanges)

            // Pipe to VR (basic)
            const userName = `${userData.displayName}[${messageData.bits}]`
            this._twitchHelix.getUser(parseInt(userData.userId)).then(user => {
                if(user?.profile_image_url) {
                    ImageLoader.getBase64(user?.profile_image_url, true)
                        .then(image => this._pipe.sendBasic(userName, messageData.text, image, true, clearRanges))
                        .catch(error => console.error(error))
                    
                } else {
                    this._pipe.sendBasic(userName, messageData.text, null, true, clearRanges)
                }
            })
        })

        this._twitch.setChatCallback((userData, messageData) => {
            const clearRanges = TwitchFactory.getEmotePositions(messageData.emotes)
            let type = GoogleTTS.TYPE_SAID
            if(messageData.isAction) type = GoogleTTS.TYPE_ACTION
            
            if(this._ttsForAll) { 
                // TTS is on for everyone
                this._tts.enqueueSpeakSentence(messageData.text, userData.userName, type, null, Utils.getNonce('TTS'), clearRanges)
            } else if(this._ttsEnabledUsers.indexOf(userData.userName) > -1) {
                // Reward users
                this._tts.enqueueSpeakSentence(messageData.text, userData.userName, type, null, Utils.getNonce('TTS'), clearRanges)
            } else if(this._pingForChat && Config.twitch.chatNotificationSound != null) {
                // Chat sound
                const soundEffect = Config.audioplayer.configs[Config.twitch.chatNotificationSound]
                if(!Utils.matchFirstChar(messageData.text, Config.google.doNotSpeak)) this._tts.enqueueSoundEffect(soundEffect)
            }

            // Pipe to VR (basic)
            if(this._pipeForAll) {
                this._twitchHelix.getUser(parseInt(userData.userId)).then(user => {
                    if(user?.profile_image_url) {
                        ImageLoader.getBase64(user?.profile_image_url, true).then(image => {
                            this._pipe.sendBasic(userData.displayName, messageData.text, image, false, clearRanges)
                        })
                    } else {
                        this._pipe.sendBasic(userData.displayName, messageData.text, null, false, clearRanges)
                    }
                })
            }
        })

        this._twitch.setAllChatCallback((message:ITwitchMessageCmd) => {
            console.log(message)
            const rewardId = message?.properties?.["custom-reward-id"]           
            if(rewardId) return // Skip rewards as handled elsewhere
            const bits = parseInt(message?.properties?.bits)
            
            // Discord
            this._twitchHelix.getUser(parseInt(message?.properties["user-id"])).then(user => {
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
                
                if(this._logChatToDiscord) {
                    this._discord.sendMessage(
                        Config.discord.webhooks[Keys.KEY_DISCORD_CHAT],
                        user?.display_name,
                        user?.profile_image_url,
                        `${label}${logText}`
                    )
                }
            })
        })

        // This callback was added as rewards with no text input does not come in through the chat callback
        this._twitch.setAllRewardsCallback(async (message:ITwitchRedemptionMessage) => {
            const user = await this._twitchHelix.getUser(parseInt(message.redemption.user.id))          
            const rewardPair:ITwitchRewardPair = await Settings.pullSetting(Settings.TWITCH_REWARDS, 'id', message.redemption.reward.id)

            // Discord
            const amount = message.redemption.reward.redemptions_redeemed_current_stream
            const amountStr = amount != null ? ` #${amount}` : ''
            let description = `${Config.discord.prefixReward}**${message.redemption.reward.title}${amountStr}** (${message.redemption.reward.cost})`
            if(message.redemption.user_input) description +=  `: ${Utils.escapeForDiscord(Utils.fixLinks(message.redemption.user_input))}`
            if(this._logChatToDiscord) {
                this._discord.sendMessage(
                    Config.discord.webhooks[Keys.KEY_DISCORD_CHAT],
                    user?.display_name,
                    user?.profile_image_url,
                    description
                )
            }
            const rewardSpecificWebhook = Config.discord.webhooks[rewardPair.key] || null
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
                if(user?.profile_image_url) {
                    ImageLoader.getBase64(user?.profile_image_url, true).then(image => {
                        this._pipe.sendBasic(user?.login, message.redemption.user_input, image)
                    })
                } else {
                    this._pipe.sendBasic(user?.login, message.redemption.user_input)
                }
            }
            
        })

        this._screenshots.setScreenshotCallback((data) => {
            const reward = this._screenshots.getScreenshotRequest(parseInt(data.nonce))
            const discordCfg = Config.discord.webhooks[Keys.KEY_DISCORD_SSSVR]
            const blob = Utils.b64toBlob(data.image)
            const dataUrl = Utils.b64ToDataUrl(data.image)
            SteamStore.getGameMeta(this._openvr2ws._currentAppId).then(gameData => {
                const gameTitle = gameData != null ? gameData.name : this._openvr2ws._currentAppId
                if(reward != null) {
                    this._twitchHelix.getUser(parseInt(reward.redemption?.user?.id)).then(user => {
                        const authorName = reward.redemption?.user?.display_name
                        
                        // Discord
                        const description = reward.redemption?.user_input
                        const authorUrl = `https://twitch.tv/${reward.redemption?.user?.login ?? ''}`
                        const authorIconUrl = user?.profile_image_url
                        const color = Utils.hexToDecColor(Config.discord.remoteScreenshotEmbedColor)
                        const descriptionText = description != null 
                            ? Utils.template(Config.screenshots.callback.discordRewardTitle, description) 
                            : Config.screenshots.callback.discordRewardInstantTitle
                        this._discord.sendPayloadEmbed(discordCfg, blob, color, descriptionText, authorName, authorUrl, authorIconUrl, gameTitle)

                        // Sign
                        this._sign.enqueueSign({
                            title: Config.screenshots.callback.signTitle,
                            image: dataUrl,
                            subtitle: authorName,
                            duration: Config.screenshots.callback.signDuration
                        })
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
                        duration: Config.screenshots.callback.signDuration
                    })
                }
            })
        })

        this._obs.registerSourceScreenshotCallback((img, reward) => {
            const b64data = img.split(',').pop()
            const discordCfg = Config.discord.webhooks[Keys.COMMAND_SOURCESCREENSHOT]
            const blob = Utils.b64toBlob(b64data)
            const dataUrl = Utils.b64ToDataUrl(b64data)

            if(reward != null) {
                this._twitchHelix.getUser(parseInt(reward.redemption?.user?.id)).then(user => {
                    const authorName = reward.redemption?.user?.display_name
                    
                    // Discord
                    const authorUrl = `https://twitch.tv/${reward.redemption?.user?.login ?? ''}`
                    const authorIconUrl = user?.profile_image_url
                    const color = Utils.hexToDecColor(Config.discord.remoteScreenshotEmbedColor)
                    const descriptionText = Config.screenshots.callback.discordRewardInstantTitle
                    const gameTitle = Config.obs.sourceScreenshotConfig.discordGameTitle
                    this._discord.sendPayloadEmbed(discordCfg, blob, color, descriptionText, authorName, authorUrl, authorIconUrl, gameTitle)

                    // Sign
                    this._sign.enqueueSign({
                        title: Config.screenshots.callback.signTitle,
                        image: dataUrl,
                        subtitle: authorName,
                        duration: Config.screenshots.callback.signDuration
                    })
                })

                // Sound effect
                const soundConfig = Config.audioplayer.configs[Keys.COMMAND_SOURCESCREENSHOT]
                if(soundConfig != undefined) this._audioPlayer.enqueueAudio(soundConfig)
            }
        })

        this._obs.registerSceneChangeCallback((sceneName) => {
            let filterScene = Config.obs.filterOnScenes.indexOf(sceneName) > -1
            this._ttsForAll = !filterScene
        })

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

        
        this._openvr2ws.setInputCallback((key, data) => {
            switch(data.input) {
                case "Proximity": if(data.source == 'Head') {
                    // TODO: This is unreliable as it does not always register, and dashboard will mess it up.
                    // this._obs.toggleSource(Config.obs.rewards[Keys.KEY_ROOMPEEK], !data.value)
                    console.log(`OpenVR2WS: Headset proximity changed: ${data.value}`)
                }
            }
        })

        this._openvr2ws.setAppIdCallback(async (appId) => {
            /**
             * General reward toggling
             */
            const profile = Config.twitch.rewardConfigProfilePerGame[appId]
            if(profile != undefined) {
                Utils.log(`Applying game profile for: ${appId}`, 'green')
                this._twitchHelix.toggleRewards(profile)
            } else {
                Utils.log(`No game profile for: ${appId}, applying default`, 'green')
                this._twitchHelix.toggleRewards(Config.twitch.rewardConfigProfileDefault)
            }

            /**
             * Game specific reward configuration
             */
            if(!this._useGameSpecificRewards) appId = undefined // This will disable all rewards.

            const allGameRewardKeys = Config.twitch.gameSpecificRewards
            const gameSpecificRewards = Config.twitch.gameSpecificRewardsPerGame[appId]
            const availableRewardKeys = gameSpecificRewards != undefined ? Object.keys(gameSpecificRewards) : []

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
        })

        if(Config.controller.websocketsUsed.twitch) this._twitch.init()
        if(Config.controller.websocketsUsed.openvr2ws) this._openvr2ws.init()
        if(Config.controller.websocketsUsed.pipe) this._pipe.init()
        if(Config.controller.websocketsUsed.obs) this._obs.init()
        if(Config.controller.websocketsUsed.screenshots) this._screenshots.init()
    }
    
    /* 
    ██████  ██    ██ ██ ██      ██████  ███████ ██████  ███████ 
    ██   ██ ██    ██ ██ ██      ██   ██ ██      ██   ██ ██      
    ██████  ██    ██ ██ ██      ██   ██ █████   ██████  ███████ 
    ██   ██ ██    ██ ██ ██      ██   ██ ██      ██   ██      ██ 
    ██████   ██████  ██ ███████ ██████  ███████ ██   ██ ███████ 
    */

    private buildOBSCallback(_this: any, config: IObsSourceConfig|undefined): ITwitchRedemptionCallback|null {
        if(config) return (message: ITwitchRedemptionMessage) => {
            console.log("OBS Reward triggered")
            _this._obs.showSource(config)
            if(config.notificationImage != undefined) {
                _this._pipe.showNotificationImage(config.notificationImage, config.duration)
            }
        } 
        else return null
    }

    private buildColorCallback(_this: any, config: IPhilipsHueColorConfig|undefined): ITwitchRedemptionCallback|null {
        if(config) return (message: ITwitchRedemptionMessage) => {
            const userName = message?.redemption?.user?.login
            _this._tts.enqueueSpeakSentence('changed the color', userName, GoogleTTS.TYPE_ACTION)
            const lights:number[] = Config.philipshue.lightsToControl
            lights.forEach(light => {
                _this._hue.setLightState(light, config.x, config.y)
            })
        }
        else return null
    }
    
    private buildSoundCallback(_this: any, config: IAudio|undefined):ITwitchRedemptionCallback|null {
        if(config) return (message: ITwitchRedemptionMessage) => {
            _this._audioPlayer.enqueueAudio(config)
        }
        else return null
    }

    private buildPipeCallback(_this: any, config: IPipeMessagePreset) {
        if(config) return (message: ITwitchRedemptionMessage) => {
            _this._pipe.showPreset(config)
        }
        else return null
    }

    private buildOpenVR2WSSettingCallback(_this: any, config: IOpenVR2WSSetting) {
        if(config) return (message: ITwitchRedemptionMessage) => {
            _this._openvr2ws.setSetting(config)
        }
    }

    private buildSignCallback(_this: any, config: ISignShowConfig) {
        if(config) return (message: ITwitchRedemptionMessage) => {
            this._twitchHelix.getUser(parseInt(message?.redemption?.user?.id)).then(user => {
                const clonedConfig = JSON.parse(JSON.stringify(config))
                if(clonedConfig.title == undefined) clonedConfig.title = user.display_name
                if(clonedConfig.subtitle == undefined) clonedConfig.subtitle = user.display_name
                if(clonedConfig.image == undefined) clonedConfig.image = user.profile_image_url
                _this._sign.enqueueSign(clonedConfig)
            })
        }
    }

    private buildRunCallback(_this: any, config: IRunCommand) {
        if(config) return (message: ITwitchRedemptionMessage) => {
            const speech = message?.redemption?.reward?.title
            if(speech != undefined) _this._tts.enqueueSpeakSentence(`Running: ${speech}`, Config.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
            Run.executeCommand(config)
        }
    }
}