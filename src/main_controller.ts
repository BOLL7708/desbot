class MainController {
    private _twitchTokens: TwitchTokens = new TwitchTokens()
    private _twitchPubsub: TwitchPubsub = new TwitchPubsub()
    private _twitchChat: TwitchChat = new TwitchChat()
    private _tts: GoogleTTS = new GoogleTTS()
    private _pipe: NotificationPipe = new NotificationPipe()
    private _obs: OBSWebSockets = new OBSWebSockets()

    constructor() {
        this._pipe.sendBasic("PubSub Widget", "Initializing...")

        /** OBS */
        this._twitchPubsub.registerAward(this.buildOBSReward(
            Config.instance.twitch.rewards.find(reward => reward.key == Config.KEY_ROOMPEEK),
            Config.instance.obs.sources.find(source => source.key == Config.KEY_ROOMPEEK),
            Images.YELLOW_DOT
        ))
        this._twitchPubsub.registerAward(this.buildOBSReward(
            Config.instance.twitch.rewards.find(reward => reward.key == Config.KEY_HEADPEEK),
            Config.instance.obs.sources.find(source => source.key == Config.KEY_HEADPEEK),
            Images.PINK_DOT
        ))
        
        /** TTS */
        this._twitchPubsub.registerAward({
            id: Config.instance.twitch.rewards.find(reward => reward.key == Config.KEY_TTSSPEAK)?.id,
            callback: (data:any) => {
                let userName = data?.redemption?.user?.login
                let inputText = data?.redemption?.user_input
                if(userName != null && inputText != null) {
                    this._tts.loadCleanName(userName).then(name => {
                        let text = `${name} said: ${inputText}`
                        console.log("TTS Message Reward")
                        this._tts.enqueueSpeakSentence(
                            text,
                            userName
                        )
                    })
                }
            }
        })
        this._twitchPubsub.registerAward({
            id: Config.instance.twitch.rewards.find(reward => reward.key == Config.KEY_TTSSPEAKTIME)?.id,
            callback: (data:any) => {
                console.log("TTS Time Reward")
                // TODO: This should set a timer here to pipe chat for a specific user to tts.
            }
        })
        this._twitchPubsub.registerAward({
            id: Config.instance.twitch.rewards.find(reward => reward.key == Config.KEY_TTSSETVOICE)?.id,
            callback: (data:any) => {
                let userName = data?.redemption?.user?.login
                let userInput = data?.redemption?.user_input
                console.log(`TTS Voice Set Reward: ${userName} -> ${userInput}`)
                this._tts.setVoiceForUser(userName, userInput)
            }
        })


        /** Chat */
        this._twitchPubsub.init()

        this._twitchChat.init((message:TwitchMessage) => {
            if(message?.username?.toLowerCase() == "streamlabs") { // TODO: Hardcoded now, should be a config
                if(message?.text?.indexOf('Shoutout to') != 0) { // TODO: Hardcoded now, should be handled differently
                    this._tts.enqueueSpeakSentence(message.text, message.username)
                }
            }
            // TODO: We should fix the /me commands
            // TODO: Toggle this on and off with commands or URL params
            // TODO: Key all settings on username instead of userid, to work with chat
            // TODO: limit pitch even further, or remove? Automatic?
        })

        this._twitchTokens.refresh()
    }
   
    private buildOBSReward(twitchReward:ITwitchRewardConfig, obsSourceConfig: IObsSourceConfig, image:string=null):IPubsubReward {
        let reward: IPubsubReward = {
            id: twitchReward.id,
            callback: (data:any) => {
                console.log("OBS Reward triggered")
                this._obs.showSource(obsSourceConfig)
                if(image != null) {
                    let msg = NotificationPipe.getEmptyCustomMessage()
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