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
    
    private _ttsEnabledUsers: string[] = []
    private _ttsForAll: boolean = Config.instance.controller.ttsForAllDefault
    private _pipeForAll: boolean = Config.instance.controller.pipeForAllDefault
    private _logChatToDiscord: boolean = Config.instance.controller.logChatToDiscordDefault
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

        /** OBS */
        this._twitch.registerReward(this.buildOBSReward(
            Config.instance.twitch.rewards[Config.KEY_ROOMPEEK],
            Config.instance.obs.sources[Config.KEY_ROOMPEEK],
            Images.YELLOW_DOT
        ))
        this._twitch.registerReward(this.buildOBSReward(
            Config.instance.twitch.rewards[Config.KEY_HEADPEEK],
            Config.instance.obs.sources[Config.KEY_HEADPEEK],
            Images.PINK_DOT
        ))
        
        /** TTS */
        this._twitch.registerReward({
            id: Config.instance.twitch.rewards[Config.KEY_TTSSPEAK],
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
            id: Config.instance.twitch.rewards[Config.KEY_TTSSPEAKTIME],
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
                }, 5*60*1000)
            }
        })
        this._twitch.registerReward({
            id: Config.instance.twitch.rewards[Config.KEY_TTSSETVOICE],
            callback: (data:ITwitchRedemptionMessage) => {
                let userName = data?.redemption?.user?.login
                let userInput = data?.redemption?.user_input
                console.log(`TTS Voice Set Reward: ${userName} -> ${userInput}`)
                this._tts.setVoiceForUser(userName, userInput)
            }
        })
        this._twitch.registerReward({
            id: Config.instance.twitch.rewards[Config.KEY_TTSSWITCHVOICEGENDER],
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
            id: Config.instance.twitch.rewards[Config.KEY_SCREENSHOT],
            callback: (data:ITwitchRedemptionMessage) => {
                let userInput = data?.redemption?.user_input
                this._tts.enqueueSpeakSentence(`Photograph ${userInput}`, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                this._screenshots.sendScreenshotRequest(data, Config.instance.screenshots.delay)
            }
        })
        this._twitch.registerReward({
            id: Config.instance.twitch.rewards[Config.KEY_INSTANTSCREENSHOT],
            callback: (data:ITwitchRedemptionMessage) => {
                this._tts.enqueueSpeakSentence(`Instant shot!`, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                this._screenshots.sendScreenshotRequest(data, 0)
            }
        })

        this._twitch.registerReward({
            id: Config.instance.twitch.rewards[Config.KEY_FAVORITEVIEWER],
            callback: (message:ITwitchRedemptionMessage) => {
                const userName = message?.redemption?.user?.login
                const userId = message?.redemption?.user?.id
                this._twitchHelix.getUser(parseInt(userId), true).then(response => {
                    const profileUrl = response?.profile_image_url
                    const displayName = response?.display_name
                    const data: ILabel = {
                        key: Config.KEY_FAVORITEVIEWER,
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

        /* COLORS */
        this._twitch.registerReward(this.buildColorReward(Config.KEY_COLOR_NEUTRAL, 0.3691, 0.3719))
        this._twitch.registerReward(this.buildColorReward(Config.KEY_COLOR_RED, 0.6758, 0.3190))
        this._twitch.registerReward(this.buildColorReward(Config.KEY_COLOR_ORANGE, 0.5926, 0.3892))
        this._twitch.registerReward(this.buildColorReward(Config.KEY_COLOR_BUTTERCUP, 0.5213, 0.4495))
        this._twitch.registerReward(this.buildColorReward(Config.KEY_COLOR_YELLOW, 0.4944, 0.4563))
        this._twitch.registerReward(this.buildColorReward(Config.KEY_COLOR_GREEN, 0.2140, 0.7090))
        this._twitch.registerReward(this.buildColorReward(Config.KEY_COLOR_CYAN, 0.1797, 0.4215))
        this._twitch.registerReward(this.buildColorReward(Config.KEY_COLOR_SKY, 0.1509, 0.1808))
        this._twitch.registerReward(this.buildColorReward(Config.KEY_COLOR_BLUE, 0.1541, 0.0821))
        this._twitch.registerReward(this.buildColorReward(Config.KEY_COLOR_PURPLE, 0.1541, 0.0821))
        this._twitch.registerReward(this.buildColorReward(Config.KEY_COLOR_PINK, 0.3881, 0.1760))

        /*
         ██████  ██████  ███    ███ ███    ███  █████  ███    ██ ██████  ███████ 
        ██      ██    ██ ████  ████ ████  ████ ██   ██ ████   ██ ██   ██ ██      
        ██      ██    ██ ██ ████ ██ ██ ████ ██ ███████ ██ ██  ██ ██   ██ ███████ 
        ██      ██    ██ ██  ██  ██ ██  ██  ██ ██   ██ ██  ██ ██ ██   ██      ██ 
         ██████  ██████  ██      ██ ██      ██ ██   ██ ██   ████ ██████  ███████ 
        */

        this._twitch.registerCommand({
            trigger: 'ttson',
            mods: true,
            everyone: false,
            callback: (userData, input) => {
                let onText:string = !this._ttsForAll ? "Global TTS activated" : "Global TTS already on"
                this._ttsForAll = true
                this._tts.enqueueSpeakSentence(onText, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: 'ttsoff',
            mods: true,
            everyone: false,
            callback: (userData, input) => {
                let offText = this._ttsForAll ? "Global TTS terminated" : "Global TTS already off"
                this._ttsForAll = false
                this._tts.enqueueSpeakSentence(offText, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: 'silence',
            mods: true,
            everyone: false,
            callback: (userData, input) => {
                this._tts.stopSpeaking()
            }
        })

        this._twitch.registerCommand({
            trigger: 'ttsdie',
            mods: true,
            everyone: false,
            callback: (userData, input) => {
                this._tts.stopSpeaking(true)
            }
        })

        this._twitch.registerCommand({
            trigger: 'say',
            mods: true,
            everyone: false,
            callback: (userData, input) => {
                this._tts.enqueueSpeakSentence(input, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: 'nick',
            mods: true,
            everyone: false,
            callback: (userData, input) => {
                let parts = Utils.splitOnFirst(' ', input)
                if(parts.length == 2) {
                    const userToRename = Utils.cleanUserName(parts[0])
                    const newName = parts[1].toLowerCase()
                    Settings.pushSetting(Settings.TTS_USER_NAMES, 'userName', {userName: userData.userName, shortName: newName})
                    this._tts.enqueueSpeakSentence(`${userToRename} is now called ${newName}`, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                }
            }
        })

        this._twitch.registerCommand({
            trigger: 'mute',
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
            trigger: 'unmute',
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
                            this._tts.enqueueSpeakSentence(`${cleanName} was never muted`, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                        }
                    })
                })
            }
        })

        this._twitch.registerCommand({
            trigger: 'chat',
            mods: true,
            everyone: false,
            callback: (userData, input) => {
                this._pipe.sendBasic('', input)
            }
        })

        this._twitch.registerCommand({
            trigger: 'chaton',
            mods: true,
            everyone: false,
            callback: (userData, input) => {
                this._pipeForAll = true
                this._tts.enqueueSpeakSentence(`Chat enabled`, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: 'chatoff',
            mods: true,
            everyone: false,
            callback: (userData, input) => {
                this._pipeForAll = false
                this._tts.enqueueSpeakSentence(`Chat disabled`, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: 'logon',
            mods: false,
            everyone: false,
            callback: (userData, input) => {
                this._logChatToDiscord = true
                this._tts.enqueueSpeakSentence(`Logging enabled`, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: 'logoff',
            mods: false,
            everyone: false,
            callback: (userData, input) => {
                this._logChatToDiscord = false
                this._tts.enqueueSpeakSentence(`Logging disabled`, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
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
            trigger: Config.instance.twitch.announcerTrigger.toLowerCase(),
            callback: (userData, messageData) => {
                // TTS
                this._tts.enqueueSpeakSentence(messageData.text, userData.userName, GoogleTTS.TYPE_ANNOUNCEMENT)

                // Pipe to VR (basic)
                this._twitchHelix.getUser(parseInt(userData.userId)).then(user => {
                    if(user?.profile_image_url) {
                        Utils.downloadImageB64(user?.profile_image_url, true).then(image => {
                            this._pipe.sendBasic(userData.displayName, messageData.text, image)
                        })
                    } else {
                        this._pipe.sendBasic(userData.displayName, messageData.text)
                    }
                })
            }
        })

        this._twitch.setChatCheerCallback((userData, messageData) => {
            const clearRanges = TwitchFactory.getEmotePositions(messageData.emotes)
            // TTS
            this._tts.enqueueSpeakSentence(messageData.text, userData.userName, GoogleTTS.TYPE_CHEER, messageData.bits, clearRanges)

            // Pipe to VR (basic)
            const userName = `${userData.displayName}[${messageData.bits}]`
            this._twitchHelix.getUser(parseInt(userData.userId)).then(user => {
                if(user?.profile_image_url) {
                    Utils.downloadImageB64(user?.profile_image_url, true).then(image => {
                        this._pipe.sendBasic(userName, messageData.text, image, true, clearRanges)
                    })
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
                this._tts.enqueueSpeakSentence(messageData.text, userData.userName, type, null, clearRanges)
            }
            else if(this._ttsEnabledUsers.indexOf(userData.userName) >= 0) {
                // Reward users
                this._tts.enqueueSpeakSentence(messageData.text, userData.userName, type, null, clearRanges)
            }

            // Pipe to VR (basic)
            if(this._pipeForAll) {
                this._twitchHelix.getUser(parseInt(userData.userId)).then(user => {
                    if(user?.profile_image_url) {
                        Utils.downloadImageB64(user?.profile_image_url, true).then(image => {
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
                    label = `🙌 **Cheered ${bits} ${unit}**: `
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
                
                // Discord
                let description = `🏆 **${message.redemption.reward.title}**`
                if(message.redemption.user_input) description +=  `: ${Utils.escapeMarkdown(message.redemption.user_input)}`
                if(this._logChatToDiscord) {
                    this._discord.sendMessage(
                        Config.instance.discord.webhooks[Config.KEY_DISCORD_CHAT],
                        user?.display_name,
                        user?.profile_image_url,
                        description
                    )
                }

                // Pipe to VR (basic)
                const rewardId = message.redemption.reward.id
                const rewardKey = Object.keys(Config.instance.twitch.rewards)
                    .find(key => Config.instance.twitch.rewards[key] === rewardId)
                const showReward = Config.instance.pipe.ignoreRewardsWithKeys.indexOf(rewardKey) < 0
                if(showReward) {
                    if(user?.profile_image_url) {
                        Utils.downloadImageB64(user?.profile_image_url, true).then(image => {
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

        this._twitch.init()
    }
    
    /* 
    ██████  ██    ██ ██ ██      ██████  ███████ ██████  ███████ 
    ██   ██ ██    ██ ██ ██      ██   ██ ██      ██   ██ ██      
    ██████  ██    ██ ██ ██      ██   ██ █████   ██████  ███████ 
    ██   ██ ██    ██ ██ ██      ██   ██ ██      ██   ██      ██ 
    ██████   ██████  ██ ███████ ██████  ███████ ██   ██ ███████ 
    */                                                         

    private buildOBSReward(twitchRewardId: string, obsSourceConfig: IObsSourceConfig, image:string=null): ITwitchReward {
        let reward: ITwitchReward = {
            id: twitchRewardId,
            callback: (data:any) => {
                console.log("OBS Reward triggered")
                this._obs.showSource(obsSourceConfig)
                if(image != null) {
                    let msg = Pipe.getEmptyCustomMessage()
                    msg.properties.headset = true
                    msg.properties.horizontal = false
                    msg.properties.channel = 1
                    msg.properties.duration = obsSourceConfig.duration-1000
                    msg.properties.width = 0.025
                    msg.properties.distance = 0.25
                    msg.properties.yaw = -30
                    msg.properties.pitch = -30
                    msg.transition.duration = 500,
                    msg.transition2.duration = 500
                    msg.image = image
                    this._pipe.sendCustom(msg)
                }
            }
        }
        return reward
    }

    private buildColorReward(twitchRewardKey:string, x:number, y:number): ITwitchReward {
        let reward: ITwitchReward = {
            id: Config.instance.twitch.rewards[twitchRewardKey],
            callback: (data:ITwitchRedemptionMessage) => {
                let userName = data?.redemption?.user?.login
                this._tts.enqueueSpeakSentence('changed the color', userName, GoogleTTS.TYPE_ACTION)
                const lights:number[] = Config.instance.philipshue.lightsToControl
                lights.forEach(light => {
                    this._hue.setLightState(light, x, y)
                })
            }
        }
        return reward
    }
}