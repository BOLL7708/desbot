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
        const allRewardKeys = Utils.getAllEventKeys(true)
        const missingRewardKeys = allRewardKeys.filter(key => !storedRewards?.find(reward => reward.key == key))
        for(const key of missingRewardKeys) {
            const setup = <ITwitchHelixRewardConfig> Utils.getEventConfig(key)?.triggers.reward
            if(setup) {
                let reward = await modules.twitchHelix.createReward(Array.isArray(setup) ? setup[0] : setup)
                if(reward && reward.data && reward.data.length > 0) {
                    await Settings.pushSetting(Settings.TWITCH_REWARDS, 'key', {key: key, id: reward.data[0].id})
                }
            } else {
                console.warn(`Reward ${key} is missing a setup.`)
            }
        }

        // Toggle TTS rewards
        modules.twitchHelix.updateReward(await Utils.getRewardId(Keys.REWARD_TTSSPEAK), {is_enabled: !states.ttsForAll})

        // Enable default rewards
        const enableRewards = Config.twitch.alwaysOnRewards.filter(reward => { return !Config.twitch.alwaysOffRewards.includes(reward) })
        for(const key of enableRewards) {
            modules.twitchHelix.updateReward(await Utils.getRewardId(key), {is_enabled: true})
        }
        
        // Disable unwanted rewards
        for(const key of Config.twitch.alwaysOffRewards) {
            modules.twitchHelix.updateReward(await Utils.getRewardId(key), {is_enabled: false})
        }
    }
    public static callbacks: { [key: string]: ITwitchActionCallback|undefined } = {
        /*
        .######..######...####..
        ...##......##....##.....
        ...##......##.....####..
        ...##......##........##.
        ...##......##.....####..
        */
        [Keys.REWARD_TTSSPEAK]: (user: IActionUser) => {
            if(user.login.length > 0 && user.input.length > 0) {
                Utils.log("TTS Message Reward", Color.DarkOrange)
                ModulesSingleton.getInstance().tts.enqueueSpeakSentence(
                    user.input,
                    user.login,
                    GoogleTTS.TYPE_SAID
                )
            }
        },
        [Keys.REWARD_TTSSETVOICE]: async (user: IActionUser) => {
            Utils.log(`TTS Voice Set Reward: ${user.login} -> ${user.input}`, Color.DarkOrange)
            const modules = ModulesSingleton.getInstance()
            await modules.tts.setVoiceForUser(user.login, user.input)
            const voiceData = await Settings.pullSetting<IUserVoice>(Settings.TTS_USER_VOICES,'userName', user.login)
            const voiceName = voiceData?.voiceName ?? ''
            const voiceText = voiceName.length == 0 
                ? `${voiceData?.languageCode.toUpperCase()} ${voiceData?.gender.toUpperCase()}` 
                : `${voiceName.toUpperCase()}`
            modules.twitch._twitchChatOut.sendMessageToChannel(
                `@${user.name} got their voice set to: ${voiceText}`
            )
        },
        [Keys.REWARD_TTSSWITCHVOICEGENDER]: (user: IActionUser) => {
            Utils.log(`TTS Gender Set Reward: ${user.login}`, Color.DarkOrange)
            Settings.pullSetting<IUserVoice>(Settings.TTS_USER_VOICES, 'userName', user.login).then(voice => {
                const voiceSetting = voice
                let gender:string = ''
                if(voiceSetting != null) gender = voiceSetting.gender.toLowerCase() == 'male' ? 'female' : 'male'
                ModulesSingleton.getInstance().tts.setVoiceForUser(user.login, `reset ${gender}`)
            })
        },
        /*
        .######..#####....####...#####...##..##..##..##.
        ...##....##..##..##..##..##..##..##..##...####..
        ...##....#####...##..##..#####...######....##...
        ...##....##..##..##..##..##......##..##....##...
        ...##....##..##...####...##......##..##....##...
        */
        [Keys.REWARD_CHANNELTROPHY]: async (user: IActionUser, index: number|undefined, message: ITwitchPubsubRewardMessage|undefined) => {
            const modules = ModulesSingleton.getInstance()
            
            // Save stat
            const row: IChannelTrophyStat = {
                userId: user.id,
                index: message?.data?.redemption.reward.redemptions_redeemed_current_stream,
                cost: message?.data?.redemption.reward.cost.toString() ?? '0'
            }
            const settingsUpdated = await Settings.appendSetting(Settings.CHANNEL_TROPHY_STATS, row)
            if(!settingsUpdated) return Utils.log(`ChannelTrophy: Could not write settings reward: ${Keys.REWARD_CHANNELTROPHY}`, Color.Red)

            const userData = await modules.twitchHelix.getUserById(parseInt(user.id))
            if(userData == undefined) return Utils.log(`ChannelTrophy: Could not retrieve user for reward: ${Keys.REWARD_CHANNELTROPHY}`, Color.Red)

            // Update reward
            const rewardId = await Utils.getRewardId(Keys.REWARD_CHANNELTROPHY)
            const rewardData = await modules.twitchHelix.getReward(rewardId ?? '')
            if(rewardData?.data?.length == 1) { // We only loaded one reward, so this should be 1
                const cost = rewardData.data[0].cost
                
                // Do TTS
                const funnyNumberConfig = ChannelTrophy.detectFunnyNumber(parseInt(row.cost))
                if(funnyNumberConfig != null && Config.controller.channelTrophySettings.ttsOn) {
                    modules.tts.enqueueSpeakSentence(
                        await Utils.replaceTagsInText(
                            funnyNumberConfig.speech, 
                            user
                        ), 
                        Config.twitch.chatbotName, 
                        GoogleTTS.TYPE_ANNOUNCEMENT
                    )
                }
                // Update label in overlay
                const labelUpdated = await Settings.pushLabel(
                    Settings.CHANNEL_TROPHY_LABEL, 
                    await Utils.replaceTagsInText(
                        Config.controller.channelTrophySettings.label, 
                        user,
                        { number: cost.toString(), userName: user.name }
                    )
                )
                if(!labelUpdated) return Utils.log(`ChannelTrophy: Could not write label`, Color.Red)
                
                // Update reward
                const configArrOrNot = Utils.getEventConfig(Keys.REWARD_CHANNELTROPHY)?.triggers.reward
                const config = Array.isArray(configArrOrNot) ? configArrOrNot[0] : configArrOrNot
                if(config != undefined) {
                    const newCost = cost+1;
                    const updatedReward = await modules.twitchHelix.updateReward(rewardId, {
                        title: await Utils.replaceTagsInText(
                            Config.controller.channelTrophySettings.rewardTitle, 
                            user
                        ),
                        cost: newCost,
                        is_global_cooldown_enabled: true,
                        global_cooldown_seconds: (config.global_cooldown_seconds ?? 30) + Math.round(Math.log(newCost)*Config.controller.channelTrophySettings.rewardCooldownMultiplier),
                        prompt: await Utils.replaceTagsInText(
                            Config.controller.channelTrophySettings.rewardPrompt,
                            user,
                            { 
                                prompt: config.prompt ?? '', 
                                number: newCost.toString() 
                            }
                        )
                    })
                    if(!updatedReward) Utils.log(`ChannelTrophy: Was redeemed, but could not be updated: ${Keys.REWARD_CHANNELTROPHY}->${rewardId}`, Color.Red)
                } else Utils.log(`ChannelTrophy: Was redeemed, but no config found: ${Keys.REWARD_CHANNELTROPHY}->${rewardId}`, Color.Red)
            } else Utils.log(`ChannelTrophy: Could not get reward data from helix: ${Keys.REWARD_CHANNELTROPHY}->${rewardId}`, Color.Red)
        }
    }
}