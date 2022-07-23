/*
..######...#######..##.....##.##.....##....###....##....##.########...######.
.##....##.##.....##.###...###.###...###...##.##...###...##.##.....##.##....##
.##.......##.....##.####.####.####.####..##...##..####..##.##.....##.##......
.##.......##.....##.##.###.##.##.###.##.##.....##.##.##.##.##.....##..######.
.##.......##.....##.##.....##.##.....##.#########.##..####.##.....##.......##
.##....##.##.....##.##.....##.##.....##.##.....##.##...###.##.....##.##....##
..######...#######..##.....##.##.....##.##.....##.##....##.########...######.
*/
class Commands {
    /*
    .######..######...####..
    ...##......##....##.....
    ...##......##.....####..
    ...##......##........##.
    ...##......##.....####..
    */
    public static callbacks: { [key: string]: IActionCallback|undefined } = {
        [Keys.COMMAND_TTS_ON]: async (user) => {
            const modules = ModulesSingleton.getInstance()
            const states = StatesSingleton.getInstance()
            const speech = Config.controller.speechReferences[Keys.COMMAND_TTS_ON]
            const onText:string = !states.ttsForAll ? speech[0] : speech[1]
            states.ttsForAll = true
            modules.tts.enqueueSpeakSentence(onText)
            modules.twitchHelix.updateReward(await Utils.getRewardId(Keys.REWARD_TTSSPEAK), {is_enabled: false})
        },
        [Keys.COMMAND_TTS_OFF]: async (user) => {
            const modules = ModulesSingleton.getInstance()
            const states = StatesSingleton.getInstance()
            const speech = Config.controller.speechReferences[Keys.COMMAND_TTS_OFF]
            const offText = states.ttsForAll ? speech[0] : speech[1]
            states.ttsForAll = false
            modules.tts.enqueueSpeakSentence(offText)
            modules.twitchHelix.updateReward(await Utils.getRewardId(Keys.REWARD_TTSSPEAK), {is_enabled: true})
        },
        [Keys.COMMAND_TTS_SILENCE]: (user) => {
            ModulesSingleton.getInstance().tts.stopSpeaking()
        },
        [Keys.COMMAND_TTS_DIE]: (user) => {
                ModulesSingleton.getInstance().tts.stopSpeaking(true)
        },
        [Keys.COMMAND_TTS_NICK]: async (user) => {
            const modules = ModulesSingleton.getInstance()
            const states = StatesSingleton.getInstance()
            const parts = Utils.splitOnFirst(' ', user.input)
            let userToRename: string = ''
            let newName: string = ''
            
            const canRenameOthers = user?.isBroadcaster || user?.isModerator
            const hasUserTag = parts[0].indexOf('@') > -1 
            const hasUserTagAndInput = hasUserTag && parts.length >= 1
                            
            if(canRenameOthers && hasUserTagAndInput)  { 
                // Rename someone else
                userToRename = Utils.cleanUserName(parts[0])
                newName = parts[1].toLowerCase()
            } else {
                // Rename ourselves
                userToRename = user.login ?? ''
                newName = hasUserTagAndInput ? parts[1] : user.input.toLowerCase()
            }

            // Cancel if the user does not actually exist on Twitch
            const userData = await modules.twitchHelix.getUserByLogin(userToRename)
            if(!userData) return Utils.log(`TTS Nick: User "${userToRename}" does not exist.`, Color.Red)

            if(userToRename.length > 0 && newName.length > 0) {
                // We do the rename
                const setting = <IUserName> {userName: userToRename, shortName: newName, editor: user.login, datetime: Utils.getISOTimestamp()}
                Settings.pushSetting(Settings.TTS_USER_NAMES, 'userName', setting)
                const speech = Config.controller.speechReferences[Keys.COMMAND_TTS_NICK]
                modules.tts.enqueueSpeakSentence(
                    await Utils.replaceTagsInText(
                        <string> speech, 
                        user,
                        { // We override the target values because it can also be the user
                            targetName: userToRename, 
                            targetNick: newName
                        }
                    )
                )
            } else if(userToRename.length > 0) { 
                // We return current name in chat
                const currentName = await Settings.pullSetting<IUserName>(Settings.TTS_USER_NAMES, 'userName', userToRename)
                const message = Config.controller.chatReferences[Keys.COMMAND_TTS_NICK]
                ModulesSingleton.getInstance().twitch._twitchChatOut.sendMessageToChannel(
                    await Utils.replaceTagsInText(
                        <string> message, 
                        user,
                        {
                            targetName: hasUserTag ? parts[0] : `@${userData.display_name}`, 
                            targetNick: currentName?.shortName ?? 'N/A'
                        }
                    )
                )
            }
        },
        [Keys.COMMAND_TTS_MUTE]: async (user) => {
            const modules = ModulesSingleton.getInstance()
            const parts = Utils.splitOnFirst(' ', user.input)
            const name = Utils.cleanUserName(parts[0] ?? '')
            if(name.length > 0 && name != Config.twitch.chatbotName.toLowerCase()) {
                let reason = (parts[1] ?? '').replace('|', ' ').replace(';', ' ')
                const blacklist = await Settings.pullSetting<IBlacklistEntry>(Settings.TTS_BLACKLIST, 'userName', name)
                const cleanName = await Utils.loadCleanName(name)                       
                const speech = Config.controller.speechReferences[Keys.COMMAND_TTS_MUTE]
                if(blacklist == null || blacklist.active == false) {
                    Settings.pushSetting(Settings.TTS_BLACKLIST, 'userName', { userName: name, active: true, reason: reason })
                    modules.tts.enqueueSpeakSentence(await Utils.replaceTagsInText(speech[0], user))
                } else {
                    modules.tts.enqueueSpeakSentence(await Utils.replaceTagsInText(speech[1], user))
                }                    
            }
        },
        [Keys.COMMAND_TTS_UNMUTE]: async (user) => {
            const modules = ModulesSingleton.getInstance()
            const parts = Utils.splitOnFirst(' ', user.input)
            const name = Utils.cleanUserName(parts[0] ?? '')
            if(name.length == 0) return
            const blacklist = await Settings.pullSetting<IBlacklistEntry>(Settings.TTS_BLACKLIST, 'userName', name)
            const speech = Config.controller.speechReferences[Keys.COMMAND_TTS_UNMUTE]
            if(blacklist != null && blacklist.active) {
                const reason = Utils.cleanSetting(parts[1] ?? '')
                Settings.pushSetting(Settings.TTS_BLACKLIST, 'userName', { userName: name, active: false, reason: reason })    
                modules.tts.enqueueSpeakSentence(await Utils.replaceTagsInText(speech[0], user))
            } else {
                modules.tts.enqueueSpeakSentence(await Utils.replaceTagsInText(speech[1], user))
            }
        },

        /*
        ..####...##..##...####...######.
        .##..##..##..##..##..##....##...
        .##......######..######....##...
        .##..##..##..##..##..##....##...
        ..####...##..##..##..##....##...
        */
        [Keys.COMMAND_CHAT]: (user) => {
            const modules = ModulesSingleton.getInstance()
            modules.pipe.sendBasic(user.input)
        },       
        [Keys.COMMAND_CHAT_ON]: (user) => {
            const modules = ModulesSingleton.getInstance()
            const states = StatesSingleton.getInstance()
            states.pipeAllChat = true
            const speech = Config.controller.speechReferences[Keys.COMMAND_CHAT_ON]
            modules.tts.enqueueSpeakSentence(speech)
        },       
        [Keys.COMMAND_CHAT_OFF]: (user) => {
            const modules = ModulesSingleton.getInstance()
            const states = StatesSingleton.getInstance()
            states.pipeAllChat = false
            const speech = Config.controller.speechReferences[Keys.COMMAND_CHAT_OFF]
            modules.tts.enqueueSpeakSentence(speech)
        },
        [Keys.COMMAND_PING_ON]: (user) => {
            const modules = ModulesSingleton.getInstance()
            const states = StatesSingleton.getInstance()
            states.pingForChat = true
            Functions.setEmptySoundForTTS()
            const speech = Config.controller.speechReferences[Keys.COMMAND_PING_ON]
            modules.tts.enqueueSpeakSentence(speech)
        },
        [Keys.COMMAND_PING_OFF]: (user) => {
            const modules = ModulesSingleton.getInstance()
            const states = StatesSingleton.getInstance()
            states.pingForChat = false
            Functions.setEmptySoundForTTS()
            const speech = Config.controller.speechReferences[Keys.COMMAND_PING_OFF]
            modules.tts.enqueueSpeakSentence(speech)
        },
              
        [Keys.COMMAND_QUOTE]: async (user) => {
            const modules = ModulesSingleton.getInstance()
            const states = StatesSingleton.getInstance()
            let [login, quote] = Utils.splitOnFirst(' ', user.input)
            login = Utils.cleanUserName(login ?? '')
            if(login.length > 0 && quote.length > 0) {
                const userData = await modules.twitchHelix.getUserByLogin(login)
                const gameData = await SteamStore.getGameMeta(states.lastSteamAppId?.toString() ?? '')
                // Save quote to settings
                if(userData) {
                    await Settings.appendSetting(
                        Settings.QUOTES,
                        <IStreamQuote> { 
                            submitter: user.login, 
                            author: userData.login, 
                            quote: quote, 
                            datetime: Utils.getISOTimestamp(),
                            game: gameData?.name ?? ''
                        }
                    )
                    const speech = Config.controller.speechReferences[Keys.COMMAND_QUOTE]
                    modules.tts.enqueueSpeakSentence(
                        await Utils.replaceTagsInText(
                            <string> speech, 
                            user,
                            {quote: quote}
                        )
                    )
                } else Utils.log(`Could not find user ${login}`, Color.Red)
            } else {
                // Grab quote and write it in chat.
                const quotes = Settings.getFullSettings<IStreamQuote>(Settings.QUOTES)
                const quote = Utils.randomFromArray(quotes)
                if(quote) {
                    const date = new Date(quote.datetime)
                    const userData = await modules.twitchHelix.getUserByLogin(quote.author)
                    const speech = Config.controller.chatReferences[Keys.COMMAND_QUOTE]
                    modules.twitch._twitchChatOut.sendMessageToChannel(
                        await Utils.replaceTagsInText(
                            <string> speech, 
                            user,
                            { // We need to add targetTag as there is no user tag in the input.
                                date: date.toDateString() ?? 'N/A', 
                                targetTag: '@'+(userData?.display_name ?? ''), 
                                text: quote.quote,
                                gameName: quote.game ?? 'N/A'
                            }
                        )
                    )
                }
            }
        },

        /*
        .##.......####....####..
        .##......##..##..##.....
        .##......##..##..##.###.
        .##......##..##..##..##.
        .######...####....####..
        */
        [Keys.COMMAND_LOG_ON]: (user) => {
            const modules = ModulesSingleton.getInstance()
            const states = StatesSingleton.getInstance()
            states.logChatToDiscord = true
            const speech = Config.controller.speechReferences[Keys.COMMAND_LOG_ON]
            modules.tts.enqueueSpeakSentence(speech)
        },
        [Keys.COMMAND_LOG_OFF]: (user) => {
            const modules = ModulesSingleton.getInstance()
            const states = StatesSingleton.getInstance()
            states.logChatToDiscord = false
            const speech = Config.controller.speechReferences[Keys.COMMAND_LOG_OFF]
            modules.tts.enqueueSpeakSentence(speech)
        },

        /*
        ..####....####....####...##......######.
        .##......##..##..##..##..##......##.....
        ..####...##......######..##......####...
        .....##..##..##..##..##..##......##.....
        ..####....####...##..##..######..######.
        */
        [Keys.COMMAND_SCALE]: async (user) => {
            const modules = ModulesSingleton.getInstance()
            const states = StatesSingleton.getInstance()
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
                    modules.tts.enqueueSpeakSentence(speech[3], Config.twitch.chatbotName, TTSType.Announcement)
                } else { 
                    // TODO: Disable all scale rewards
                    // Launch interval
                    modules.tts.enqueueSpeakSentence(
                        await Utils.replaceTagsInText(
                            speech[1], 
                            user,
                            {
                                from: fromScale.toString(), 
                                to: toScale.toString(), 
                                mins: forMinutes.toString()
                            }
                        )
                    )
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
                                modules.tts.enqueueSpeakSentence(speech[2])
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
                let scale = Utils.toInt(user.input)
                if(isNaN(scale)) scale = 100
                if(states.scaleIntervalHandle > -1) {
                    const speech = Config.controller.speechReferences[Keys.COMMAND_SCALE]
                    clearInterval(states.scaleIntervalHandle)
                    states.scaleIntervalHandle = -1
                    Settings.pushLabel(Settings.WORLD_SCALE_LABEL, "")
                    modules.tts.enqueueSpeakSentence(speech[4])
                }
                const value = Math.max(10, Math.min(1000, scale || 100))
                modules.tts.enqueueSpeakSentence(
                    await Utils.replaceTagsInText(
                        speech[0], 
                        user, 
                        { // Overriding the number tag as the scale is clamped.
                            userNumber: value.toString()
                        }
                    )
                )
                modules.openvr2ws.setSetting({
                    setting: OpenVR2WS.SETTING_WORLD_SCALE,
                    value: value/100.0
                })    
            }
        },

