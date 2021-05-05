class MainController {
    private _twitchPubsub: TwitchPubsub = new TwitchPubsub()
    private _tts: GoogleTTS = new GoogleTTS()
    private _pipe: NotificationPipe = new NotificationPipe()
    private _obs: OBSWebSockets = new OBSWebSockets()
    private _twitchChat: TwitchChat = new TwitchChat()

    constructor() {
        this._pipe.sendBasic("PubSub Widget", "Initializing...")

        /** OBS */
        this._twitchPubsub.registerAward(this.buildOBSReward(
            Config.instance.twitch.rewards.find(reward => reward.key == Config.KEY_ROOMPEEK),
            Config.instance.obs.sources.find(source => source.key == Config.KEY_ROOMPEEK)
        ))
        this._twitchPubsub.registerAward(this.buildOBSReward(
            Config.instance.twitch.rewards.find(reward => reward.key == Config.KEY_HEADPEEK),
            Config.instance.obs.sources.find(source => source.key == Config.KEY_HEADPEEK)
        ))
        
        /** TTS */
        this._twitchPubsub.registerAward(this.buildTTSReward(
            Config.instance.twitch.rewards.find(reward => reward.key == Config.KEY_TTSSPEAK),
            Config.KEY_TTSSPEAK
        ))
        this._twitchPubsub.registerAward(this.buildTTSReward(
            Config.instance.twitch.rewards.find(reward => reward.key == Config.KEY_TTSSPEAKLONG),
            Config.KEY_TTSSPEAKLONG
        ))
        this._twitchPubsub.registerAward({
            id: Config.instance.twitch.rewards.find(reward => reward.key == Config.KEY_TTSSETVOICE)?.id,
            callback: (data:any) => {
                let userName = data?.redemption?.user?.login
                let userInput = data?.redemption?.user_input
                console.log(`User input from ${userName} for setting voice: ${userInput}`)
                this._tts.setVoiceForUser(userName, userInput)
            }
        })

        // Run!
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
    }
   
    private buildOBSReward(twitchReward:ITwitchRewardConfig, obsSourceConfig: IObsSourceConfig):IPubsubReward {
        let reward: IPubsubReward = {
            id: twitchReward.id,
            callback: (data:any) => {
                console.log("OBS Reward triggered")
                this._obs.showSource(obsSourceConfig)
            }
        }
        return reward
    }

    private buildTTSReward(twitchReward:ITwitchRewardConfig, ttsKey: string):IPubsubReward {       
        let reward: IPubsubReward = {
            id: twitchReward.id,
            callback: (data:any) => {
                let userName = data?.redemption?.user?.login
                let inputText = data?.redemption?.user_input
                if(userName != null && inputText != null) {
                    this._tts.loadCleanName(userName).then(name => {
                        let text = `${name} said: ${inputText}`
                        console.log("TTS Reward triggered")
                        this._tts.enqueueSpeakSentence(
                            text,
                            userName
                        )
                    })
                }
            }
        }
        return reward
    }
}