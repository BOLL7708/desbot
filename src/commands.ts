class Commands {
    public static async init() {
        /*
        ..######...#######..##.....##.##.....##....###....##....##.########...######.
        .##....##.##.....##.###...###.###...###...##.##...###...##.##.....##.##....##
        .##.......##.....##.####.####.####.####..##...##..####..##.##.....##.##......
        .##.......##.....##.##.###.##.##.###.##.##.....##.##.##.##.##.....##..######.
        .##.......##.....##.##.....##.##.....##.#########.##..####.##.....##.......##
        .##....##.##.....##.##.....##.##.....##.##.....##.##...###.##.....##.##....##
        ..######...#######..##.....##.##.....##.##.....##.##....##.########...######.
        */
        const modules = ModulesSingleton.getInstance()
        const states = StatesSingleton.getInstance()

        /*
        .######..######...####..
        ...##......##....##.....
        ...##......##.....####..
        ...##......##........##.
        ...##......##.....####..
        */
        modules.twitch.registerCommand({
            trigger: Keys.COMMAND_TTS_ON,
            callback: async (user) => {
                const speech = Config.controller.speechReferences[Keys.COMMAND_TTS_ON]
                const onText:string = !states.ttsForAll ? speech[0] : speech[1]
                states.ttsForAll = true
                modules.tts.enqueueSpeakSentence(onText, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                modules.twitchHelix.updateReward(await Utils.getRewardId(Keys.REWARD_TTSSPEAK), {is_enabled: false})
            }
        })

        modules.twitch.registerCommand({
            trigger: Keys.COMMAND_TTS_OFF,
            callback: async (user) => {
                const speech = Config.controller.speechReferences[Keys.COMMAND_TTS_OFF]
                const offText = states.ttsForAll ? speech[0] : speech[1]
                states.ttsForAll = false
                modules.tts.enqueueSpeakSentence(offText, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                modules.twitchHelix.updateReward(await Utils.getRewardId(Keys.REWARD_TTSSPEAK), {is_enabled: true})
            }
        })

        modules.twitch.registerCommand({
            trigger: Keys.COMMAND_TTS_SILENCE,
            callback: (user) => {
                modules.tts.stopSpeaking()
            }
        })

        modules.twitch.registerCommand({
            trigger: Keys.COMMAND_TTS_DIE,
            callback: (user) => {
                modules.tts.stopSpeaking(true)
            }
        })

        modules.twitch.registerCommand({
            trigger: Keys.COMMAND_TTS_SAY,
            callback: (user) => {
                modules.tts.enqueueSpeakSentence(user.input, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        modules.twitch.registerCommand({
            trigger: Keys.COMMAND_TTS_NICK,
            callback: (user) => {
                const parts = Utils.splitOnFirst(' ', user.input)
                let userToRename: string = ''
                let newName: string = ''
                // Rename someone else
                if(
                    (user?.isBroadcaster || user?.isModerator) 
                    && parts[0].indexOf('@') > -1 
                    && parts.length >= 1
                ) { 
                    userToRename = Utils.cleanUserName(parts[0])
                    newName = parts[1].toLowerCase()
                } else { // Rename yourself
                    userToRename = user.name ?? ''
                    newName = user.input.toLowerCase()
                }
                if(userToRename.length > 0 && newName.length > 0) {
                    const setting = <IUserName> {userName: userToRename, shortName: newName, editor: user.login, datetime: Utils.getISOTimestamp()}
                    Settings.pushSetting(Settings.TTS_USER_NAMES, 'userName', setting)
                    const speech = Config.controller.speechReferences[Keys.COMMAND_TTS_NICK]
                    modules.tts.enqueueSpeakSentence(Utils.template(speech, userToRename, newName), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                }
            }
        })

        modules.twitch.registerCommand({
            trigger: Keys.COMMAND_TTS_MUTE,
            callback: async (user) => {
                const parts = Utils.splitOnFirst(' ', user.input)
                const name = Utils.cleanUserName(parts[0] ?? '')
                if(name.length > 0 && name != Config.twitch.chatbotName.toLowerCase()) {
                    let reason = (parts[1] ?? '').replace('|', ' ').replace(';', ' ')
                    const blacklist = await Settings.pullSetting<IBlacklistEntry>(Settings.TTS_BLACKLIST, 'userName', name)
                    const cleanName = await Utils.loadCleanName(name)                       
                    const speech = Config.controller.speechReferences[Keys.COMMAND_TTS_MUTE]
                    if(blacklist == null || blacklist.active == false) {
                        Settings.pushSetting(Settings.TTS_BLACKLIST, 'userName', { userName: name, active: true, reason: reason })
                        modules.tts.enqueueSpeakSentence(Utils.template(speech[0], cleanName), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                    } else {
                        modules.tts.enqueueSpeakSentence(Utils.template(speech[1], cleanName), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                    }                    
                }
            }
        })

        modules.twitch.registerCommand({
            trigger: Keys.COMMAND_TTS_UNMUTE,
            callback: async (user) => {
                const parts = Utils.splitOnFirst(' ', user.input)
                const name = Utils.cleanUserName(parts[0] ?? '')
                if(name.length == 0) return
                const blacklist = await Settings.pullSetting<IBlacklistEntry>(Settings.TTS_BLACKLIST, 'userName', name)
                const cleanName = await Utils.loadCleanName(name)
                const speech = Config.controller.speechReferences[Keys.COMMAND_TTS_UNMUTE]
                if(blacklist != null && blacklist.active) {
                    const reason = Utils.cleanSetting(parts[1] ?? '')
                    Settings.pushSetting(Settings.TTS_BLACKLIST, 'userName', { userName: name, active: false, reason: reason })    
                    modules.tts.enqueueSpeakSentence(Utils.template(speech[0], cleanName), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                } else {
                    modules.tts.enqueueSpeakSentence(Utils.template(speech[1], cleanName), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                }
            }
        })

        /*
        ..####...##..##...####...######.
        .##..##..##..##..##..##....##...
        .##......######..######....##...
        .##..##..##..##..##..##....##...
        ..####...##..##..##..##....##...
        */
        modules.twitch.registerCommand({
            trigger: Keys.COMMAND_CHAT,
            callback: (user) => {
                modules.pipe.sendBasic(user.input)
            }
        })

        modules.twitch.registerCommand({
            trigger: Keys.COMMAND_CHAT_ON,
            callback: (user) => {
                states.pipeAllChat = true
                const speech = Config.controller.speechReferences[Keys.COMMAND_CHAT_ON]
                modules.tts.enqueueSpeakSentence(speech, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        modules.twitch.registerCommand({
            trigger: Keys.COMMAND_CHAT_OFF,
            callback: (user) => {
                states.pipeAllChat = false
                const speech = Config.controller.speechReferences[Keys.COMMAND_CHAT_OFF]
                modules.tts.enqueueSpeakSentence(speech, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        modules.twitch.registerCommand({
            trigger: Keys.COMMAND_PING_ON,
            callback: (user) => {
                states.pingForChat = true
                Functions.setEmptySoundForTTS()
                const speech = Config.controller.speechReferences[Keys.COMMAND_PING_ON]
                modules.tts.enqueueSpeakSentence(speech, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        modules.twitch.registerCommand({
            trigger: Keys.COMMAND_PING_OFF,
            callback: (user) => {
                states.pingForChat = false
                Functions.setEmptySoundForTTS()
                const speech = Config.controller.speechReferences[Keys.COMMAND_PING_OFF]
                modules.tts.enqueueSpeakSentence(speech, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        /*
        .##.......####....####..
        .##......##..##..##.....
        .##......##..##..##.###.
        .##......##..##..##..##.
        .######...####....####..
        */
        modules.twitch.registerCommand({
            trigger: Keys.COMMAND_LOG_ON,
            callback: (user) => {
                states.logChatToDiscord = true
                const speech = Config.controller.speechReferences[Keys.COMMAND_LOG_ON]
                modules.tts.enqueueSpeakSentence(speech, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        modules.twitch.registerCommand({
            trigger: Keys.COMMAND_LOG_OFF,
            callback: (user) => {
                states.logChatToDiscord = false
                const speech = Config.controller.speechReferences[Keys.COMMAND_LOG_OFF]
                modules.tts.enqueueSpeakSentence(speech, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        /*
        ..####....####...##...##.
        .##..##..##..##..###.###.
        .##......######..##.#.##.
        .##..##..##..##..##...##.
        ..####...##..##..##...##.
        */
        modules.twitch.registerCommand({
            trigger: Keys.COMMAND_CAMERA_ON,
            callback: (user) => {
                const key = Config.controller.commandReferences[Keys.COMMAND_CAMERA_ON]
                const speech = Config.controller.speechReferences[Keys.COMMAND_CAMERA_ON]
                modules.tts.enqueueSpeakSentence(speech, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                modules.obs.show(Utils.getRewardConfig(key)?.obs, true)
            }
        })

        modules.twitch.registerCommand({
            trigger: Keys.COMMAND_CAMERA_OFF,
            callback: (user) => {
                const key = Config.controller.commandReferences[Keys.COMMAND_CAMERA_OFF]
                const speech = Config.controller.speechReferences[Keys.COMMAND_CAMERA_OFF]
                modules.tts.enqueueSpeakSentence(speech, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                modules.obs.hide(Utils.getRewardConfig(key)?.obs)
            }
        })

        /*
        ..####....####....####...##......######.
        .##......##..##..##..##..##......##.....
        ..####...##......######..##......####...
        .....##..##..##..##..##..##......##.....
        ..####....####...##..##..######..######.
        */
        modules.twitch.registerCommand({
            trigger: Keys.COMMAND_SCALE,
            callback: (user) => {
                const parts = user.input.split(' ')
                const speech = Config.controller.speechReferences[Keys.COMMAND_SCALE]
                if(parts.length == 3) {
                    const fromScale = parseInt(parts[0])
                    const toScale = parseInt(parts[1])
                    const forMinutes = parseInt(parts[2])
                    const intervalMs = 10000 // 10s
                    const steps = forMinutes*60*1000/intervalMs
                    if(isNaN(fromScale) || isNaN(toScale) || isNaN(forMinutes)) { 
                        // Fail to start interval
                        modules.tts.enqueueSpeakSentence(Utils.template(speech[3]), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                    } else { 
                        // TODO: Disable all scale rewards
                        // Launch interval
                        modules.tts.enqueueSpeakSentence(Utils.template(speech[1], fromScale, toScale, forMinutes), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                        let currentScale = fromScale
                        let currentStep = 0
                        const multiple = Math.pow((toScale/fromScale), 1/steps)

                        clearInterval(states.scaleIntervalHandle)
                        states.scaleIntervalHandle = setInterval(
                            ()=>{
                                modules.openvr2ws.setSetting({
                                    setting: OpenVR2WS.SETTING_WORLD_SCALE,
                                    value: currentScale/100.0
                                })
                                Settings.pushLabel(Settings.WORLD_SCALE_LABEL, `🌍 ${Math.round(currentScale*100)/100}%`)
                                currentScale *= multiple
                                if(currentStep == steps) {
                                    modules.tts.enqueueSpeakSentence(Utils.template(speech[2]), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                                    clearInterval(states.scaleIntervalHandle)
                                    setTimeout(()=>{
                                        Settings.pushLabel(Settings.WORLD_SCALE_LABEL, "")
                                        // TODO: Enable the right scale rewards again? Maybe
                                    }, intervalMs)
                                }
                                currentStep++
                            }, 
                            intervalMs
                        )
                    }
                } else {
                    const scale = Utils.toInt(user.input)
                    if(isNaN(scale) && ['reset', 'kill', 'off', 'done', 'end'].indexOf(user.input) > -1) { // Terminate interval
                        const speech = Config.controller.speechReferences[Keys.COMMAND_SCALE]
                        clearInterval(states.scaleIntervalHandle)
                        Settings.pushLabel(Settings.WORLD_SCALE_LABEL, "")
                        modules.tts.enqueueSpeakSentence(Utils.template(speech[4]), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                    } else { // Manual setting
                        const value = Math.max(10, Math.min(1000, scale || 100))
                        modules.tts.enqueueSpeakSentence(Utils.template(speech[0], value), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                        modules.openvr2ws.setSetting({
                            setting: OpenVR2WS.SETTING_WORLD_SCALE,
                            value: value/100.0
                        })    
                    }
                }
            }
        })

        /*
        ..####...######..######...####...##...##..##..##..#####..
        .##........##....##......##..##..###.###..##..##..##..##.
        ..####.....##....####....######..##.#.##..##..##..#####..
        .....##....##....##......##..##..##...##...####...##..##.
        ..####.....##....######..##..##..##...##....##....##..##.
        */
        modules.twitch.registerCommand({ // TODO: WIP - Should only work with what the headset supports
            trigger: Keys.COMMAND_BRIGHTNESS,
            callback: (user) => {
                const brightness = Utils.toInt(user.input, 130)
                const speech = Config.controller.speechReferences[Keys.COMMAND_BRIGHTNESS]
                const value = Math.max(0, Math.min(160, brightness)) // TODO: There are properties in SteamVR to read out for safe min/max values or if available at all! https://github.com/ValveSoftware/openvr/blob/4c85abcb7f7f1f02adaf3812018c99fc593bc341/headers/openvr.h#L475
                modules.tts.enqueueSpeakSentence(Utils.template(speech, value), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                modules.openvr2ws.setSetting({
                    setting: OpenVR2WS.SETTING_ANALOG_GAIN,
                    value: value/100.0
                })
            }
        })

        modules.twitch.registerCommand({ // TODO: WIP - Should only work with what the headset supports
            trigger: Keys.COMMAND_REFRESHRATE,
            callback: (user) => {
                const validRefreshRates = [80, 90, 120, 144] // TODO: Load from OpenVR2WS so we don't set unsupported frame-rates as it breaks the headset.
                const possibleRefreshRate = Utils.toInt(user.input, 120)
                const refreshRate = (validRefreshRates.indexOf(possibleRefreshRate) != -1) ? possibleRefreshRate : 120
                const speech = Config.controller.speechReferences[Keys.COMMAND_REFRESHRATE]
                const value = Math.max(0, Math.min(160, refreshRate)) // TODO: Are there also properties for supported frame-rates?! https://github.com/ValveSoftware/openvr/blob/4c85abcb7f7f1f02adaf3812018c99fc593bc341/headers/openvr.h#L470
                modules.tts.enqueueSpeakSentence(Utils.template(speech, value), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                modules.openvr2ws.setSetting({
                    setting: OpenVR2WS.SETTING_PREFERRED_REFRESH_RATE,
                    value: value
                })
            }
        })

        modules.twitch.registerCommand({ // Currently not actually effective due to how the VR View does not listen to config changes
            trigger: Keys.COMMAND_VRVIEWEYE,
            callback: (user) => {
                const eyeMode = Utils.toInt(user.input, 4)
                const speech = Config.controller.speechReferences[Keys.COMMAND_VRVIEWEYE]
                const value = Math.max(0, Math.min(5, eyeMode))
                modules.tts.enqueueSpeakSentence(Utils.template(speech, value), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                modules.openvr2ws.setSetting({
                    setting: OpenVR2WS.SETTING_MIRROR_VIEW_EYE,
                    value: value
                })
            }
        })

        /*
        .#####...######...####...######..######...####...##..##...####...#####...##..##.
        .##..##....##....##..##....##......##....##..##..###.##..##..##..##..##...####..
        .##..##....##....##........##......##....##..##..##.###..######..#####.....##...
        .##..##....##....##..##....##......##....##..##..##..##..##..##..##..##....##...
        .#####...######...####.....##....######...####...##..##..##..##..##..##....##...
        */
        modules.twitch.registerCommand({
            trigger: Keys.COMMAND_DICTIONARY,
            callback: async (user) => {
                const words = Utils.splitOnFirst(' ', user.input)
                if(words.length == 2 && words[1].trim().length > 0) {
                    const speech = Config.controller.speechReferences[Keys.COMMAND_DICTIONARY]
                    const setting = <IDictionaryEntry> {original: words[0].toLowerCase(), substitute: words[1].toLowerCase(), editor: user.login, datetime: Utils.getISOTimestamp()}
                    Settings.pushSetting(Settings.TTS_DICTIONARY, 'original', setting)
                    modules.tts.setDictionary(<IDictionaryEntry[]> Settings.getFullSettings(Settings.TTS_DICTIONARY))
                    modules.tts.enqueueSpeakSentence(Utils.template(speech, words[0], words[1]), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT, '', null, [], true)
                } else { // Messed up
                    const chat = Config.controller.chatReferences[Keys.COMMAND_DICTIONARY]
                    const word = (words[0] ?? '').toLowerCase()
                    const currentEntry = await Settings.pullSetting<IDictionaryEntry>(Settings.TTS_DICTIONARY, 'original', word)
                    if(currentEntry) {
                        modules.twitch._twitchChatOut.sendMessageToChannel(Utils.template(chat[1], currentEntry.original, currentEntry.substitute))
                    } else {
                        modules.twitch._twitchChatOut.sendMessageToChannel(Utils.template(chat[0], word))
                    }
                }
            }
        })

        /*
        .#####...######..##...##...####...#####...#####....####..
        .##..##..##......##...##..##..##..##..##..##..##..##.....
        .#####...####....##.#.##..######..#####...##..##...####..
        .##..##..##......#######..##..##..##..##..##..##......##.
        .##..##..######...##.##...##..##..##..##..#####....####..
        */
        modules.twitch.registerCommand({
            trigger: Keys.COMMAND_UPDATEREWARDS,
            callback: async (user) => {
                let storedRewards = Settings.getFullSettings<ITwitchRewardPair>(Settings.TWITCH_REWARDS)
                if(storedRewards == undefined) storedRewards = []
                for(const pair of storedRewards) {
                    const configArrOrNot = Utils.getRewardConfig(pair.key)?.reward
                    const config = Array.isArray(configArrOrNot) ? configArrOrNot[0] : configArrOrNot
                    if(config != undefined && Config.twitch.skipUpdatingRewards.indexOf(pair.key) == -1) {
                        const response = await modules.twitchHelix.updateReward(pair.id, config)
                        if(response != null && response.data != null) {
                            const success = response?.data[0]?.id == pair.id
                            Utils.logWithBold(`Reward <${pair.key}> updated: <${success?'YES':'NO'}>`, success ? Color.Green : Color.Red)
                            
                            // If update was successful, also reset incremental setting as the reward should have been reset.
                            if(Array.isArray(configArrOrNot)) {
                                const reset: ITwitchRewardCounter = {key: pair.key, count: 0}
                                Settings.pushSetting(Settings.TWITCH_REWARD_COUNTERS, 'key', reset)
                            }
                        } else {
                            Utils.logWithBold(`Reward <${pair.key}> update unsuccessful.`, Color.Red)
                        }                       
                    } else {
                        Utils.logWithBold(`Reward <${pair.key}> update skipped or unavailable.`, Color.Purple)
                    }
                }
            }
        })

        modules.twitch.registerCommand({
            trigger: Keys.COMMAND_GAMEREWARDS_ON,
            callback: (user) => {
                states.useGameSpecificRewards = true
                const speech = Config.controller.speechReferences[Keys.COMMAND_GAMEREWARDS_ON]
                modules.tts.enqueueSpeakSentence(speech, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                Functions.appIdCallback(states.lastSteamAppId ?? '', StatesSingleton.getInstance().lastSteamAppIsVR)
            }
        })
        
        modules.twitch.registerCommand({
            trigger: Keys.COMMAND_GAMEREWARDS_OFF,
            callback: (user) => {
                states.useGameSpecificRewards = false
                const speech = Config.controller.speechReferences[Keys.COMMAND_GAMEREWARDS_OFF]
                modules.tts.enqueueSpeakSentence(speech, Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                Functions.appIdCallback('', false)
            }
        })

        /*
        ..####...##..##...####...######..######..##...##.
        .##.......####...##........##....##......###.###.
        ..####.....##.....####.....##....####....##.#.##.
        .....##....##........##....##....##......##...##.
        ..####.....##.....####.....##....######..##...##.
        */
        modules.twitch.registerCommand({
            trigger: Keys.COMMAND_RELOADWIDGET,
            callback: (user) => {
                window.location.reload();
            }
        })

        modules.twitch.registerCommand({
            trigger: Keys.COMMAND_CHANNELTROPHY_STATS,
            callback: async (user) => {
                const speech = Config.controller.speechReferences[Keys.COMMAND_CHANNELTROPHY_STATS]
                const numberOfStreams = await ChannelTrophy.getNumberOfStreams()
                const streamNumber = Utils.toInt(user.input)
                if(user.input == "all") {
                    modules.tts.enqueueSpeakSentence(speech[0], Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                    for(let i=0; i<numberOfStreams; i++) {
                        const embeds = await ChannelTrophy.createStatisticsEmbedsForDiscord(modules.twitchHelix, i)
                        Discord.enqueuePayload(Config.credentials.DiscordWebhooks[Keys.COMMAND_CHANNELTROPHY_STATS], {
                            content: Utils.numberToDiscordEmote(i+1, true),
                            embeds: embeds
                        })
                    }
                    modules.tts.enqueueSpeakSentence(speech[1], Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                } else if (!isNaN(streamNumber)) {
                    modules.tts.enqueueSpeakSentence(speech[2], Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                    const embeds = await ChannelTrophy.createStatisticsEmbedsForDiscord(modules.twitchHelix, streamNumber-1)
                    Discord.enqueuePayload(Config.credentials.DiscordWebhooks[Keys.COMMAND_CHANNELTROPHY_STATS], {
                        content: Utils.numberToDiscordEmote(streamNumber, true),
                        embeds: embeds
                    }, (success) => {
                        modules.tts.enqueueSpeakSentence(speech[success ? 3 : 4], Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                    })
                    
                } else {
                    modules.tts.enqueueSpeakSentence(speech[2], Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                    const embeds = await ChannelTrophy.createStatisticsEmbedsForDiscord(modules.twitchHelix)
                    Discord.enqueuePayload(Config.credentials.DiscordWebhooks[Keys.COMMAND_CHANNELTROPHY_STATS], {
                        content: Utils.numberToDiscordEmote(numberOfStreams, true),
                        embeds: embeds
                    }, (success) => {
                        modules.tts.enqueueSpeakSentence(speech[success ? 3 : 4], Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                    })
                }
            }
        })

        modules.twitch.registerCommand({
            trigger: Keys.COMMAND_CLIPS,
            callback: async (user) => {
                const pageCount = 20
                let lastCount = pageCount
                const oldClips = await Settings.getFullSettings<ITwitchClip>(Settings.TWITCH_CLIPS)
                const speech = Config.controller.speechReferences[Keys.COMMAND_CLIPS]
                modules.tts.enqueueSpeakSentence(Utils.template(speech[0]), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)

                // Get all clips
                const allClips: ITwitchHelixClipResponseData[] = []
                let pagination: string = ''
                let i = 0
                while(i == 0 || (pagination.length > 0)) {
                    const clipsResponse = await modules.twitchHelix.getClips(pageCount, pagination)
                    allClips.push(...clipsResponse.data)
                    lastCount = clipsResponse.data.length
                    pagination = clipsResponse.pagination?.cursor ?? ''
                    i++
                }
                const oldClipIds = oldClips == undefined ? [] : oldClips.map((clip)=>{
                    return clip.id
                })
                const newClips = allClips.filter((clip)=>{
                    return oldClipIds.indexOf(clip.id) == -1
                })
                const sortedClips = newClips.sort((a,b)=>{
                    return Date.parse(a.created_at) - Date.parse(b.created_at)
                })
                modules.tts.enqueueSpeakSentence(Utils.template(speech[1], oldClipIds.length, newClips.length), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)

                // Post to Discord
                let count = oldClipIds.length+1
                for(const clip of sortedClips) {
                    let user = await modules.twitchHelix.getUserById(parseInt(clip.creator_id))
                    let game = await modules.twitchHelix.getGameById(parseInt(clip.game_id))
                    Discord.enqueuePayload(Config.credentials.DiscordWebhooks[Keys.COMMAND_CLIPS], {
                        username: user?.display_name ?? '[Deleted User]',
                        avatar_url: user?.profile_image_url ?? '',
                        content: [
                            Utils.numberToDiscordEmote(count++, true),
                            `**Title**: ${clip.title}`,
                            `**Creator**: ${user?.display_name ?? '[Deleted User]'}`,
                            `**Created**: ${Utils.getDiscordTimetag(clip.created_at)}`,
                            `**Game**: ${game != undefined ? game.name : 'N/A'}`,
                            `**Link**: ${clip.url}`
                        ].join("\n")
                    }, (success)=>{
                        if(success) Settings.pushSetting(Settings.TWITCH_CLIPS, 'id', {id: clip.id})
                    })
                }
                modules.tts.enqueueSpeakSentence(Utils.template(speech[2], count-1-oldClipIds.length), Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
            }
        })

        modules.twitch.registerCommand({
            trigger: Keys.COMMAND_GAMERESET, 
            callback: async (user) => {
                const states = StatesSingleton.getInstance()
                modules.tts.enqueueSpeakSentence(Config.controller.speechReferences[Keys.COMMAND_GAMERESET], Config.twitch.chatbotName, GoogleTTS.TYPE_ANNOUNCEMENT)
                Functions.appIdCallback('', false)
                states.lastSteamAppId = undefined
                states.lastSteamAppIsVR = false
            }
        })

        modules.twitch.registerCommand({
            trigger: Keys.COMMAND_TODO,
            callback: async (user) => {
                const userData = await modules.twitchHelix.getUserById(Utils.toInt(user.id))
                Discord.enqueueMessage(
                    Config.credentials.DiscordWebhooks[Keys.COMMAND_TODO],
                    user.name,
                    userData?.profile_image_url,
                    `👉 ${user.input}`
                )
            }
        })

        /*
        .#####...##..##..#####...##......######...####..
        .##..##..##..##..##..##..##........##....##..##.
        .#####...##..##..#####...##........##....##.....
        .##......##..##..##..##..##........##....##..##.
        .##.......####...#####...######..######...####..
        */
        modules.twitch.registerCommand({
            trigger: Keys.COMMAND_GAME,
            cooldown: 3*60,
            cooldownCallback: async (user) => {
                if(states.lastSteamAppId != undefined) {
                    const gameData = await SteamStore.getGameMeta(states.lastSteamAppId)
                    const price = SteamStore.getPrice(gameData)
                    const releaseDate = gameData?.release_date?.date ?? 'N/A'
                    const name = gameData?.name ?? 'N/A'
                    const link = gameData?.steam_appid != undefined ? SteamStore.getStoreURL(gameData.steam_appid) : 'N/A'
                    modules.twitch._twitchChatOut.sendMessageToChannel(`Game: ${name} - Released: ${releaseDate} - Price: ${price} - Link: ${link}`)
                    modules.sign.enqueueSign({
                        title: 'Current Game',
                        image: gameData?.header_image,
                        subtitle: `${name}\n${price}`,
                        durationMs: 10000
                    })
                }
            }
        })

        modules.twitch.registerCommand(
            {
                trigger: Keys.COMMAND_AUDIOURL,
                callback: async (user) => {
                    const modules = ModulesSingleton.getInstance()
                    if(user.input) modules.audioPlayer.enqueueAudio({src: user.input})
                }
            }
        )
    }
}