        /*
        ..####...######..######...####...##...##..##..##..#####..
        .##........##....##......##..##..###.###..##..##..##..##.
        ..####.....##....####....######..##.#.##..##..##..#####..
        .....##....##....##......##..##..##...##...####...##..##.
        ..####.....##....######..##..##..##...##....##....##..##.
        */
         // TODO: WIP - Should only work with what the headset supports
        [Keys.COMMAND_BRIGHTNESS]: (user) => {
            const modules = ModulesSingleton.getInstance()
            const brightness = Utils.toInt(user.input, 130)
            const speech = Config.controller.speechReferences[Keys.COMMAND_BRIGHTNESS]
            const value = Math.max(0, Math.min(160, brightness)) // TODO: There are properties in SteamVR to read out for safe min/max values or if available at all! https://github.com/ValveSoftware/openvr/blob/4c85abcb7f7f1f02adaf3812018c99fc593bc341/headers/openvr.h#L475
            modules.tts.enqueueSpeakSentence(Utils.replaceTags(speech, {value: value.toString()}))
            modules.openvr2ws.setSetting({
                setting: OpenVR2WS.SETTING_ANALOG_GAIN,
                value: value/100.0
            })
        },

         // TODO: WIP - Should only work with what the headset supports
        [Keys.COMMAND_REFRESHRATE]: (user) => {
            const modules = ModulesSingleton.getInstance()  
            const validRefreshRates = [80, 90, 120, 144] // TODO: Load from OpenVR2WS so we don't set unsupported frame-rates as it breaks the headset.
            const possibleRefreshRate = Utils.toInt(user.input, 120)
            const refreshRate = (validRefreshRates.indexOf(possibleRefreshRate) != -1) ? possibleRefreshRate : 120
            const speech = Config.controller.speechReferences[Keys.COMMAND_REFRESHRATE]
            const value = Math.max(0, Math.min(160, refreshRate)) // TODO: Are there also properties for supported frame-rates?! https://github.com/ValveSoftware/openvr/blob/4c85abcb7f7f1f02adaf3812018c99fc593bc341/headers/openvr.h#L470
            modules.tts.enqueueSpeakSentence(Utils.replaceTags(speech, {value: value.toString()}))
            modules.openvr2ws.setSetting({
                setting: OpenVR2WS.SETTING_PREFERRED_REFRESH_RATE,
                value: value
            })
        },

