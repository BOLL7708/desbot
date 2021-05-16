class MainController {
    private _twitchTokens: TwitchTokens = new TwitchTokens()
    private _twitchPubsub: TwitchPubsub = new TwitchPubsub()
    private _twitchChat: TwitchChat = new TwitchChat()
    private _tts: GoogleTTS = new GoogleTTS()
    private _pipe: NotificationPipe = new NotificationPipe()
    private _obs: OBSWebSockets = new OBSWebSockets()
    private _ttsEnabledUsers: string[] = []
    private _ttsForAll: boolean = false

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
            callback: (data:ITwitchRedemptionMessage) => {
                // if(!this._twitchChat.isConnected()) return // TODO: Need to remake the reward registration so it works for chat and/or pubsub
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
        this._twitchPubsub.registerAward({
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
        this._twitchPubsub.registerAward({
            id: Config.instance.twitch.rewards.find(reward => reward.key == Config.KEY_TTSSETVOICE)?.id,
            callback: (data:ITwitchRedemptionMessage) => {
                let userName = data?.redemption?.user?.login
                let userInput = data?.redemption?.user_input
                console.log(`TTS Voice Set Reward: ${userName} -> ${userInput}`)
                this._tts.setVoiceForUser(userName, userInput)
            }
        })


        /** Chat */
        this._twitchPubsub.init()

        this._twitchChat.init((messageCmd:TwitchMessageCmd) => {
            // TODO: Should all this be specified in the config, like with the PubSub rewards kind of are? How generic to make this?
            let msg = messageCmd.message
            if(msg == null) return
            let username:string = msg.username?.toLowerCase()
            if(typeof username !== 'string' || username.length == 0) return
            let text:string = msg.text?.trim()
            if(typeof text !== 'string' || text.length == 0) return
            let isBroadcaster = messageCmd.properties?.badges?.indexOf('broadcaster/1') >= 0
            let isMod = messageCmd.properties?.mod == '1'

            // console.table(messageCmd.properties)
            // TODO: For now skip reading rewards, in the future register rewards for both pubsub and chat.
            if(typeof messageCmd.properties['custom-reward-id'] === 'string') {
                console.log("Twitch Chat: Skipped as it's a reward.")
                return
            }

            // Commands
            // TODO: Move settings for this into config? Like if broadcaster only/mod only/per command with callback?
            if(text != null && text.indexOf('!') == 0 && (isBroadcaster || isMod)) {
                let command = text.split(' ').shift().substr(1)
                let username = Config.instance.twitch.botName
                switch(command) {
                    case 'ttson': 
                        this._ttsForAll = true
                        this._tts.enqueueSpeakSentence("Global TTS activated", username, GoogleTTS.TYPE_ANNOUNCEMENT)
                        return
                    case 'ttsoff': 
                        this._ttsForAll = false
                        this._tts.enqueueSpeakSentence("Global TTS terminated", username, GoogleTTS.TYPE_ANNOUNCEMENT)
                        return
                    case 'say':
                        this._tts.enqueueSpeakSentence(Utils.splitOnFirst(' ', text).pop() , username, GoogleTTS.TYPE_ANNOUNCEMENT)
                        return
                    default:
                        // Catches invalid commands and prevents ! messages from being spoken
                        console.log(`Unhandled command: ${command}`)
                        return
                }
            }

            // Bots
            let ttsUsers:string[] = Config.instance.twitch.usersWithTts
            let ttsTriggers:string[] = Config.instance.twitch.usersWithTtsTriggers
            if(ttsUsers.indexOf(username) >= 0) {
                // Announcement bots
                ttsTriggers.forEach(trigger => {
                    if(text.indexOf(trigger) == 0) this._tts.enqueueSpeakSentence(text, username, GoogleTTS.TYPE_ANNOUNCEMENT)
                })
            } else {
                let type = msg.isAction ? GoogleTTS.TYPE_ACTION : GoogleTTS.TYPE_SAID
                if(this._ttsForAll) {
                    // TTS is on for everyone
                    this._tts.enqueueSpeakSentence(text, username, type)
                }
                else if(this._ttsEnabledUsers.indexOf(username) >= 0) {
                    // Reward users
                    this._tts.enqueueSpeakSentence(text, username, type)
                }
            }
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