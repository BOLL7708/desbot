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
                modules.tts.enqueueSpeakSentence(messageData.text, userData.userName, GoogleTTS.TYPE_ANNOUNCEMENT)

                // Pipe to VR (basic)
                const user = await modules.twitchHelix.getUserById(parseInt(userData.userId))
                modules.pipe.sendBasicObj(messageData, userData, user)
            }
        })

        modules.twitch.setChatCheerCallback(async (userData, messageData) => {
            const clearRanges = TwitchFactory.getEmotePositions(messageData.emotes)
            // TTS
            modules.tts.enqueueSpeakSentence(messageData.text, userData.userName, GoogleTTS.TYPE_CHEER, Utils.getNonce('TTS'), messageData.bits, clearRanges)

            // Pipe to VR (basic)
            const user = await modules.twitchHelix.getUserById(parseInt(userData.userId))
            modules.pipe.sendBasicObj(messageData, userData, user)
        })

        modules.twitch.setChatCallback(async (userData, messageData) => {
            const clearRanges = TwitchFactory.getEmotePositions(messageData.emotes)
            let type = GoogleTTS.TYPE_SAID
            if(messageData.isAction) type = GoogleTTS.TYPE_ACTION
            
            if(states.ttsForAll) { 
                // TTS is on for everyone
                modules.tts.enqueueSpeakSentence(messageData.text, userData.userName, type, null, Utils.getNonce('TTS'), clearRanges)
            } else if(states.ttsEnabledUsers.indexOf(userData.userName) > -1) {
                // Reward users
                modules.tts.enqueueSpeakSentence(messageData.text, userData.userName, type, null, Utils.getNonce('TTS'), clearRanges)
            } else if(states.pingForChat && Config.audioplayer.configs[Keys.KEY_MIXED_CHAT] != null) {
                // Chat sound
                const soundEffect = Config.audioplayer.configs[Keys.KEY_MIXED_CHAT]
                if(!Utils.matchFirstChar(messageData.text, Config.controller.secretChatSymbols)) modules.tts.enqueueSoundEffect(soundEffect)
            }

            // Pipe to VR (basic)
            if(states.pipeAllChat) {
                const user = await modules.twitchHelix.getUserById(parseInt(userData.userId))
                modules.pipe.sendBasicObj(messageData, userData, user)
            }
        })

        modules.twitch.setAllChatCallback((message:ITwitchMessageCmd) => {
            const rewardId = message?.properties?.["custom-reward-id"]           
            if(rewardId) return // Skip rewards as handled elsewhere
            const bits = parseInt(message?.properties?.bits)
            
            // Discord
            modules.twitchHelix.getUserById(parseInt(message?.properties["user-id"])).then(user => {
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
                        Config.credentials.DiscordWebhooks[Keys.KEY_DISCORD_CHAT],
                        user?.display_name,
                        user?.profile_image_url,
                        `${label}${logText}`
                    )
                }
            })
        })

        /*
        .#####...######..##...##...####...#####...#####....####..
        .##..##..##......##...##..##..##..##..##..##..##..##.....
        .#####...####....##.#.##..######..#####...##..##...####..
        .##..##..##......#######..##..##..##..##..##..##......##.
        .##..##..######...##.##...##..##..##..##..#####....####..
        */
        // This callback was added as rewards with no text input does not come in through the chat callback
        modules.twitch.setAllRewardsCallback(async (message:ITwitchRedemptionMessage) => {
            const user = await modules.twitchHelix.getUserById(parseInt(message.redemption.user.id))          
            const rewardPair:ITwitchRewardPair = await Settings.pullSetting(Settings.TWITCH_REWARDS, 'id', message.redemption.reward.id)

            // Discord
            const amount = message.redemption.reward.redemptions_redeemed_current_stream
            const amountStr = amount != null ? ` #${amount}` : ''
            let description = `${Config.discord.prefixReward}**${message.redemption.reward.title}${amountStr}** (${message.redemption.reward.cost})`
            if(message.redemption.user_input) description += `: ${Utils.escapeForDiscord(Utils.fixLinks(message.redemption.user_input))}`
            if(states.logChatToDiscord) {
                Discord.enqueueMessage(
                    Config.credentials.DiscordWebhooks[Keys.KEY_DISCORD_CHAT],
                    user?.display_name,
                    user?.profile_image_url,
                    description
                )
            }
            const rewardSpecificWebhook = Config.credentials.DiscordWebhooks[rewardPair.key] || null
            if(rewardSpecificWebhook != null) {
                Discord.enqueueMessage(
                    rewardSpecificWebhook,
                    user?.display_name,
                    user?.profile_image_url,
                    description
                )
            }

            // Pipe to VR (basic)
            const showReward = Config.pipe.showRewardsWithKeys.indexOf(rewardPair.key) > -1
            if(showReward) {
                modules.pipe.sendBasic(
                    message.redemption.user_input, 
                    user?.display_name, 
                    TwitchFactory.userColors[message.redemption.user.id] ?? Color.White,
                    user.profile_image_url
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
        modules.sssvr.setScreenshotCallback(async (responseData) => {
            const requestData = responseData.nonce 
                ? modules.sssvr.getScreenshotRequest(parseInt(responseData.nonce))
                : null
            const discordCfg = Config.credentials.DiscordWebhooks[Keys.KEY_DISCORD_SSSVR]
            const blob = Utils.b64toBlob(responseData.image)
            const dataUrl = Utils.b64ToDataUrl(responseData.image)
            const gameData = await SteamStore.getGameMeta(states.lastSteamAppId)
            const gameTitle = gameData != null ? gameData.name : states.lastSteamAppId
            if(requestData != null) {
                const userData = await modules.twitchHelix.getUserById(requestData.userId)
                const authorName = userData?.display_name ?? ''
                
                // Discord
                const description = requestData.userInput
                const authorUrl = `https://twitch.tv/${userData.login ?? ''}`
                const authorIconUrl = userData?.profile_image_url ?? ''
                const color = Utils.hexToDecColor(
                    TwitchFactory.userColors[requestData.userId] ?? Config.discord.remoteScreenshotEmbedColor
                )
                const descriptionText = description?.trim().length > 0
                    ? Utils.template(Config.screenshots.callback.discordRewardTitle, description) 
                    : Config.screenshots.callback.discordRewardInstantTitle
                Discord.enqueuePayloadEmbed(discordCfg, blob, color, descriptionText, authorName, authorUrl, authorIconUrl, gameTitle)

                // Sign
                modules.sign.enqueueSign({
                    title: Config.screenshots.callback.signTitle,
                    image: dataUrl,
                    subtitle: authorName,
                    durationMs: Config.screenshots.callback.signDurationMs
                })
            } else {
                // Discord
                const color = Utils.hexToDecColor(Config.discord.manualScreenshotEmbedColor)
                Discord.enqueuePayloadEmbed(discordCfg, blob, color, Config.screenshots.callback.discordManualTitle, null, null, null, gameTitle)

                // Sign
                modules.sign.enqueueSign({
                    title: Config.screenshots.callback.signTitle,
                    image: dataUrl,
                    subtitle: Config.screenshots.callback.signManualSubtitle,
                    durationMs: Config.screenshots.callback.signDurationMs
                })
            }

            // Pipe
            if(
                Config.screenshots.callback.pipeEnabledForRewards.includes(requestData?.rewardKey)
                || (requestData == null && Config.screenshots.callback.pipeEnabledForManual)
            ) {
                const preset = Config.screenshots.callback.pipeMessagePreset
                if(preset != undefined) {
                    const configClone: IPipeCustomMessage = Utils.clone(preset.config)
                    configClone.imageData = responseData.image
                    configClone.customProperties.durationMs = preset.durationMs
                    if(configClone.customProperties.textAreas.length > 0) {
                        configClone.customProperties.textAreas[0].text = `${responseData.width}x${responseData.height}`
                    }
                    if(requestData != null && configClone.customProperties.textAreas.length > 1) {
                        const userData = await modules.twitchHelix.getUserById(requestData.userId)
                        const title = requestData.userInput 
                            ? `"${requestData.userInput}"\n${userData.display_name}`
                            : userData.display_name
                        configClone.customProperties.textAreas[1].text = title
                    }
                    modules.pipe.sendCustom(configClone)
                }
            }
        })

        modules.obs.registerSourceScreenshotCallback(async (img, requestData) => {
            const b64data = img.split(',').pop()
            const discordCfg = Config.credentials.DiscordWebhooks[Keys.COMMAND_SOURCESCREENSHOT]
            const blob = Utils.b64toBlob(b64data)
            const dataUrl = Utils.b64ToDataUrl(b64data)

            if(requestData != null) {
                const gameData = await SteamStore.getGameMeta(states.lastSteamAppId)
                const gameTitle = gameData != null ? gameData.name : Config.obs.sourceScreenshotConfig.discordGameTitle

                const userData = await modules.twitchHelix.getUserById(requestData.userId)
                const authorName = userData?.display_name ?? ''
                        
                // Discord
                const description = requestData.userInput
                const authorUrl = `https://twitch.tv/${userData.login ?? ''}`
                const authorIconUrl = userData?.profile_image_url ?? ''
                const color = Utils.hexToDecColor(
                    TwitchFactory.userColors[requestData.userId] ?? Config.discord.remoteScreenshotEmbedColor
                )
                const descriptionText = description?.trim().length > 0
                    ? Utils.template(Config.screenshots.callback.discordRewardTitle, description) 
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
                const soundConfig = Config.audioplayer.configs[Keys.COMMAND_SOURCESCREENSHOT]
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
            const callback = states.nonceCallbacks[nonce] || null
            if(callback != null) {
                if(status == AudioPlayer.STATUS_OK) callback()
                delete states.nonceCallbacks[nonce]
            }
        })

        modules.tts.setHasSpokenCallback((nonce:string, status:number) => {
            console.log(`TTS: Nonce finished playing -> ${nonce} [${status}]`)
            const callback = states.nonceCallbacks[nonce] || null
            if(callback != null) {
                if(status == AudioPlayer.STATUS_OK) callback()
                delete states.nonceCallbacks[nonce]
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
            } else {
                console.log('OpenVR2WS: Disconnected')
                // We do not get the app ID from OpenVR2WS so we use the Steam Web API instead.
                MainController.startSteamPlayerSummaryInterval()
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
            Functions.appIdCallback(appId)
        })
    }
}