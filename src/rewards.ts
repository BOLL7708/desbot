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
            const config = <ITwitchHelixRewardConfig> Utils.getEventConfig(key)?.triggers.reward
            if(config) {
                const configClone = Utils.clone(Array.isArray(config) ? config[0] : config)
                configClone.title = await Utils.replaceTagsInText(configClone.title, await Actions.buildEmptyUserData(EEventSource.Created, key))
                configClone.prompt = await Utils.replaceTagsInText(configClone.prompt, await Actions.buildEmptyUserData(EEventSource.Created, key))
                let reward = await modules.twitchHelix.createReward(configClone)
                if(reward && reward.data && reward.data.length > 0) {
                    await Settings.pushSetting(Settings.TWITCH_REWARDS, 'key', {key: key, id: reward.data[0].id})
                }
            } else {
                console.warn(`Reward ${key} is missing a setup.`)
            }
        }

        // Toggle TTS rewards
        modules.twitchHelix.updateReward(await Utils.getRewardId('Speak'), {is_enabled: !states.ttsForAll}).then()

        // Enable default rewards
        const enableRewards = Config.twitch.alwaysOnRewards.filter(rewardKey => { return !Config.twitch.alwaysOffRewards.includes(rewardKey) })
        for(const key of enableRewards) {
            modules.twitchHelix.updateReward(await Utils.getRewardId(key), {is_enabled: true}).then()
        }
        
        // Disable unwanted rewards
        for(const key of Config.twitch.alwaysOffRewards) {
            modules.twitchHelix.updateReward(await Utils.getRewardId(key), {is_enabled: false}).then()
        }
    }
    public static callbacks: IActionsCallbackStack = {
        /*
        .######..#####....####...#####...##..##..##..##.
        ...##....##..##..##..##..##..##..##..##...####..
        ...##....#####...##..##..#####...######....##...
        ...##....##..##..##..##..##......##..##....##...
        ...##....##..##...####...##......##..##....##...
        */
        'ChannelTrophy': {
            tag: 'ChannelTrophy',
            description: 'A user grabbed the Channel Trophy.',
            call: async (user: IActionUser) => {
                const modules = ModulesSingleton.getInstance()
                
                // Save stat
                const row: IChannelTrophyStat = {
                    userId: user.id,
                    index: user.rewardMessage?.data?.redemption.reward.redemptions_redeemed_current_stream,
                    cost: user.rewardMessage?.data?.redemption.reward.cost.toString() ?? '0'
                }
                const settingsUpdated = await Settings.appendSetting(Settings.CHANNEL_TROPHY_STATS, row)
                if(!settingsUpdated) return Utils.log('ChannelTrophy: Could not write settings reward: ChannelTrophy', Color.Red)

                const userData = await modules.twitchHelix.getUserById(parseInt(user.id))
                if(userData == undefined) return Utils.log('ChannelTrophy: Could not retrieve user for reward: ChannelTrophy', Color.Red)

                // Update reward
                const rewardId = await Utils.getRewardId('ChannelTrophy')
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
                            )
                        ).then()
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
                    const configArrOrNot = Utils.getEventConfig('ChannelTrophy')?.triggers.reward
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
                        if(!updatedReward) Utils.log(`ChannelTrophy: Was redeemed, but could not be updated: ChannelTrophy->${rewardId}`, Color.Red)
                    } else Utils.log(`ChannelTrophy: Was redeemed, but no config found: ChannelTrophy->${rewardId}`, Color.Red)
                } else Utils.log(`ChannelTrophy: Could not get reward data from helix: ChannelTrophy->${rewardId}`, Color.Red)
            }
        }
    }
}