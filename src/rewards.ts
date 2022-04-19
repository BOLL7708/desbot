class Rewards {
    public static async init() {
        /*
        .########..########.##......##....###....########..########...######.
        .##.....##.##.......##..##..##...##.##...##.....##.##.....##.##....##
        .##.....##.##.......##..##..##..##...##..##.....##.##.....##.##......
        .########..######...##..##..##.##.....##.########..##.....##..######.
        .##...##...##.......##..##..##.#########.##...##...##.....##.......##
        .##....##..##.......##..##..##.##.....##.##....##..##.....##.##....##
        .##.....##.########..###..###..##.....##.##.....##.########...######.
        */
        const modules = ModulesSingleton.getInstance()
        const states = StatesSingleton.getInstance()
    

        // Load reward IDs from settings
        let storedRewards = Settings.getFullSettings<ITwitchRewardPair>(Settings.TWITCH_REWARDS)
        if(storedRewards == undefined) storedRewards = []

        // Create missing rewards if any
        const allRewardKeys = Object.keys(Config.twitch.rewardConfigs)
        const missingRewardKeys = allRewardKeys.filter(key => !storedRewards?.find(reward => reward.key == key))
        for(const key of missingRewardKeys) {
            const setup = Config.twitch.rewardConfigs[key]
            let reward = await modules.twitchHelix.createReward(Array.isArray(setup) ? setup[0] : setup)
            if(reward && reward.data && reward.data.length > 0) {
                await Settings.pushSetting(Settings.TWITCH_REWARDS, 'key', {key: key, id: reward.data[0].id})
            }
        }

        // Reset rewards with multiple steps
        for(const key of allRewardKeys) {
            if(Config.controller.resetIncrementingRewardsOnLoad.includes(key)) {
                const setup = Config.twitch.rewardConfigs[key]
                if(Array.isArray(setup)) {
                    const current = await Settings.pullSetting<ITwitchRewardCounter>(Settings.TWITCH_REWARD_COUNTERS, 'key', key)
                    if((current?.count ?? 0) > 0) {
                        Utils.log(`Resetting incrementing reward: ${key}`, Color.Green)
                        const reset: ITwitchRewardCounter = {key: key, count: 0}
                        await Settings.pushSetting(Settings.TWITCH_REWARD_COUNTERS, 'key', reset)
                        await modules.twitchHelix.updateReward(await Utils.getRewardId(key), setup[0])
                    }
                }
            }
        }

        // Toggle TTS rewards
        modules.twitchHelix.updateReward(await Utils.getRewardId(Keys.KEY_TTSSPEAK), {is_enabled: !states.ttsForAll})

        // Enable default rewards
        const enableRewards = Config.twitch.defaultRewards.filter(reward => { return !Config.twitch.disableRewards.includes(reward) })
        for(const key of enableRewards) {
            modules.twitchHelix.updateReward(await Utils.getRewardId(key), {is_enabled: true})
        }
        
        // Disable unwanted rewards
        for(const key of Config.twitch.disableRewards) {
            modules.twitchHelix.updateReward(await Utils.getRewardId(key), {is_enabled: false})
        }

        /*
        .######..######...####..
        ...##......##....##.....
        ...##......##.....####..
        ...##......##........##.
        ...##......##.....####..
        */
        modules.twitch.registerReward({
            id: await Utils.getRewardId(Keys.KEY_TTSSPEAK),
            callback: (data:ITwitchRedemptionMessage) => {
                const userName = data?.redemption?.user?.login
                const inputText = data?.redemption?.user_input
                if(userName != null && inputText != null) {
                    Utils.log("TTS Message Reward", Color.DarkOrange)
                    modules.tts.enqueueSpeakSentence(
                        inputText,
                        userName,
                        GoogleTTS.TYPE_SAID
                    )
                }
            }
        })
        modules.twitch.registerReward({
            id: await Utils.getRewardId(Keys.KEY_TTSSETVOICE),
            callback: async (data:ITwitchRedemptionMessage) => {
                const userName = data?.redemption?.user?.login
                const displayName = data?.redemption?.user?.display_name
                const userInput = data?.redemption?.user_input
                Utils.log(`TTS Voice Set Reward: ${userName} -> ${userInput}`, Color.DarkOrange)
                const voiceName = await modules.tts.setVoiceForUser(userName, userInput)
                modules.twitch._twitchChatOut.sendMessageToChannel(`@${displayName} voice: ${voiceName}`)
            }
        })
        modules.twitch.registerReward({
            id: await Utils.getRewardId(Keys.KEY_TTSSWITCHVOICEGENDER),
            callback: (data:ITwitchRedemptionMessage) => {
                const userName = data?.redemption?.user?.login
                Utils.log(`TTS Gender Set Reward: ${userName}`, Color.DarkOrange)
                Settings.pullSetting<IUserVoice>(Settings.TTS_USER_VOICES, 'userName', userName).then(voice => {
                    const voiceSetting = voice
                    let gender:string = ''
                    if(voiceSetting != null) gender = voiceSetting.gender.toLowerCase() == 'male' ? 'female' : 'male'
                    modules.tts.setVoiceForUser(userName, `reset ${gender}`)
                })
            }
        })

        /*
        .######..#####....####...#####...##..##..##..##.
        ...##....##..##..##..##..##..##..##..##...####..
        ...##....#####...##..##..#####...######....##...
        ...##....##..##..##..##..##......##..##....##...
        ...##....##..##...####...##......##..##....##...
        */
        modules.twitch.registerReward({
            id: await Utils.getRewardId(Keys.KEY_CHANNELTROPHY),
            callback: async (message:ITwitchRedemptionMessage) => {
                // Save stat
                const row: IChannelTrophyStat = {
                    userId: message.redemption.user.id,
                    index: message.redemption.reward.redemptions_redeemed_current_stream,
                    cost: message.redemption.reward.cost.toString()
                }
                Settings.appendSetting(Settings.CHANNEL_TROPHY_STATS, row)

                const user = await modules.twitchHelix.getUserById(parseInt(message.redemption.user.id))
                if(user == undefined) return Utils.log(`Could not retrieve user for reward: ${Keys.KEY_CHANNELTROPHY}`, Color.Red)
                
                // Effects
                const signCallback = AutoRewards.buildSignCallback(Config.sign.configs[Keys.KEY_CHANNELTROPHY])
                signCallback?.call(this, message)
                const soundCallback = AutoRewards.buildSoundAndSpeechCallback(Config.audioplayer.configs[Keys.KEY_CHANNELTROPHY], undefined, '', true)
                soundCallback?.call(this, message) // TODO: Should find a new sound for this.

                // Update reward
                const rewardId = await Utils.getRewardId(Keys.KEY_CHANNELTROPHY)
                const rewardData = await modules.twitchHelix.getReward(rewardId ?? '')
                if(rewardData?.data?.length == 1) { // We only loaded one reward, so this should be 1
                    const cost = rewardData.data[0].cost
                    
                    // Do TTS
                    const funnyNumberConfig = ChannelTrophy.detectFunnyNumber(parseInt(row.cost))
                    if(funnyNumberConfig != null && Config.controller.channelTrophySettings.ttsOn) {
                        modules.tts.enqueueSpeakSentence(
                            Utils.template(funnyNumberConfig.speech, user.login), 
                            Config.twitch.chatbotName, 
                            GoogleTTS.TYPE_ANNOUNCEMENT
                        )
                    }
                    // Update label in overlay
                    Settings.pushLabel(
                        Settings.CHANNEL_TROPHY_LABEL, 
                        Utils.template(Config.controller.channelTrophySettings.label, cost, user.display_name)
                    )
                    
                    // Update reward
                    const configArrOrNot = Config.twitch.rewardConfigs[Keys.KEY_CHANNELTROPHY]
                    const config = Array.isArray(configArrOrNot) ? configArrOrNot[0] : configArrOrNot
                    if(config != undefined) {
                        const newCost = cost+1;
                        const updatedReward = await modules.twitchHelix.updateReward(rewardId, {
                            title: Utils.template(Config.controller.channelTrophySettings.rewardTitle, user.display_name),
                            cost: newCost,
                            is_global_cooldown_enabled: true,
                            global_cooldown_seconds: (config.global_cooldown_seconds ?? 30) + Math.round(Math.log(newCost)*Config.controller.channelTrophySettings.rewardCooldownMultiplier),
                            prompt: Utils.template(Config.controller.channelTrophySettings.rewardPrompt, user.display_name, config.prompt ?? '', newCost)
                        })
                        if(updatedReward == undefined) Utils.log(`Channel Trophy redeemed, but could not be updated.`, Color.Red)
                    } else Utils.log(`Channel Trophy redeemed, but no config found.`, Color.Red)
                } else Utils.log(`Could not retrieve Reward Data for reward: ${Keys.KEY_CHANNELTROPHY}`, Color.Red)
            }
        })
    }
}