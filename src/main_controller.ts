class MainController {
    private _twitchPubsub: TwitchPubsub = new TwitchPubsub();
    private _tts: GoogleTTS = new GoogleTTS()
    private _pipe: NotificationPipe = new NotificationPipe()

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

        this._twitchPubsub.init()
    }
   
    private buildOBSReward(twitchReward:ITwitchRewardConfig, obsSourceConfig: IObsSourceConfig):IPubsubReward {
        let reward: IPubsubReward = {
            id: twitchReward.id,
            callback: (data:any) => {
                console.log("OBS Reward triggered")
                console.table(data)

            }
        }
        return reward
    }

    private buildTTSReward(twitchReward:ITwitchRewardConfig, ttsKey: string):IPubsubReward {
        let reward: IPubsubReward = {
            id: twitchReward.id,
            callback: (data:any) => {
                console.log("TTS Reward triggered")
                this._tts.enqueueSpeakSentence(
                    data?.redemption?.user_input,
                    data?.redemption?.user?.display_name,
                    parseInt(data?.redemption?.user?.id)
                )
            }
        }
        return reward
    }
}