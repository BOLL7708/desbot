class MainController {
    private _twitch: Twitch = new Twitch()
    private _twitchHelix: TwitchHelix = new TwitchHelix()
    private _tts: GoogleTTS = new GoogleTTS()
    private _pipe: Pipe = new Pipe()
    private _obs: OBS = new OBS()
    private _screenshots: Screenshots = new Screenshots()
    private _discord: Discord = new Discord()
    private _hue: PhilipsHue = new PhilipsHue()
    
    private _ttsEnabledUsers: string[] = []
    private _ttsForAll: boolean = false

    constructor() {
        // Make sure settings are precached
        Settings.loadSettings(Settings.TTS_BLACKLIST)
        Settings.loadSettings(Settings.TTS_USER_NAMES)
        Settings.loadSettings(Settings.TTS_USER_VOICES)
        Settings.loadSettings(Settings.TWITCH_TOKENS)

        this._pipe.sendBasic("PubSub Widget", "Initializing...")

        /** OBS */
        this._twitch.registerReward(this.buildOBSReward(
            Config.instance.twitch.rewards.find(reward => reward.key == Config.KEY_ROOMPEEK),
            Config.instance.obs.sources.find(source => source.key == Config.KEY_ROOMPEEK),
            Images.YELLOW_DOT
        ))
        this._twitch.registerReward(this.buildOBSReward(
            Config.instance.twitch.rewards.find(reward => reward.key == Config.KEY_HEADPEEK),
            Config.instance.obs.sources.find(source => source.key == Config.KEY_HEADPEEK),
            Images.PINK_DOT
        ))
        
        /** TTS */
        this._twitch.registerReward({
            id: Config.instance.twitch.rewards.find(reward => reward.key == Config.KEY_TTSSPEAK)?.id,
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
            id: Config.instance.twitch.rewards.find(reward => reward.key == Config.KEY_TTSSPEAKTIME)?.id,
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
            id: Config.instance.twitch.rewards.find(reward => reward.key == Config.KEY_TTSSETVOICE)?.id,
            callback: (data:ITwitchRedemptionMessage) => {
                let userName = data?.redemption?.user?.login
                let userInput = data?.redemption?.user_input
                console.log(`TTS Voice Set Reward: ${userName} -> ${userInput}`)
                this._tts.setVoiceForUser(userName, userInput)
            }
        })
        this._twitch.registerReward({
            id: Config.instance.twitch.rewards.find(reward => reward.key == Config.KEY_SCREENSHOT)?.id,
            callback: (data:ITwitchRedemptionMessage) => {
                let userInput = data?.redemption?.user_input
                this._tts.enqueueSpeakSentence(`Photograph ${userInput}`, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                this._screenshots.sendScreenshotRequest(data, Config.instance.screenshots.delay)
            }
        })

        this._twitch.registerCommand({
            trigger: 'ttson',
            mods: true,
            everyone: false,
            callback: (userName, input) => {
                let onText:string = !this._ttsForAll ? "Global TTS activated" : "Global TTS already on"
                this._ttsForAll = true
                this._tts.enqueueSpeakSentence(onText, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: 'ttsoff',
            mods: true,
            everyone: false,
            callback: (userName, input) => {
                let offText = this._ttsForAll ? "Global TTS terminated" : "Global TTS already off"
                this._ttsForAll = false
                this._tts.enqueueSpeakSentence(offText, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: 'silence',
            mods: true,
            everyone: false,
            callback: (userName, input) => {
                this._tts.stopSpeaking()
            }
        })

        this._twitch.registerCommand({
            trigger: 'ttsdie',
            mods: true,
            everyone: false,
            callback: (userName, input) => {
                this._tts.stopSpeaking(true)
            }
        })

        this._twitch.registerCommand({
            trigger: 'say',
            mods: true,
            everyone: false,
            callback: (userName, input) => {
                this._tts.enqueueSpeakSentence(input, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.registerCommand({
            trigger: 'nick',
            mods: true,
            everyone: false,
            callback: (userName, input) => {
                let parts = Utils.splitOnFirst(' ', input)
                if(parts.length == 2) {
                    Settings.pushSetting(Settings.TTS_USER_NAMES, 'userName', {userName: parts[0], shortName: parts[1]})
                    this._tts.enqueueSpeakSentence(`${parts[0]} is now called ${parts[1]}`, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                }
            }
        })

        this._twitch.registerCommand({
            trigger: 'mute',
            mods: true,
            everyone: false,
            callback: (userName, input) => {
                let parts = Utils.splitOnFirst(' ', input)
                let name = parts[0] ?? ''
                if(name.length > 0 && name.toLowerCase() != Config.instance.twitch.botName.toLowerCase()) {
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
            callback: (userName, input) => {
                let parts = Utils.splitOnFirst(' ', input)
                let name = parts[0] ?? ''
                if(name.length > 0) {
                    let reason = (parts[1] ?? '').replace('|', ' ').replace(';', ' ')
                    Settings.pushSetting(Settings.TTS_BLACKLIST, 'userName', { userName: name, active: false, reason: reason })
                    Utils.loadCleanName(name).then(cleanName => {
                        this._tts.enqueueSpeakSentence(`${cleanName} has regained their voice`, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                    })
                }
            }
        })

        this._twitch.registerAnnouncement({
            userName: Config.instance.twitch.announcerName.toLowerCase(),
            trigger: Config.instance.twitch.announcerTrigger.toLowerCase(),
            callback: (userName, input) => {
                this._tts.enqueueSpeakSentence(input, userName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        this._twitch.setChatCheerCallback((userName, input, bits) => {
            this._tts.enqueueSpeakSentence(input, userName, GoogleTTS.TYPE_CHEER, bits)
        })

        this._twitch.setChatCallback((userName, input, isAction) => {
            let type = GoogleTTS.TYPE_SAID
            if(isAction) type = GoogleTTS.TYPE_ACTION
            
            if(this._ttsForAll) { 
                // TTS is on for everyone
                this._tts.enqueueSpeakSentence(input, userName, type)
            }
            else if(this._ttsEnabledUsers.indexOf(userName) >= 0) {
                // Reward users
                this._tts.enqueueSpeakSentence(input, userName, type)
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

        this._twitch.init()

        // this._discord.sendText(Config.instance.discord.webhooks.find(hook => hook.key == Config.KEY_DISCORD_SSSVR), "Widget reloaded...")

        this._screenshots.setScreenshotCallback((data) => {
            let reward = this._screenshots.getScreenshotRequest(parseInt(data.nonce))
            let discordCfg = Config.instance.discord.webhooks.find(hook => hook.key == Config.KEY_DISCORD_SSSVR)            
            let blob = Utils.b64toBlob(data.image, "image/png")
            if(reward != null) {
                this._twitchHelix.getUser(parseInt(reward.redemption?.user?.id)).then(user => {
                    var description = reward.redemption?.user_input
                    var authorName = reward.redemption?.user?.display_name
                    var authorUrl = `https://twitch.tv/${reward.redemption?.user?.login ?? ''}`
                    var authorIconUrl = user?.profile_image_url
                    this._discord.sendPayloadEmbed(discordCfg, blob, '', `Photograph: ${description}`, authorName, authorUrl, authorIconUrl)
                })
            } else {
                this._discord.sendPayloadEmbed(discordCfg, blob, 'Manual Screenshot')
            }
        })

        this._obs.registerSceneChangeCallback((sceneName) => {
            let filterScene = Config.instance.obs.filterOnScenes.indexOf(sceneName) >= 0
            this._ttsForAll = !filterScene
        })
    }
   
    private buildOBSReward(twitchReward:ITwitchRewardConfig, obsSourceConfig: IObsSourceConfig, image:string=null): ITwitchReward {
        let reward: ITwitchReward = {
            id: twitchReward.id,
            callback: (data:any) => {
                console.log("OBS Reward triggered")
                this._obs.showSource(obsSourceConfig)
                if(image != null) {
                    let msg = Pipe.getEmptyCustomMessage()
                    msg.properties.headset = true
                    msg.properties.horizontal = false
                    msg.properties.channel = 1
                    msg.properties.duration = 9000
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

    private buildColorReward(id:string, x:number, y:number): ITwitchReward {
        let config: ITwitchRewardConfig = Config.instance.twitch.rewards.find(reward => reward.key == id)
        let reward: ITwitchReward = {
            id: config.id,
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