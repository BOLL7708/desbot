class Functions {
    /*
    .########.##.....##.##....##..######..########.####..#######..##....##..######.
    .##.......##.....##.###...##.##....##....##.....##..##.....##.###...##.##....##
    .##.......##.....##.####..##.##..........##.....##..##.....##.####..##.##......
    .######...##.....##.##.##.##.##..........##.....##..##.....##.##.##.##..######.
    .##.......##.....##.##..####.##..........##.....##..##.....##.##..####.......##
    .##.......##.....##.##...###.##....##....##.....##..##.....##.##...###.##....##
    .##........#######..##....##..######.....##....####..#######..##....##..######.
    */
    public static setEmptySoundForTTS() {
        const modules = ModulesSingleton.getInstance()
        const states = StatesSingleton.getInstance()
        const audio = states.pingForChat ? Config.audioplayer.configs[Keys.KEY_MIXED_CHAT] : null           
        modules.tts.setEmptyMessageSound(audio)
    }

    public static async appIdCallback(appId: string) {
        const modules = ModulesSingleton.getInstance()
        const states = StatesSingleton.getInstance()
        // Skip if we should ignore this app ID.
        if(Config.steam.ignoredAppIds.indexOf(appId) !== -1) return console.log(`Steam: Ignored AppId: ${appId}`)

        // Skip if it's the last app ID again.
        if(appId != undefined && appId.length > 0) {
            if(appId == states.lastSteamAppId) return
            Utils.log(`Steam AppId is new: "${appId}" != "${states.lastSteamAppId}"`, Color.DarkBlue)
            states.lastSteamAppId = appId
            // Load achievements before we update the ID for everything else, so we don't overwrite them by accident.
            await Settings.loadSettings(Settings.getPathFromKey(Settings.STEAM_ACHIEVEMENTS, appId))
            await SteamWebApi.getGameSchema(appId)
            await SteamWebApi.getGlobalAchievementStats(appId)
            await Functions.loadAchievements()
        }

        /**
         * Controller defaults loading
         */
        if(appId != undefined) {
            const controllerGameDefaults = Config.controller.gameDefaults[appId]
            let combinedSettings = Config.controller.defaults
            if(controllerGameDefaults != undefined) {
                combinedSettings = {...combinedSettings, ...controllerGameDefaults}
                Utils.log(`Applying controller settings for: ${appId}`, Color.Green )
            } else {
                Utils.log(`Applying default, as no controller settings for: ${appId}`, Color.Green )
            }
            
            // TTS runs the command due to doing more things than just toggling the flag.
            modules.twitch.runCommand(combinedSettings.ttsForAll ? Keys.COMMAND_TTS_ON : Keys.COMMAND_TTS_OFF)
            states.pipeAllChat = combinedSettings.pipeAllChat
            states.pingForChat = combinedSettings.pingForChat
            this.setEmptySoundForTTS.call(this) // Needed as that is down in a module and does not read the fla directly.
            states.logChatToDiscord = combinedSettings.logChatToDiscord
            states.useGameSpecificRewards = combinedSettings.useGameSpecificRewards // OBS: Running the command for this will create infinite loop.
            states.updateTwitchGameCategory = combinedSettings.updateTwitchGameCategory
        }

        /**
         * General reward toggling
         */
        const defaultProfile = Config.twitch.rewardConfigProfileDefault
        const profile = Config.twitch.rewardConfigProfilePerGame[appId]
        if(appId == undefined) {
            Utils.log(`Applying profile for no game as app ID was undefined`, Color.Green)
            modules.twitchHelix.toggleRewards({...defaultProfile, ...Config.twitch.rewardConfigProfileNoGame})
        } else if(profile != undefined) {
            Utils.log(`Applying game reward profile for: ${appId}`, Color.Green)
            modules.twitchHelix.toggleRewards({...defaultProfile, ...profile})
        } else {
            Utils.log(`Applying default, as no game reward profile for: ${appId}`, Color.Green)
            modules.twitchHelix.toggleRewards(defaultProfile)
        }

        /**
         * Game specific reward configuration
         */
        const allGameRewardKeys = Config.twitch.gameSpecificRewards
        const gameSpecificRewards = states.useGameSpecificRewards ? Config.twitch.gameSpecificRewardsPerGame[appId] : undefined
        const availableRewardKeys = gameSpecificRewards != undefined ? Object.keys(gameSpecificRewards) : []

        /**
         * Toggle individual rewards on/off depending on the app ID
         */
        for(const rewardKey of Object.keys(Config.twitch.turnOnRewardForGames)) {
            const games = Config.twitch.turnOnRewardForGames[rewardKey] ?? []
            Utils.log(`Toggling reward <${rewardKey}> depending on game.`, Color.Green)
            modules.twitchHelix.toggleRewards({[rewardKey]: games.indexOf(appId) != -1})
        }
        for(const rewardKey of Object.keys(Config.twitch.turnOffRewardForGames)) {
            const games = Config.twitch.turnOffRewardForGames[rewardKey] ?? []
            Utils.log(`Toggling reward <${rewardKey}> depending on game.`, Color.Green)
            modules.twitchHelix.toggleRewards({[rewardKey]: games.indexOf(appId) == -1})
        }

        // Update rewards

        // Disable all resuable generic rewards that are not in use.
        const unavailableRewardKeys = allGameRewardKeys.filter((key) => !availableRewardKeys.includes(key))
        for(const rewardKey of unavailableRewardKeys) {
            const rewardId = await Utils.getRewardId(rewardKey)
            Utils.log(`Disabling reward: <${rewardKey}:${rewardId}>`, 'red')
            modules.twitchHelix.updateReward(rewardId, {
                is_enabled: false
            })
        }

        // Update and enable all reusable generic rewards in use.
        for(const rewardKey in gameSpecificRewards) {
            const rewardId = await Utils.getRewardId(rewardKey)
            const rewardConfig = gameSpecificRewards[rewardKey]
            Utils.logWithBold(`Updating reward: <${rewardKey}:${rewardId}>`, 'purple')
            modules.twitchHelix.updateReward(rewardId, {
                ...rewardConfig,
                ...{is_enabled: true}
            })
        }

        // Update reward callbacks
        const runConfigs = Config.run.gameSpecificConfigs[appId]
        for(const rewardKey in gameSpecificRewards) {
            const rewardId = await Utils.getRewardId(rewardKey)
            const runConfig = runConfigs[rewardKey]
            if(runConfig != undefined) {
                modules.twitch.registerReward({
                    id: rewardId,
                    callback: AutoRewards.buildRunCallback(runConfig)
                })
            } else Utils.logWithBold(`Could not find run config for <${appId}:${rewardKey}>`, 'red')
        }

        // Show game in sign
        if(appId != undefined) {
            const gameData = await SteamStore.getGameMeta(appId)
            const price = SteamStore.getPrice(gameData)
            const name = gameData.name ?? 'N/A'
            modules.sign.enqueueSign({
                title: 'Current Game',
                image: gameData.header_image,
                subtitle: `${name}\n${price}`,
                durationMs: 20000
            })
        }

        // Update category on Twitch
        if(appId != undefined && states.updateTwitchGameCategory) {
            const gameData = await SteamStore.getGameMeta(appId)
            let twitchGameData = await modules.twitchHelix.searchForGame(gameData.name)
            if(twitchGameData == null && typeof gameData.name == 'string') {
                let nameParts = gameData.name.split(' ')
                if(nameParts.length >= 2) {
                    // This is to also match games that are "name VR" on Steam but "name" on Twitch
                    // so we effectively trim off VR and see if we get a match.
                    nameParts.pop()
                    twitchGameData = await modules.twitchHelix.searchForGame(nameParts.join(' '))
                }
            }
            if(twitchGameData == null) {
                // If still no Twitch match, we load a possible default category.
                twitchGameData = await modules.twitchHelix.searchForGame(Config.controller.defaultTwitchGameCategory)
            }
            if(twitchGameData != undefined) {
                const request: ITwitchHelixChannelRequest = {
                    game_id: twitchGameData.id
                }
                const response = await modules.twitchHelix.updateChannelInformation(request)
                const speech = Config.controller.speechReferences[Keys.KEY_CALLBACK_APPID]
                Utils.log(`Steam title: ${gameData.name} -> Twitch category: ${twitchGameData.name}`, Color.RoyalBlue)
                if(response) {
                    modules.tts.enqueueSpeakSentence(Utils.template(speech[0], twitchGameData.name), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                } else {
                    modules.tts.enqueueSpeakSentence(Utils.template(speech[1], gameData.name), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                }
            } else {
                Utils.log(`Steam title: ${gameData.name} did not match any Twitch Category`, Color.Red)
            }
        }
    }

    /*
    ..####...######..######...####...##...##..........##...##..######..#####............####...#####...######.
    .##........##....##......##..##..###.###..........##...##..##......##..##..........##..##..##..##....##...
    ..####.....##....####....######..##.#.##..........##.#.##..####....#####...........######..#####.....##...
    .....##....##....##......##..##..##...##..........#######..##......##..##..........##..##..##........##...
    ..####.....##....######..##..##..##...##...........##.##...######..#####...........##..##..##......######.
    */
    public static async loadPlayerSummary() {
        const summary = await SteamWebApi.getPlayerSummary()
        const id = parseInt(summary?.gameid)
        // Utils.log(`Steam player summary loaded, game ID: ${id}`, Color.Gray)
        if(!isNaN(id) && id > 0) await Functions.appIdCallback(`steam.app.${id}`)
    }

    public static async loadAchievements() {
        const modules = ModulesSingleton.getInstance()
        const states = StatesSingleton.getInstance()
        if(states.lastSteamAppId != undefined && states.lastSteamAppId.length > 0) {
            const achievements = await SteamWebApi.getAchievements(states.lastSteamAppId)
            // Utils.log(`Achievements loaded: ${achievements.length}`, Color.Gray)            
            for(const achievement of achievements) {
                const setting = Settings.getPathFromKey(Settings.STEAM_ACHIEVEMENTS, states.lastSteamAppId)
                const storedAchievement = <ISteamWebApiSettingAchievement> await Settings.pullSetting(setting, 'key', achievement.apiname)
                // Check if the state has changed
                if(storedAchievement?.state != achievement.achieved) {
                    // Store achievement
                    await Settings.pushSetting(setting, 'key',
                    <ISteamWebApiSettingAchievement>{
                        key: achievement.apiname, 
                        state: achievement.achieved
                    })
                    // Announce achievement
                    if(new Date(achievement.unlocktime*1000).getTime() >= new Date().getTime() - (Config.steam.ignoreAchievementsOlderThanHours * 60 * 60 * 1000)) {
                        Utils.log(`New achievement unlocked! ${achievement.apiname}`, Color.Green, true, true)
                        const key = achievement.apiname
                        const profileTag = await SteamWebApi.getProfileTag()
                        const gameMeta = await SteamStore.getGameMeta(states.lastSteamAppId)
                        const gameSchema = await SteamWebApi.getGameSchema(states.lastSteamAppId)
                        const globalAchievementStat = (await SteamWebApi.getGlobalAchievementStats(states.lastSteamAppId))?.find(s => s.name == key)
                        const achievementDetails = gameSchema?.game?.availableGameStats?.achievements?.find(a => a.name == key)
                        const doneAchievements = achievements.map(a=>a.achieved).reduce((a,b)=>a+b)
                        const totalAchievements = achievements.length
                        const progressStr = `${doneAchievements}/${totalAchievements}`
                        const globalStr = globalAchievementStat?.percent.toFixed(1)+'%' ?? 'N/A'
                        
                        // Discord
                        Discord.enqueuePayload(Config.credentials.DiscordWebhooks[Keys.KEY_CALLBACK_ACHIEVEMENT], {
                            username: gameMeta.name,
                            avatar_url: gameMeta.header_image,
                            embeds: [
                                {
                                    title: achievementDetails?.displayName ?? key,
                                    description: achievementDetails?.description ?? '',
                                    url: SteamStore.getAchievementsURL(states.lastSteamAppId, profileTag),
                                    thumbnail: {
                                        url: achievementDetails?.icon
                                    },
                                    timestamp: new Date(achievement.unlocktime*1000).toISOString(),
                                    footer: {
                                        text: Utils.template(
                                                Config.steam.achievementSettings.discordFooter, 
                                                progressStr, 
                                                globalAchievementStat?.percent.toFixed(1)+'%' ?? 'N/A'
                                            )
                                    }
                                }
                            ]
                        })

                        // Twitch chat
                        modules.twitch._twitchChatOut.sendMessageToChannel(
                            Utils.template(
                                Config.steam.achievementSettings.twitchChatMessage, 
                                progressStr, 
                                achievementDetails?.displayName ?? key, 
                                achievementDetails.description ?? 'N/A', 
                                globalStr
                            )
                        )
                    }
                }
            }
        }
    }
}