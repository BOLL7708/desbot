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
            callback: (data:ITwitchRedemptionMessage) => {
                console.log("TTS Time Reward")
                let username = data?.redemption?.user?.login
                if(username != null && username.length != 0 && this._ttsEnabledUsers.indexOf(username) < 0) {
                    this._ttsEnabledUsers.push(username)
                    console.log(`User added to TTS list: ${username}`)
                    // TODO: TTS that the user has gained a voice? Maybe whisper instead?
                }
                setTimeout(()=>{
                    let index = this._ttsEnabledUsers.indexOf(username)
                    let removed = this._ttsEnabledUsers.splice(index)
                    console.log(`User removed from TTS list: ${removed}`)
                    // TODO: TTS that the user has lost their voice? Maybe whisper instead?
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
                switch(command) {
                    case 'ttson': 
                        this._ttsForAll = true
                        this._tts.enqueueSpeakSentence("Global TTS activated", null)
                        return
                    case 'ttsoff': 
                        this._ttsForAll = false
                        this._tts.enqueueSpeakSentence("Global TTS terminated", null)
                        return
                    default: 
                        console.log(`Unhandled command: ${command}`)
                }
            }

            // Bots
            let ttsUsers:string[] = Config.instance.twitch.usersWithTts
            let ttsTriggers:string[] = Config.instance.twitch.usersWithTtsTriggers
            let say = () => {
                this._tts.loadCleanName(username).then(name => {
                    let ignore:string[] = Config.instance.twitch.usersWithTtsIgnore
                    if(text == null || text.length == 0 || ignore.indexOf(text[0]) == 0) return
                    let spokenText = msg.isAction ? `${name} ${text}` : `${name} said: ${text}`
                    this._tts.enqueueSpeakSentence(spokenText, username)
                })
            }
            if(ttsUsers.indexOf(username) >= 0) {
                // Announcement bots
                ttsTriggers.forEach(trigger => {
                    if(msg.text.indexOf(trigger) == 0) this._tts.enqueueSpeakSentence(text, username)
                })
            } else {
                if(this._ttsForAll) {
                    // TTS is on for everyone
                    say()
                }
                else if(this._ttsEnabledUsers.indexOf(username) >= 0) {
                    // Reward users
                    say()
                }
            }

            

            // TODO: We should fix the /me commands
            // TODO: Toggle this on and off with commands or URL params
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