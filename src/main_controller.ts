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
    
    private _ttsEnabledUsers: string[] = []
    private _ttsForAll: boolean = Config.instance.controller.ttsForAllDefault
    private _pipeForAll: boolean = Config.instance.controller.pipeForAllDefault
    private _pingForChat: boolean = Config.instance.controller.pingForChat
    private _logChatToDiscord: boolean = Config.instance.controller.logChatToDiscordDefault
    private _nonceCallbacks: Record<string, Function> = {}

    constructor() {
        // Make sure settings are precached
        Settings.loadSettings(Settings.TTS_BLACKLIST)
        Settings.loadSettings(Settings.TTS_USER_NAMES)
        Settings.loadSettings(Settings.TTS_USER_VOICES)
        Settings.loadSettings(Settings.TWITCH_TOKENS)
        Settings.loadSettings(Settings.LABELS)

        this._pipe.setOverlayTitle("Streaming Widget")

        /*
        ██████  ███████ ██     ██  █████  ██████  ██████  ███████ 
        ██   ██ ██      ██     ██ ██   ██ ██   ██ ██   ██ ██      
        ██████  █████   ██  █  ██ ███████ ██████  ██   ██ ███████ 
        ██   ██ ██      ██ ███ ██ ██   ██ ██   ██ ██   ██      ██ 
        ██   ██ ███████  ███ ███  ██   ██ ██   ██ ██████  ███████ 
        */
      
        /** TTS */
        this._twitch.registerReward({
            id: Config.KEY_TTSSPEAK,
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
            id: Config.KEY_TTSSPEAKTIME,
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
            id: Config.KEY_TTSSETVOICE,
            callback: (data:ITwitchRedemptionMessage) => {
                let userName = data?.redemption?.user?.login
                let userInput = data?.redemption?.user_input
                console.log(`TTS Voice Set Reward: ${userName} -> ${userInput}`)
                this._tts.setVoiceForUser(userName, userInput)
            }
        })
        this._twitch.registerReward({
            id: Config.KEY_TTSSWITCHVOICEGENDER,
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
            id: Config.KEY_SCREENSHOT,
            callback: (data:ITwitchRedemptionMessage) => {
                let userInput = data?.redemption?.user_input
                const nonce = Utils.getNonce('TTS')
                this._tts.enqueueSpeakSentence(`Photograph ${userInput}`, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT, nonce)
                this._nonceCallbacks[nonce] = ()=>{
                    this._screenshots.sendScreenshotRequest(data, Config.instance.screenshots.delay)
                }
            }
        })
        this._twitch.registerReward({
            id: Config.KEY_INSTANTSCREENSHOT,
            callback: (data:ITwitchRedemptionMessage) => {
                this._tts.enqueueSpeakSentence(`Instant shot!`, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                this._screenshots.sendScreenshotRequest(data, 0)
            }
        })

        this._twitch.registerReward({
            id: Config.KEY_FAVORITEVIEWER,
            callback: (message:ITwitchRedemptionMessage) => {
                const userName = message?.redemption?.user?.login
                const userId = message?.redemption?.user?.id
                this._twitchHelix.getUser(parseInt(userId), true).then(response => {
                    const profileUrl = response?.profile_image_url
                    const displayName = response?.display_name
                    const data: ILabel = {
                        key: 'FavoriteViewer',
                        userName: userName,
                        displayName: displayName,
                        profileUrl: profileUrl
                    }
                    Settings.pushSetting(Settings.LABELS, 'key', data)
                    Utils.loadCleanName(userName).then(cleanName => {
                        this._tts.enqueueSpeakSentence(`${cleanName} is the new favorite viewer`, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                    })
                })
            }
        })

        /*
         █████  ██    ██ ████████  ██████      ██████  ███████ ██     ██  █████  ██████  ██████  ███████ 
        ██   ██ ██    ██    ██    ██    ██     ██   ██ ██      ██     ██ ██   ██ ██   ██ ██   ██ ██      
        ███████ ██    ██    ██    ██    ██     ██████  █████   ██  █  ██ ███████ ██████  ██   ██ ███████ 
        ██   ██ ██    ██    ██    ██    ██     ██   ██ ██      ██ ███ ██ ██   ██ ██   ██ ██   ██      ██ 
        ██   ██  ██████     ██     ██████      ██   ██ ███████  ███ ███  ██   ██ ██   ██ ██████  ███████ 
        */

        Config.instance.twitch.autoRewards.forEach(id => {
            let obsCallback: null|((data: ITwitchRedemptionMessage) => void) = this.buildOBSCallback(this, Config.instance.obs.configs[id])
            let colorCallback: null|((data: ITwitchRedemptionMessage) => void) = this.buildColorCallback(this, Config.instance.philipshue.configs[id])
            let soundCallback: null|((data: ITwitchRedemptionMessage) => void) = this.buildSoundCallback(this, Config.instance.audioplayer.configs[id])
            let pipeCallback: null|((data: ITwitchRedemptionMessage) => void) = this.buildPipeCallback(this, Config.instance.pipe.configs[id])

            console.log(`Registering Automatic Reward ${obsCallback?'🎬':''}${colorCallback?'🎨':''}${soundCallback?'🔊':''}${pipeCallback?'👨‍🔧':''}: ${id}`)
            const reward:ITwitchReward = {
                id: id,
                callback: (data:ITwitchRedemptionMessage)=>{
                    if(obsCallback != null) obsCallback(data)
                    if(colorCallback != null) colorCallback(data)
                    if(soundCallback != null) soundCallback(data)
                    if(pipeCallback != null) pipeCallback(data)
                }
            }
            this._twitch.registerReward(reward)
        });   


        /*
         ██████  ██████  ███    ███ ███    ███  █████  ███    ██ ██████  ███████ 
        ██      ██    ██ ████  ████ ████  ████ ██   ██ ████   ██ ██   ██ ██      
        ██      ██    ██ ██ ████ ██ ██ ████ ██ ███████ ██ ██  ██ ██   ██ ███████ 
        ██      ██    ██ ██  ██  ██ ██  ██  ██ ██   ██ ██  ██ ██ ██   ██      ██ 
         ██████  ██████  ██      ██ ██      ██ ██   ██ ██   ████ ██████  ███████ 
        */

        this._twitch.registerCommand({
            trigger: Config.COMMAND_TTS_ON,
            mods: true,
            everyone: false,
            callback: (userData, input) => {
                let onText:string = !this._ttsForAll ? "Global TTS activated" : "Global TTS already on"
                this._ttsForAll = true
                this._tts.enqueueSpeakSentence(onText, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: Config.COMMAND_TTS_OFF,
            mods: true,
            everyone: false,
            callback: (userData, input) => {
                let offText = this._ttsForAll ? "Global TTS terminated" : "Global TTS already off"
                this._ttsForAll = false
                this._tts.enqueueSpeakSentence(offText, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: Config.COMMAND_TTS_SILENCE,
            mods: true,
            everyone: false,
            callback: (userData, input) => {
                this._tts.stopSpeaking()
            }
        })

        this._twitch.registerCommand({
            trigger: Config.COMMAND_TTS_DIE,
            mods: true,
            everyone: false,
            callback: (userData, input) => {
                this._tts.stopSpeaking(true)
            }
        })

        this._twitch.registerCommand({
            trigger: Config.COMMAND_TTS_SAY,
            mods: true,
            everyone: false,
            callback: (userData, input) => {
                this._tts.enqueueSpeakSentence(input, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: Config.COMMAND_TTS_NICK,
            mods: true,
            everyone: false,
            callback: (userData, input) => {
                let parts = Utils.splitOnFirst(' ', input)
                if(parts.length == 2) {
                    const userToRename = Utils.cleanUserName(parts[0])
                    const newName = parts[1].toLowerCase()
                    Settings.pushSetting(Settings.TTS_USER_NAMES, 'userName', {userName: userToRename, shortName: newName})
                    this._tts.enqueueSpeakSentence(`${userToRename} is now called ${newName}`, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                }
            }
        })

        this._twitch.registerCommand({
            trigger: Config.COMMAND_TTS_MUTE,
            mods: true,
            everyone: false,
            callback: (userData, input) => {
                let parts = Utils.splitOnFirst(' ', input)
                let name = Utils.cleanUserName(parts[0] ?? '')
                if(name.length > 0 && name != Config.instance.twitch.botName.toLowerCase()) {
                    let reason = (parts[1] ?? '').replace('|', ' ').replace(';', ' ')
                    Settings.pushSetting(Settings.TTS_BLACKLIST, 'userName', { userName: name, active: true, reason: reason })
                    Utils.loadCleanName(name).then(cleanName => {
                        this._tts.enqueueSpeakSentence(`${cleanName} has lost their voice`, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                    })
                }
            }
        })

        this._twitch.registerCommand({
            trigger: Config.COMMAND_TTS_UNMUTE,
            mods: true,
            everyone: false,
            callback: (userData, input) => {
                let parts = Utils.splitOnFirst(' ', input)
                let name = Utils.cleanUserName(parts[0] ?? '')
                if(name.length == 0) return
                Settings.pullSetting(Settings.TTS_BLACKLIST, 'userName', name).then(blacklist => {
                    Utils.loadCleanName(name).then(cleanName => {
                        if(blacklist != null && blacklist.active) {
                            let reason = Utils.cleanSetting(parts[1] ?? '')
                            Settings.pushSetting(Settings.TTS_BLACKLIST, 'userName', { userName: name, active: false, reason: reason })    
                            this._tts.enqueueSpeakSentence(`${cleanName} has regained their voice`, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                        } else {
                            this._tts.enqueueSpeakSentence(`${cleanName} is not muted`, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                        }
                    })
                })
            }
        })

        this._twitch.registerCommand({
            trigger: Config.COMMAND_CHAT,
            mods: true,
            everyone: false,
            callback: (userData, input) => {
                this._pipe.sendBasic('', input)
            }
        })

        this._twitch.registerCommand({
            trigger: Config.COMMAND_CHAT_ON,
            mods: true,
            everyone: false,
            callback: (userData, input) => {
                this._pipeForAll = true
                this._tts.enqueueSpeakSentence(`Chat enabled`, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: Config.COMMAND_CHAT_OFF,
            mods: true,
            everyone: false,
            callback: (userData, input) => {
                this._pipeForAll = false
                this._tts.enqueueSpeakSentence(`Chat disabled`, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: Config.COMMAND_PING_ON,
            mods: true,
            everyone: false,
            callback: (userData, input) => {
                this._pingForChat = true
                this._tts.enqueueSpeakSentence(`Chat ping enabled`, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: Config.COMMAND_PING_OFF,
            mods: true,
            everyone: false,
            callback: (userData, input) => {
                this._pingForChat = false
                this._tts.enqueueSpeakSentence(`Chat ping disabled`, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: Config.COMMAND_LOG_ON,
            mods: false,
            everyone: false,
            callback: (userData, input) => {
                this._logChatToDiscord = true
                this._tts.enqueueSpeakSentence(`Logging enabled`, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: Config.COMMAND_LOG_OFF,
            mods: false,
            everyone: false,
            callback: (userData, input) => {
                this._logChatToDiscord = false
                this._tts.enqueueSpeakSentence(`Logging disabled`, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: Config.COMMAND_CAMERA_ON,
            mods: true,
            everyone: false,
            callback: (userData, input) => {
                const key = Config.instance.controller.commandReferences[Config.COMMAND_CAMERA_ON]
                this._tts.enqueueSpeakSentence(`Camera enabled`, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                this._obs.showSource(Config.instance.obs.configs[key], true)
            }
        })

        this._twitch.registerCommand({
            trigger: Config.COMMAND_CAMERA_OFF,
            mods: true,
            everyone: false,
            callback: (userData, input) => {
                const key = Config.instance.controller.commandReferences[Config.COMMAND_CAMERA_OFF]
                this._tts.enqueueSpeakSentence(`Camera disabled`, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                this._obs.hideSource(Config.instance.obs.configs[key])
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
            userName: Config.instance.twitch.announcerName.toLowerCase(),
            triggers: Config.instance.twitch.announcerTriggers,
            callback: (userData, messageData, firstWord) => {
                // TTS
                if(Config.instance.audioplayer.configs.hasOwnProperty(firstWord)) {
                    this._tts.enqueueSoundEffect(Config.instance.audioplayer.configs[firstWord])
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
            } else if(this._ttsEnabledUsers.indexOf(userData.userName) >= 0) {
                // Reward users
                this._tts.enqueueSpeakSentence(messageData.text, userData.userName, type, null, Utils.getNonce('TTS'), clearRanges)
            } else if(this._pingForChat && Config.instance.twitch.chatNotificationSound != null) {
                // Chat sound
                const soundEffect = Config.instance.audioplayer.configs[Config.instance.twitch.chatNotificationSound]
                if(!Utils.matchFirstChar(messageData.text, Config.instance.google.doNotSpeak)) this._tts.enqueueSoundEffect(soundEffect)
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
                let logText = Utils.escapeMarkdown(text)
                if(message?.message?.isAction) logText = `_${logText}_`
                
                // Label messages with bits
                let label = ''
                if(!isNaN(bits) && bits > 0) {
                    const unit = bits == 1 ? 'bit' : 'bits'
                    label = `${Config.instance.discord.prefixCheer}**Cheered ${bits} ${unit}**: `
                }
                
                // TODO: Add more things like sub messages? Need to check that from raw logs.
                
                if(this._logChatToDiscord) {
                    this._discord.sendMessage(
                        Config.instance.discord.webhooks[Config.KEY_DISCORD_CHAT],
                        user?.display_name,
                        user?.profile_image_url,
                        `${label}${logText}`
                    )
                }
            })
        })

        // This callback was added as rewards with no text input does not come in through the chat callback
        this._twitch.setAllRewardsCallback((message:ITwitchRedemptionMessage) => {
            this._twitchHelix.getUser(parseInt(message.redemption.user.id)).then(user => {
                const rewardId = message.redemption.reward.id

                // Discord
                const amount = message.redemption.reward.redemptions_redeemed_current_stream
                const amountStr = amount != null ? ` #${amount}` : ''
                let description = `${Config.instance.discord.prefixReward}**${message.redemption.reward.title}${amountStr}** (${message.redemption.reward.cost})`
                if(message.redemption.user_input) description +=  `: ${Utils.escapeMarkdown(Utils.fixLinks(message.redemption.user_input))}`
                if(this._logChatToDiscord) {
                    this._discord.sendMessage(
                        Config.instance.discord.webhooks[Config.KEY_DISCORD_CHAT],
                        user?.display_name,
                        user?.profile_image_url,
                        description
                    )
                }
                const rewardSpecificWebhook = Config.instance.discord.webhooks[rewardId] || null
                if(rewardSpecificWebhook != null) {
                    this._discord.sendMessage(
                        rewardSpecificWebhook,
                        user?.display_name,
                        user?.profile_image_url,
                        description
                    )
                }

                // Pipe to VR (basic)
                const rewardIds = Config.instance.twitch.rewards.concat(Config.instance.twitch.autoRewards)
                const rewardKey = rewardIds.find(id => id === rewardId)
                const showReward = Config.instance.pipe.showRewardsWithKeys.indexOf(rewardKey) >= 0
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
        })

        this._screenshots.setScreenshotCallback((data) => {
            const reward = this._screenshots.getScreenshotRequest(parseInt(data.nonce))
            const discordCfg = Config.instance.discord.webhooks[Config.KEY_DISCORD_SSSVR]
            const blob = Utils.b64toBlob(data.image, "image/png")
            SteamStore.getGameMeta(this._openvr2ws._currentAppId).then(data => {
                const gameTitle = data != null ? data.name : this._openvr2ws._currentAppId
                if(reward != null) {
                    this._twitchHelix.getUser(parseInt(reward.redemption?.user?.id)).then(user => {
                        const description = reward.redemption?.user_input
                        const authorName = reward.redemption?.user?.display_name
                        const authorUrl = `https://twitch.tv/${reward.redemption?.user?.login ?? ''}`
                        const authorIconUrl = user?.profile_image_url
                        const color = Utils.hexToDecColor(Config.instance.discord.remoteScreenshotEmbedColor)
                        const descriptionText = description != null ? `Photograph: ${description}` : "Instant shot! 📸"
                        this._discord.sendPayloadEmbed(discordCfg, blob, color, descriptionText, authorName, authorUrl, authorIconUrl, gameTitle)
                    })
                } else {
                    const color = Utils.hexToDecColor(Config.instance.discord.manualScreenshotEmbedColor)
                    this._discord.sendPayloadEmbed(discordCfg, blob, color, 'Manual Screenshot', null, null, null, gameTitle)
                }
            })
        })

        this._obs.registerSceneChangeCallback((sceneName) => {
            let filterScene = Config.instance.obs.filterOnScenes.indexOf(sceneName) >= 0
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
                    // this._obs.toggleSource(Config.instance.obs.rewards[Config.KEY_ROOMPEEK], !data.value)
                    console.log(`OpenVR2WS: Headset proximity changed: ${data.value}`)
                }
            }
        })

        this._twitch.init()
    }
    
    /* 
    ██████  ██    ██ ██ ██      ██████  ███████ ██████  ███████ 
    ██   ██ ██    ██ ██ ██      ██   ██ ██      ██   ██ ██      
    ██████  ██    ██ ██ ██      ██   ██ █████   ██████  ███████ 
    ██   ██ ██    ██ ██ ██      ██   ██ ██      ██   ██      ██ 
    ██████   ██████  ██ ███████ ██████  ███████ ██   ██ ███████ 
    */                                                         

    private buildOBSCallback(_this: any, config: IObsSourceConfig|undefined): ITwitchRedemptionCallback|null {
        if(config) return (data:ITwitchRedemptionMessage) => {
            console.log("OBS Reward triggered")
            _this._obs.showSource(config)
            if(config.notificationImage != undefined) {
                _this._pipe.showNotificationImage(config.notificationImage, config.duration)
            }
        } 
        else return null
    }

    private buildColorCallback(_this: any, config: IPhilipsHueColorConfig|undefined): ITwitchRedemptionCallback|null {
        if(config) return (data:ITwitchRedemptionMessage) => {
            let userName = data?.redemption?.user?.login
            _this._tts.enqueueSpeakSentence('changed the color', userName, GoogleTTS.TYPE_ACTION)
            const lights:number[] = Config.instance.philipshue.lightsToControl
            lights.forEach(light => {
                _this._hue.setLightState(light, config.x, config.y)
            })
        }
        else return null
    }
    
    private buildSoundCallback(_this: any, config: IAudio|undefined):ITwitchRedemptionCallback|null {
        if(config) return (data:ITwitchRedemptionMessage) => {
            _this._audioPlayer.enqueueAudio(config)
        }
        else return null
    }

    private buildPipeCallback(_this: any, config: IPipeMessagePreset) {
        if(config) return (data:ITwitchRedemptionMessage) => {
            _this._pipe.showPreset(config)
        }
        else return null
    }
}