         // Currently not actually effective due to how the VR View does not listen to config changes
        [Keys.COMMAND_VRVIEWEYE]: (user) => {
            const modules = ModulesSingleton.getInstance()
            const eyeMode = Utils.toInt(user.input, 4)
            const speech = Config.controller.speechReferences[Keys.COMMAND_VRVIEWEYE]
            const value = Math.max(0, Math.min(5, eyeMode))
            modules.tts.enqueueSpeakSentence(Utils.replaceTags(speech, {value: value.toString()}))
            modules.openvr2ws.setSetting({
                setting: OpenVR2WS.SETTING_MIRROR_VIEW_EYE,
                value: value
            })
        },

        /*
        .#####...######...####...######..######...####...##..##...####...#####...##..##.
        .##..##....##....##..##....##......##....##..##..###.##..##..##..##..##...####..
        .##..##....##....##........##......##....##..##..##.###..######..#####.....##...
        .##..##....##....##..##....##......##....##..##..##..##..##..##..##..##....##...
        .#####...######...####.....##....######...####...##..##..##..##..##..##....##...
        */
        [Keys.COMMAND_DICTIONARY]: async (user) => {
            const modules = ModulesSingleton.getInstance()
            let [word, substitute] = Utils.splitOnFirst(' ', user.input)
            word = word.trim().toLocaleLowerCase()
            substitute = substitute.trim().replace(/\|/g, ',').toLowerCase()
            if(word.length && substitute.length > 0) {
                const speech = Config.controller.speechReferences[Keys.COMMAND_DICTIONARY]
                const setting = <IDictionaryEntry> {
                    original: word, 
                    substitute: substitute, 
                    editor: user.login, 
                    datetime: Utils.getISOTimestamp()
                }
                Settings.pushSetting(Settings.TTS_DICTIONARY, 'original', setting)
                modules.tts.setDictionary(<IDictionaryEntry[]> Settings.getFullSettings(Settings.TTS_DICTIONARY))
                modules.tts.enqueueSpeakSentence(
                    await Utils.replaceTagsInText(
                        <string> speech, 
                        user,
                        {
                            word: word, 
                            substitute: substitute
                        }
                    ),
                    Config.twitch.chatbotName,
                    TTSType.Announcement,
                    '',
                    null,
                    [],
                    true
                )
            } else { // Messed up
                const chat = Config.controller.chatReferences[Keys.COMMAND_DICTIONARY]
                const currentEntry = await Settings.pullSetting<IDictionaryEntry>(Settings.TTS_DICTIONARY, 'original', word)
                if(currentEntry) {
                    modules.twitch._twitchChatOut.sendMessageToChannel(await Utils.replaceTagsInText(chat[1], user,  {word: currentEntry.original, value: currentEntry.substitute}))
                } else {
                    modules.twitch._twitchChatOut.sendMessageToChannel(await Utils.replaceTagsInText(chat[0],  user,  {word: word}))
                }
            }
        },

