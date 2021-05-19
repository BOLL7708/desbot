class MainController {
    private _twitch: Twitch = new Twitch()
    private _tts: GoogleTTS = new GoogleTTS()
    private _pipe: Pipe = new Pipe()
    private _obs: OBS = new OBS()
    private _screenshots: Screenshots = new Screenshots()
    private _ttsEnabledUsers: string[] = []
    private _ttsForAll: boolean = false

    constructor() {
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
                let userName = data?.redemption?.user?.login
                let userInput = data?.redemption?.user_input
                this._tts.enqueueSpeakSentence(`Photograph ${userInput}`, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
                this._screenshots.sendScreenshotRequest(data?.redemption?.user?.login, Config.instance.screenshots.delay)
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
            trigger: 'say',
            mods: true,
            everyone: false,
            callback: (userName, input) => {
                this._tts.enqueueSpeakSentence(input, Config.instance.twitch.botName, GoogleTTS.TYPE_ANNOUNCEMENT)
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

        this._twitch.init()
      
        this._obs.registerSceneChangeCallback((sceneName) => {
            let filterScene = Config.instance.obs.filterOnScenes.indexOf(sceneName) >= 0
            this._ttsForAll = !filterScene
        })
    }
   
    private buildOBSReward(twitchReward:ITwitchRewardConfig, obsSourceConfig: IObsSourceConfig, image:string=null):ITwitchReward {
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
}