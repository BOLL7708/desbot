class Callbacks {
    public static async init() {   
        /*
        ..######.....###....##.......##.......########.....###.....######..##....##..######.
        .##....##...##.##...##.......##.......##.....##...##.##...##....##.##...##..##....##
        .##........##...##..##.......##.......##.....##..##...##..##.......##..##...##......
        .##.......##.....##.##.......##.......########..##.....##.##.......#####.....######.
        .##.......#########.##.......##.......##.....##.#########.##.......##..##.........##
        .##....##.##.....##.##.......##.......##.....##.##.....##.##....##.##...##..##....##
        ..######..##.....##.########.########.########..##.....##..######..##....##..######.
        */

        const modules = ModulesSingleton.getInstance()
        const states = StatesSingleton.getInstance()

        /*
        ..####...##..##...####...######.
        .##..##..##..##..##..##....##...
        .##......######..######....##...
        .##..##..##..##..##..##....##...
        ..####...##..##..##..##....##...
        */
        modules.twitch.registerAnnouncers({
            userNames: Config.twitch.announcerNames.map((name)=>{return name.toLowerCase()}),
            triggers: Config.twitch.announcerTriggers,
            callback: async (userData, messageData, firstWord) => {
                // TTS
                if(Config.audioplayer.configs.hasOwnProperty(firstWord)) {
                    modules.tts.enqueueSoundEffect(Config.audioplayer.configs[firstWord])
                }
                modules.tts.enqueueSpeakSentence(messageData.text, userData.login, GoogleTTS.TYPE_ANNOUNCEMENT)

                // Pipe to VR (basic)
                const user = await modules.twitchHelix.getUserById(Utils.toInt(userData.id))
                modules.pipe.sendBasicObj(messageData, userData, user)
            }
        })

        modules.twitch.setChatCheerCallback(async (userData, messageData) => {
            const clearRanges = TwitchFactory.getEmotePositions(messageData.emotes)
            // TTS
            modules.tts.enqueueSpeakSentence(messageData.text, userData.login, GoogleTTS.TYPE_CHEER, Utils.getNonce('TTS'), messageData.bits, clearRanges)

            // Pipe to VR (basic)
            const user = await modules.twitchHelix.getUserById(Utils.toInt(userData.id))
            modules.pipe.sendBasicObj(messageData, userData, user)
        })

        modules.twitch.setChatCallback(async (userData, messageData) => {
            const clearRanges = TwitchFactory.getEmotePositions(messageData.emotes)
            let type = GoogleTTS.TYPE_SAID
            if(messageData.isAction) type = GoogleTTS.TYPE_ACTION
            
            if(states.ttsForAll) { 
                // TTS is on for everyone
                modules.tts.enqueueSpeakSentence(messageData.text, userData.login, type, undefined, Utils.getNonce('TTS'), clearRanges)
            } else if(states.ttsEnabledUsers.indexOf(userData.name) > -1) {
                // Reward users
                modules.tts.enqueueSpeakSentence(messageData.text, userData.login, type, undefined, Utils.getNonce('TTS'), clearRanges)
            } else if(states.pingForChat && Config.twitchChat.audio) {
                // Chat sound
                const soundEffect = Config.twitchChat.audio
                if(!Utils.matchFirstChar(messageData.text, Config.controller.secretChatSymbols)) modules.tts.enqueueSoundEffect(soundEffect)
            }

            // Pipe to VR (basic)
            if(states.pipeAllChat) {
                const user = await modules.twitchHelix.getUserById(Utils.toInt(userData.id))
                modules.pipe.sendBasicObj(messageData, userData, user)
            }
        })

        modules.twitch.setAllChatCallback(async (message:ITwitchMessageCmd) => {
            const rewardId = message?.properties?.["custom-reward-id"]           
            if(rewardId) return // Skip rewards as handled elsewhere
            const bits = Utils.toInt(message?.properties?.bits, 0)
            
            // Discord
            const user = await modules.twitchHelix.getUserById(Utils.toInt(message.properties['user-id']))
            let text = message?.message?.text
            if(text == null || text.length == 0) return

            // Format text
            let logText = Utils.escapeForDiscord(text)
            if(message?.message?.isAction) logText = `_${logText}_`
            
            // Label messages with bits
            let label = ''
            if(!isNaN(bits) && bits > 0) {
                const unit = bits == 1 ? 'bit' : 'bits'
                label = `${Config.discord.prefixCheer}**Cheered ${bits} ${unit}**: `
            }
            
            // TODO: Add more things like sub messages? Need to check that from raw logs.
            // TODO: Reference Jeppe's twitch logger for the other messages! :D
            
            if(states.logChatToDiscord) {
                Discord.enqueueMessage(
                    Config.credentials.DiscordWebhooks[Keys.DISCORD_CHAT],
                    user?.display_name,
                    user?.profile_image_url,
                    `${label}${logText}`
                )
            }
        })

        /*
        .#####...######..##...##...####...#####...#####....####..
        .##..##..##......##...##..##..##..##..##..##..##..##.....
        .#####...####....##.#.##..######..#####...##..##...####..
        .##..##..##......#######..##..##..##..##..##..##......##.
        .##..##..######...##.##...##..##..##..##..#####....####..
        */
        // This callback was added as rewards with no text input does not come in through the chat callback
        modules.twitchPubsub.setOnRewardCallback(async (id: string, message: ITwitchPubsubRewardMessage) => {
            const redemption = message?.data?.redemption
            if(!redemption) return console.warn('Reward redemption empty', message)

            const user = await modules.twitchHelix.getUserById(parseInt(redemption.user.id))          
            const rewardPair = await Settings.pullSetting<ITwitchRewardPair>(Settings.TWITCH_REWARDS, 'id', redemption.reward.id)

            // Discord
            const amount = redemption.reward.redemptions_redeemed_current_stream
            const amountStr = amount != null ? ` #${amount}` : ''
            let description = `${Config.discord.prefixReward}**${redemption.reward.title}${amountStr}** (${redemption.reward.cost})`
            if(redemption.user_input) description += `: ${Utils.escapeForDiscord(Utils.fixLinks(redemption.user_input))}`
            if(states.logChatToDiscord) {
                Discord.enqueueMessage(
                    Config.credentials.DiscordWebhooks[Keys.DISCORD_CHAT],
                    user?.display_name,
                    user?.profile_image_url,
                    description
                )
            }
            const rewardSpecificWebhook = Config.credentials.DiscordWebhooks[rewardPair?.key ?? '']
            if(rewardSpecificWebhook) {
                Discord.enqueueMessage(
                    rewardSpecificWebhook,
                    user?.display_name,
                    user?.profile_image_url,
                    description
                )
            }

            // Pipe to VR (basic)
            const showReward = Config.pipe.showRewardsWithKeys.indexOf(rewardPair?.key ?? '') > -1
            if(showReward) {
                modules.pipe.sendBasic(
                    redemption.user_input, 
                    user?.display_name, 
                    TwitchFactory.userColors.get(parseInt(redemption.user.id)) ?? Color.White,
                    user?.profile_image_url
                )
            }
        })

        /*
        ..####....####...#####...######..######..##..##...####...##..##...####...######...####..
        .##......##..##..##..##..##......##......###.##..##......##..##..##..##....##....##.....
        ..####...##......#####...####....####....##.###...####...######..##..##....##.....####..
        .....##..##..##..##..##..##......##......##..##......##..##..##..##..##....##........##.
        ..####....####...##..##..######..######..##..##...####...##..##...####.....##.....####..
        */
        modules.sssvr.setScreenshotCallback(async (requestData, responseData) => {
            const discordCfg = Config.credentials.DiscordWebhooks[Keys.DISCORD_VRSCREENSHOT]
            const blob = Utils.b64toBlob(responseData.image)
            const dataUrl = Utils.b64ToDataUrl(responseData.image)
            const gameData = await SteamStore.getGameMeta(states.lastSteamAppId ?? '')
            const gameTitle = gameData != null ? gameData.name : states.lastSteamAppId
            
            if(requestData != null) { // A screenshot from a reward
                const userData = await modules.twitchHelix.getUserById(requestData.userId)
                const authorName = userData?.display_name ?? ''
                
                // Discord
                const description = requestData.userInput
                const authorUrl = `https://twitch.tv/${userData?.login ?? ''}`
                const authorIconUrl = userData?.profile_image_url ?? ''
                const color = Utils.hexToDecColor(
                    TwitchFactory.userColors.get(requestData.userId) ?? Config.discord.remoteScreenshotEmbedColor
                )
                const descriptionText = description?.trim().length > 0
                    ? Utils.replaceTags(Config.screenshots.callback.discordRewardTitle, {text: description})
                    : Config.screenshots.callback.discordRewardInstantTitle
                Discord.enqueuePayloadEmbed(discordCfg, blob, color, descriptionText, authorName, authorUrl, authorIconUrl, gameTitle)

                // Sign
                modules.sign.enqueueSign({
                    title: Config.screenshots.callback.signTitle,
                    image: dataUrl,
                    subtitle: authorName,
                    durationMs: Config.screenshots.callback.signDurationMs
                })
            } else { // A manually taken screenshot
                // Discord
                const color = Utils.hexToDecColor(Config.discord.manualScreenshotEmbedColor)
                Discord.enqueuePayloadEmbed(discordCfg, blob, color, Config.screenshots.callback.discordManualTitle, undefined, undefined, undefined, gameTitle)

                // Sign
                modules.sign.enqueueSign({
                    title: Config.screenshots.callback.signTitle,
                    image: dataUrl,
                    subtitle: Config.screenshots.callback.signManualSubtitle,
                    durationMs: Config.screenshots.callback.signDurationMs
                })
            }

            // Pipe manual screenshots into VR if configured.
            if(
                Config.screenshots.callback.pipeEnabledForRewards.includes(requestData?.rewardKey ?? '')
                || (requestData == null && Config.screenshots.callback.pipeEnabledForManual)
            ) {
                const preset = Config.screenshots.callback.pipeMessagePreset
                if(preset != undefined) {
                    const configClone: IPipeCustomMessage = Utils.clone(preset.config)
                    configClone.imageData = responseData.image
                    if(configClone.customProperties) {
                        configClone.customProperties.durationMs = preset.durationMs
                        const tas = configClone.customProperties.textAreas
                        if(tas && tas.length > 0) {
                            tas[0].text = `${responseData.width}x${responseData.height}`
                        }
                        if(requestData != null && tas && tas.length > 1) {
                            const userData = await modules.twitchHelix.getUserById(requestData.userId)
                            const title = requestData.userInput 
                                ? `"${requestData.userInput}"\n${userData?.display_name ?? ''}`
                                : userData?.display_name ?? ''
                            tas[1].text = title
                        }
                    }
                    modules.pipe.sendCustom(configClone)
                }
            }
        })

        modules.obs.registerSourceScreenshotCallback(async (img, requestData, nonce) => {
            const b64data = img.split(',').pop() ?? ''
            const discordCfg = Config.credentials.DiscordWebhooks[Keys.DISCORD_OBSSCREENSHOT]
            const blob = Utils.b64toBlob(b64data)
            const dataUrl = Utils.b64ToDataUrl(b64data)
            const nonceCallback = states.nonceCallbacks.get(nonce)
            if(nonceCallback) nonceCallback()

            if(requestData != null) {
                const gameData = await SteamStore.getGameMeta(states.lastSteamAppId ?? '')
                const gameTitle = gameData ? gameData.name : Config.obs.sourceScreenshotConfig.discordGameTitle

                const userData = await modules.twitchHelix.getUserById(requestData.userId)
                const authorName = userData?.display_name ?? ''
                        
                // Discord
                const description = requestData.userInput
                const authorUrl = `https://twitch.tv/${userData?.login ?? ''}`
                const authorIconUrl = userData?.profile_image_url ?? ''
                const color = Utils.hexToDecColor(
                    TwitchFactory.userColors.get(requestData.userId) ?? Config.discord.remoteScreenshotEmbedColor
                )
                const descriptionText = description?.trim().length > 0
                    ? Utils.replaceTags(Config.screenshots.callback.discordRewardTitle, {text: description}) 
                    : Config.obs.sourceScreenshotConfig.discordDescription
                Discord.enqueuePayloadEmbed(discordCfg, blob, color, descriptionText, authorName, authorUrl, authorIconUrl, gameTitle)

                // Sign
                modules.sign.enqueueSign({
                    title: Config.screenshots.callback.signTitle,
                    image: dataUrl,
                    subtitle: authorName,
                    durationMs: Config.screenshots.callback.signDurationMs
                })

                // Sound effect
                const soundConfig = Config.audioplayer.configs[Keys.DISCORD_OBSSCREENSHOT]
                if(soundConfig != undefined) modules.audioPlayer.enqueueAudio(soundConfig)
            }
        })

        /*
        ..####...#####....####..
        .##..##..##..##..##.....
        .##..##..#####....####..
        .##..##..##..##......##.
        ..####...#####....####..
        */
        modules.obs.registerSceneChangeCallback((sceneName) => {
            // let filterScene = Config.obs.filterOnScenes.indexOf(sceneName) > -1
            // this._ttsForAll = !filterScene
        })

        /*
        ..####...##..##..#####...######...####..
        .##..##..##..##..##..##....##....##..##.
        .######..##..##..##..##....##....##..##.
        .##..##..##..##..##..##....##....##..##.
        .##..##...####...#####...######...####..
        */
        modules.audioPlayer.setPlayedCallback((nonce:string, status:number) => {
            console.log(`Audio Player: Nonce finished playing -> ${nonce} [${status}]`)
            const callback = states.nonceCallbacks.get(nonce)
            if(callback) {
                if(status == AudioPlayer.STATUS_OK) callback()
                states.nonceCallbacks.delete(nonce)
            }
        })

        modules.tts.setHasSpokenCallback((nonce:string, status:number) => {
            console.log(`TTS: Nonce finished playing -> ${nonce} [${status}]`)
            const callback = states.nonceCallbacks.get(nonce)
            if(callback) {
                if(status == AudioPlayer.STATUS_OK) callback()
                states.nonceCallbacks.delete(nonce)
            }
        })

        /*
        .##..##..#####..
        .##..##..##..##.
        .##..##..#####..
        ..####...##..##.
        ...##....##..##.
        */
        modules.openvr2ws.setInputCallback((key, data) => {
            switch(data.input) {
                case "Proximity": if(data.source == 'Head') {
                    // TODO: This is unreliable as it does not always register, and dashboard will mess it up.
                    // modules.obs.toggleSource(Config.obs.rewards[Keys.KEY_ROOMPEEK], !data.value)
                    console.log(`OpenVR2WS: Headset proximity changed: ${data.value}`)
                }
            }
        })

        modules.openvr2ws.setStatusCallback((status) => {
            if(status) {
                console.log('OpenVR2WS: Connected')
                // We are playing VR so we're scrapping the WebApi timer.
                clearInterval(states.steamPlayerSummaryIntervalHandle)
                states.steamPlayerSummaryIntervalHandle = -1
            } else {
                console.log('OpenVR2WS: Disconnected')
                // We do not get the app ID from OpenVR2WS so we use the Steam Web API instead.
                MainController.startSteamPlayerSummaryInterval()
            }
        })

        modules.openvr2ws.setFindOverlayCallback((overlayKey, overlayHandle) => {
            const rewardsToToggle = Config.twitch.turnOnRewardForOverlays[overlayKey]
            if(Array.isArray(rewardsToToggle)) {
                const rewards: { [x: string]: boolean } = {}
                const state = overlayHandle != 0
                Utils.log(`OpenVR2WS: Found overlay result -> ${overlayKey}: ${overlayHandle}, toggling rewards: ${JSON.stringify(rewardsToToggle)} to ${state}`, Color.Green)
                rewardsToToggle.map(rewardKey => {
                    rewards[rewardKey] = state
                })
                modules.twitchHelix.toggleRewards(rewards)
            }
        })

        /*
        ..####...#####...#####...........######..#####..
        .##..##..##..##..##..##............##....##..##.
        .######..#####...#####.............##....##..##.
        .##..##..##......##................##....##..##.
        .##..##..##......##..............######..#####..
        */
        modules.openvr2ws.setAppIdCallback(async (appId) => {
            Functions.appIdCallback(appId, true)
        })
    }
}