        /*
        .#####...######..##...##...####...#####...#####....####..
        .##..##..##......##...##..##..##..##..##..##..##..##.....
        .#####...####....##.#.##..######..#####...##..##...####..
        .##..##..##......#######..##..##..##..##..##..##......##.
        .##..##..######...##.##...##..##..##..##..#####....####..
        */
        
        [Keys.COMMAND_UPDATEREWARDS]: async (user) => {
            const modules = ModulesSingleton.getInstance()
            let storedRewards = Settings.getFullSettings<ITwitchRewardPair>(Settings.TWITCH_REWARDS)
            if(storedRewards == undefined) storedRewards = []
            for(const pair of storedRewards) {
                const eventConfig = Utils.getEventConfig(pair.key)
                const rewardSetup = eventConfig?.triggers?.reward
                const config = Array.isArray(rewardSetup) ? rewardSetup[0] : rewardSetup
                if(config != undefined && eventConfig?.options?.rewardIgnoreUpdateCommand !== true) {
                    const response = await modules.twitchHelix.updateReward(pair.id, config)
                    if(response != null && response.data != null) {
                        const success = response?.data[0]?.id == pair.id
                        Utils.logWithBold(`Reward <${pair.key}> updated: <${success?'YES':'NO'}>`, success ? Color.Green : Color.Red)
                        
                        // If update was successful, also reset incremental setting as the reward should have been reset.
                        if(Array.isArray(rewardSetup)) {
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
        },
       
        [Keys.COMMAND_GAMEREWARDS_ON]: (user) => {
            const modules = ModulesSingleton.getInstance()
            const states = StatesSingleton.getInstance()
            states.useGameSpecificRewards = true
            const speech = Config.controller.speechReferences[Keys.COMMAND_GAMEREWARDS_ON]
            modules.tts.enqueueSpeakSentence(speech)
            Functions.appIdCallback(states.lastSteamAppId ?? '', StatesSingleton.getInstance().lastSteamAppIsVR)
        },
        [Keys.COMMAND_GAMEREWARDS_OFF]: (user) => {
            const modules = ModulesSingleton.getInstance()
            const states = StatesSingleton.getInstance()
            states.useGameSpecificRewards = false
            const speech = Config.controller.speechReferences[Keys.COMMAND_GAMEREWARDS_OFF]
            modules.tts.enqueueSpeakSentence(speech)
            Functions.appIdCallback('', false)
        },
        [Keys.COMMAND_REFUND_REDEMPTION]: async (user) => {
            const modules = ModulesSingleton.getInstance()
            const redemptions = Settings.getFullSettings<ITwitchRedemption>(Settings.TWITCH_REWARD_REDEMPTIONS)
            const userName = Utils.getFirstUserTagInText(user.input)
            if(!userName) return
            const userTag = `@${userName}`
            const userData = await modules.twitchHelix.getUserByLogin(userName)
            const userRedemptions = redemptions?.filter(
                redemption => (redemption.userId == userData?.id) && (redemption.status == 'UNFULFILLED')
            )
            const message = Config.controller.chatReferences[Keys.COMMAND_REFUND_REDEMPTION]
            if(userRedemptions && userRedemptions.length > 0) {
                const lastRedemption = userRedemptions.reduce(
                    (prev, current) => (Date.parse(prev.time) > Date.parse(current.time)) ? prev : current
                )
                if(lastRedemption) {
                    lastRedemption.status = 'CANCELED'
                    const result = await modules.twitchHelix.updateRedemption(lastRedemption)
                    if(result) {
                        Settings.pushSetting(Settings.TWITCH_REWARD_REDEMPTIONS, 'redemptionId', lastRedemption)
                        modules.twitch._twitchChatOut.sendMessageToChannel(await Utils.replaceTags( message[0], {targetTag: userTag, cost: lastRedemption.cost}))
                    } else {
                        modules.twitch._twitchChatOut.sendMessageToChannel(await Utils.replaceTags( message[1], {targetTag: userTag}))
                    }
                } else modules.twitch._twitchChatOut.sendMessageToChannel(await Utils.replaceTags( message[2], {targetTag: userTag}))
            } else modules.twitch._twitchChatOut.sendMessageToChannel(await Utils.replaceTags( message[2], {targetTag: userTag}))
        },
        [Keys.COMMAND_CLEAR_REDEMPTIONS]: async (user) => {
            const modules = ModulesSingleton.getInstance()
            const redemptions = Settings.getFullSettings<ITwitchRedemption>(Settings.TWITCH_REWARD_REDEMPTIONS)
            const speech = Config.controller.speechReferences[Keys.COMMAND_CLEAR_REDEMPTIONS]
            modules.tts.enqueueSpeakSentence(speech[0])
            const unfulfilledRedemptions = redemptions?.filter(
                redemption => redemption.status == 'UNFULFILLED'
            )
            if(unfulfilledRedemptions && unfulfilledRedemptions.length > 0) {
                let clearCount = 0
                const leftoverRedemptions: ITwitchRedemption[] = []
                for(const redemption of unfulfilledRedemptions) {
                    const redemptionClone = Utils.clone(redemption)
                    redemptionClone.status = 'FULFILLED'
                    const result = await modules.twitchHelix.updateRedemption(redemptionClone)
                    if(result) clearCount++
                    else leftoverRedemptions.push(redemption)
                }
                await Settings.saveSettings(Settings.TWITCH_REWARD_REDEMPTIONS, leftoverRedemptions) // Replace list with the redemptions that were not fulfilled.
                await Settings.loadSettings(Settings.TWITCH_REWARD_REDEMPTIONS) // Load again to replace in-memory list
                modules.tts.enqueueSpeakSentence(
                    Utils.replaceTags(
                        speech[1], 
                        {total: unfulfilledRedemptions.length.toString(), count: clearCount.toString()}
                    )
                )
            } else modules.tts.enqueueSpeakSentence(speech[2])
        },
        [Keys.COMMAND_RESET_INCREWARD]: async (user) => {
            const modules = ModulesSingleton.getInstance()
            const speech = Config.controller.speechReferences[Keys.COMMAND_RESET_INCREWARD]
            modules.tts.enqueueSpeakSentence(speech[0])
            // Reset rewards with multiple steps
            const allRewardKeys = Utils.getAllEventKeys(true)
            let totalCount = 0
            let totalResetCount = 0
            let totalSkippedCount = 0
            for(const key of allRewardKeys) {
                const eventConfig = Utils.getEventConfig(key)
                if(
                    eventConfig?.options?.rewardType == ERewardType.Incrementing
                    && eventConfig?.options?.rewardResetIncrementOnCommand === true
                ) {
                    totalCount++
                    const rewardSetup = eventConfig?.triggers?.reward
                    if(Array.isArray(rewardSetup)) {
                        // We check if the reward counter is at zero because then we should not update as it enables 
                        // the reward while it could have been disabled by profiles.
                        // To update settings for the base reward, we update it as any normal reward, using !update.
                        const current = await Settings.pullSetting<ITwitchRewardCounter>(Settings.TWITCH_REWARD_COUNTERS, 'key', key)
                        if((current?.count ?? 0) > 0) {
                            Utils.log(`Resetting incrementing reward: ${key}`, Color.Green)
                            const reset: ITwitchRewardCounter = {key: key, count: 0}
                            await Settings.pushSetting(Settings.TWITCH_REWARD_COUNTERS, 'key', reset)
                            await modules.twitchHelix.updateReward(await Utils.getRewardId(key), rewardSetup[0])
                            totalResetCount++
                        } else {
                            totalSkippedCount++
                        }
                    }
                }
            }
            modules.tts.enqueueSpeakSentence(Utils.replaceTags(speech[1], {
                total: totalCount.toString(), 
                reset: totalResetCount.toString(), 
                skipped: totalSkippedCount.toString()
            }))
        },

        /*
        ..####...##..##...####...######..######..##...##.
        .##.......####...##........##....##......###.###.
        ..####.....##.....####.....##....####....##.#.##.
        .....##....##........##....##....##......##...##.
        ..####.....##.....####.....##....######..##...##.
        */
        
        [Keys.COMMAND_RELOADWIDGET]: (user) => {
            window.location.reload()
        },
        
        [Keys.COMMAND_CHANNELTROPHY_STATS]: async (user) => {
            const modules = ModulesSingleton.getInstance()
            const speech = Config.controller.speechReferences[Keys.COMMAND_CHANNELTROPHY_STATS]
            const numberOfStreams = await ChannelTrophy.getNumberOfStreams()
            const streamNumber = Utils.toInt(user.input)
            if(user.input == "all") {
                modules.tts.enqueueSpeakSentence(speech[0])
                for(let i=0; i<numberOfStreams; i++) {
                    const embeds = await ChannelTrophy.createStatisticsEmbedsForDiscord(modules.twitchHelix, i)
                    Discord.enqueuePayload(Config.credentials.DiscordWebhooks[Keys.COMMAND_CHANNELTROPHY_STATS], {
                        content: Utils.numberToDiscordEmote(i+1, true),
                        embeds: embeds
                    })
                }
                modules.tts.enqueueSpeakSentence(speech[1])
            } else if (!isNaN(streamNumber)) {
                modules.tts.enqueueSpeakSentence(speech[2])
                const embeds = await ChannelTrophy.createStatisticsEmbedsForDiscord(modules.twitchHelix, streamNumber-1)
                Discord.enqueuePayload(Config.credentials.DiscordWebhooks[Keys.COMMAND_CHANNELTROPHY_STATS], {
                    content: Utils.numberToDiscordEmote(streamNumber, true),
                    embeds: embeds
                }, (success) => {
                    modules.tts.enqueueSpeakSentence(speech[success ? 3 : 4])
                })
                
            } else {
                modules.tts.enqueueSpeakSentence(speech[2])
                const embeds = await ChannelTrophy.createStatisticsEmbedsForDiscord(modules.twitchHelix)
                Discord.enqueuePayload(Config.credentials.DiscordWebhooks[Keys.COMMAND_CHANNELTROPHY_STATS], {
                    content: Utils.numberToDiscordEmote(numberOfStreams, true),
                    embeds: embeds
                }, (success) => {
                    modules.tts.enqueueSpeakSentence(speech[success ? 3 : 4])
                })
            }
        },
        
        [Keys.COMMAND_CLIPS]: async (user) => {
            const modules = ModulesSingleton.getInstance()
            const pageCount = 20
            let lastCount = pageCount
            const oldClips = await Settings.getFullSettings<ITwitchClip>(Settings.TWITCH_CLIPS)
            const speech = Config.controller.speechReferences[Keys.COMMAND_CLIPS]
            modules.tts.enqueueSpeakSentence(speech[0])

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
            modules.tts.enqueueSpeakSentence(
                await Utils.replaceTagsInText(
                    speech[1], 
                    user,
                    {
                        count1: oldClipIds.length.toString(), 
                        count2: newClips.length.toString()
                    }
                )
            )

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
            modules.tts.enqueueSpeakSentence(
                await Utils.replaceTagsInText(
                    speech[2], 
                    user,
                    {count: (count-1-oldClipIds.length).toString()}
                )
            )
        },
        
        [Keys.COMMAND_GAMERESET]: async (user) => {
            const modules = ModulesSingleton.getInstance()
            const states = StatesSingleton.getInstance()
            modules.tts.enqueueSpeakSentence(Config.controller.speechReferences[Keys.COMMAND_GAMERESET])
            Functions.appIdCallback('', false)
            states.lastSteamAppId = undefined
            states.lastSteamAppIsVR = false
        },

        [Keys.COMMAND_RAID]: async (user) => {
            const modules = ModulesSingleton.getInstance()
            let channel = 
                Utils.getFirstUserTagInText(user.input) 
                ?? user.input.split(' ').shift()
                ?? ''
            if(channel.includes('https://')) channel = channel.split('/').pop() ?? ''
            Utils.log(`Command Raid: ${user.input} -> ${channel}`, Color.Blue, true, true)
            const channelData = await modules.twitchHelix.getChannelByName(channel)
            const chat = Config.controller.chatReferences[Keys.COMMAND_RAID]
            if(channelData) {
                modules.twitchHelix.raidChannel(channelData.broadcaster_id)
                if(chat) {
                    if(chat[0] && chat[0].length > 0) modules.twitch._twitchChatOut.sendMessageToChannel(await Utils.replaceTagsInText(chat[0], user))
                    if(chat[1] && chat[1].length > 0) modules.twitch._twitchChatOut.sendMessageToChannel(await Utils.replaceTagsInText(chat[1], user))
                }
            } else {
                if(chat && chat.length >= 3) modules.twitch._twitchChatOut.sendMessageToChannel(await Utils.replaceTagsInText(chat[2], user))
            }
        },

        [Keys.COMMAND_UNRAID]: async (user) => {
            const modules = ModulesSingleton.getInstance()
            const result = await modules.twitchHelix.cancelRaid()
            const chat = Config.controller.chatReferences[Keys.COMMAND_UNRAID]
            if(chat) {
                if(result) modules.twitch._twitchChatOut.sendMessageToChannel(chat[0])
                else modules.twitch._twitchChatOut.sendMessageToChannel(chat[1])
            }
        },

        [Keys.COMMAND_REMOTE_ON]: async (user) => {
            const modules = ModulesSingleton.getInstance()
            const states = StatesSingleton.getInstance()
            states.runRemoteCommands = true
            const speech = Utils.ensureValue(Config.controller.speechReferences[Keys.COMMAND_REMOTE_ON]) ?? ''
            modules.tts.enqueueSpeakSentence(
                await Utils.replaceTagsInText(
                    speech,
                    user
                ),  
                Config.twitch.chatbotName,
                TTSType.Announcement
            )
        },
        [Keys.COMMAND_REMOTE_OFF]: async (user) => {
            const modules = ModulesSingleton.getInstance()
            const states = StatesSingleton.getInstance()
            states.runRemoteCommands = false
            const speech = Utils.ensureValue(Config.controller.speechReferences[Keys.COMMAND_REMOTE_OFF]) ?? ''
            modules.tts.enqueueSpeakSentence(
                await Utils.replaceTagsInText(
                    speech,
                    user
                ),
                Config.twitch.chatbotName,
                TTSType.Announcement
            )
        }
    }
}
