import {IActionsCallbackStack, IActionUser} from './interfaces/iactions.js'
import ModulesSingleton from './modules_singleton.js'
import StatesSingleton from './base/states_singleton.js'
import Config from './statics/config.js'
import Functions from './functions.js'
import Utils from './base/utils.js'
import SteamStore from './modules/steam_store.js'
import Settings from './modules/settings.js'
import {
    IChannelTrophyStat,
    IEventCounter,
    IStreamQuote,
    ITwitchClip,
    ITwitchRedemption,
    ITwitchRewardPair
} from './interfaces/isettings.js'
import Color from './statics/colors.js'
import {ETTSType} from './base/enums.js'
import OpenVR2WS from './modules/openvr2ws.js'
import {EBehavior, IEvent} from './interfaces/ievents.js'
import ChannelTrophy from './modules/channeltrophy.js'
import Discord from './modules/discord.js'
import {ITwitchHelixClipResponseData} from './interfaces/itwitch_helix.js'
import {TKeys} from './_data/!keys.js'

export default class ActionsCallbacks {
    public static stack: IActionsCallbackStack = {
        // region Chat
        'Chat': {
            tag: 'Chat',
            description: 'Sends a message to the chat overlay in VR.',
            call: (user) => {
                const modules = ModulesSingleton.getInstance()
                modules.pipe.sendBasic(user.input)
            }
        },
        'ChatOn': {
            tag: 'Chat On',
            description: 'Enables the chat overlay in VR.',
            call: (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.pipeAllChat = true
                const speech = Config.controller.speechReferences['ChatOn'] ?? ''
                modules.tts.enqueueSpeakSentence(speech).then()
            }
        },
        'ChatOff': {
            tag: 'Chat Off',
            description: 'Disables the chat overlay in VR.',
            call: (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.pipeAllChat = false
                const speech = Config.controller.speechReferences['ChatOff'] ?? ''
                modules.tts.enqueueSpeakSentence(speech).then()
            }
        },
        'PingOn': {
            tag: 'Ping On',
            description: 'Enables a sound effect for chat messages if TTS is off or messages are empty.',
            call: (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.pingForChat = true
                Functions.setEmptySoundForTTS()
                const speech = Config.controller.speechReferences['PingOn'] ?? ''
                modules.tts.enqueueSpeakSentence(speech).then()
            }
        },
        'PingOff': {
            tag: 'Ping Off',
            description: 'Disables the sound effect for chat messages.',
            call: (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.pingForChat = false
                Functions.setEmptySoundForTTS()
                const speech = Config.controller.speechReferences['PingOff'] ?? ''
                modules.tts.enqueueSpeakSentence(speech).then()
            }
        },
        // endregion

        'Quote': {
            tag: 'Quote',
            description: 'Stores a new quote or posts a random quote to chat.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                let [login, quote] = Utils.splitOnFirst(' ', user.input)
                if(user.input.length > 0 && quote.length > 0) {
                    // Get login or use channel name
                    const isTag = login.includes('@')
                    login = Utils.cleanUserName(login ?? '')
                    const userData = await modules.twitchHelix.getUserByLogin(login)
                    if(!isTag || !userData) login = Config.twitch.channelName
                    const gameData = await SteamStore.getGameMeta(states.lastSteamAppId?.toString() ?? '')

                    // Save quote to settings
                    if(login.length > 0) {
                        await Settings.appendSetting(
                            Settings.QUOTES,
                            <IStreamQuote> {
                                submitter: user.login,
                                author: login,
                                quote: quote,
                                datetime: Utils.getISOTimestamp(),
                                game: gameData?.name ?? ''
                            }
                        )
                        const speech = Config.controller.speechReferences['Quote'] ?? ''
                        modules.tts.enqueueSpeakSentence(
                            await Utils.replaceTagsInText(
                                <string> speech,
                                user,
                                {quote: quote}
                            )
                        ).then()
                    } else Utils.log(`Could not find user: ${login}`, Color.Red)
                } else {
                    // Grab quote and write it in chat.
                    const quotes = Settings.getFullSettings<IStreamQuote>(Settings.QUOTES)
                    const quote = Utils.randomFromArray(quotes)
                    if(quote) {
                        const date = new Date(quote.datetime)
                        const userData = await modules.twitchHelix.getUserByLogin(quote.author)
                        const speech = Config.controller.chatReferences['Quote'] ?? ''
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
            }
        },

        // region Logging
        'LogOn': {
            tag: 'Log On',
            description: 'Enables logging of chat to Discord.',
            call: (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.logChatToDiscord = true
                const speech = Config.controller.speechReferences['LogOn'] ?? ''
                modules.tts.enqueueSpeakSentence(speech).then()
            }
        },
        'LogOff': {
            tag: 'Log Off',
            description: 'Disables logging of chat to Discord.',
            call: (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.logChatToDiscord = false
                const speech = Config.controller.speechReferences['LogOff'] ?? ''
                modules.tts.enqueueSpeakSentence(speech).then()
            }
        },
        // endregion

        // region Scale
        'Scale': {
            tag: 'Scale',
            description: 'Changes the world scale of the currently running VR game.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                const parts = user.input.split(' ')
                const speech = Config.controller.speechReferences['Scale'] ?? ''
                if(parts.length == 3) {
                    const fromScale = parseInt(parts[0])
                    const toScale = parseInt(parts[1])
                    const forMinutes = parseInt(parts[2])
                    const intervalMs = 10000 // 10s
                    const steps = forMinutes*60*1000/intervalMs
                    if(isNaN(fromScale) || isNaN(toScale) || isNaN(forMinutes)) {
                        // Fail to start interval
                        modules.tts.enqueueSpeakSentence(
                            speech[3],
                            Config.twitch.chatbotName,
                            ETTSType.Announcement
                        ).then()
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
                        ).then()
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
                        const speech = Config.controller.speechReferences['Scale'] ?? ''
                        clearInterval(states.scaleIntervalHandle)
                        states.scaleIntervalHandle = -1
                        Settings.pushLabel(Settings.WORLD_SCALE_LABEL, '').then()
                        modules.tts.enqueueSpeakSentence(speech[4]).then()
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
                    ).then()
                    modules.openvr2ws.setSetting({
                        setting: OpenVR2WS.SETTING_WORLD_SCALE,
                        value: value/100.0
                    }).then()
                }
            }
        },
        // endregion

        // region SteamVR
        // TODO: WIP - Should only work with what the headset supports
        'Brightness': {
            tag: 'Brightness',
            description: 'Changes the display brightness of the headset.',
            call: (user) => {
                const modules = ModulesSingleton.getInstance()
                const brightness = Utils.toInt(user.input, 130)
                const speech = Config.controller.speechReferences['Brightness'] ?? ''
                const value = Math.max(0, Math.min(160, brightness)) // TODO: There are properties in SteamVR to read out for safe min/max values or if available at all! https://github.com/ValveSoftware/openvr/blob/4c85abcb7f7f1f02adaf3812018c99fc593bc341/headers/openvr.h#L475
                modules.tts.enqueueSpeakSentence(Utils.replaceTags(speech, {value: value.toString()})).then()
                modules.openvr2ws.setSetting({
                    setting: OpenVR2WS.SETTING_ANALOG_GAIN,
                    value: value/100.0
                }).then()
            }
        },

        // TODO: WIP - Should only work with what the headset supports
        'RefreshRate': {
            tag: 'RefreshRate',
            description: 'Changes the display refresh rate of the headset.',
            call: (user) => {
                const modules = ModulesSingleton.getInstance()
                const validRefreshRates = [80, 90, 120, 144] // TODO: Load from OpenVR2WS so we don't set unsupported frame-rates as it breaks the headset.
                const possibleRefreshRate = Utils.toInt(user.input, 120)
                const refreshRate = (validRefreshRates.indexOf(possibleRefreshRate) != -1) ? possibleRefreshRate : 120
                const speech = Config.controller.speechReferences['RefreshRate'] ?? ''
                const value = Math.max(0, Math.min(160, refreshRate)) // TODO: Are there also properties for supported frame-rates?! https://github.com/ValveSoftware/openvr/blob/4c85abcb7f7f1f02adaf3812018c99fc593bc341/headers/openvr.h#L470
                modules.tts.enqueueSpeakSentence(Utils.replaceTags(speech, {value: value.toString()})).then()
                modules.openvr2ws.setSetting({
                    setting: OpenVR2WS.SETTING_PREFERRED_REFRESH_RATE,
                    value: value
                }).then()
            }
        },

        // Currently not actually effective due to how the VR View does not listen to config changes
        'VrViewEye': {
            tag: 'VRViewEye',
            description: 'Changes the eye used for the VR View. Or would if it updated live.',
            call: (user) => {
                const modules = ModulesSingleton.getInstance()
                const eyeMode = Utils.toInt(user.input, 4)
                const speech = Config.controller.speechReferences['VrViewEye'] ?? ''
                const value = Math.max(0, Math.min(5, eyeMode))
                modules.tts.enqueueSpeakSentence(Utils.replaceTags(speech, {value: value.toString()})).then()
                modules.openvr2ws.setSetting({
                    setting: OpenVR2WS.SETTING_MIRROR_VIEW_EYE,
                    value: value
                }).then()
            }
        },
        // endregion

        // region Rewards
        'UpdateRewards': {
            tag: 'UpdateRewards',
            description: 'Update the properties of the channel rewards managed by the widget.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                let storedRewards = Settings.getFullSettings<ITwitchRewardPair>(Settings.TWITCH_REWARDS)
                if(storedRewards == undefined) storedRewards = []
                for(const pair of storedRewards) {
                    const eventConfig = Utils.getEventConfig(pair.key)
                    const rewardSetup = eventConfig?.triggers?.reward
                    const config = Array.isArray(rewardSetup) ? rewardSetup[0] : rewardSetup
                    if(config != undefined && eventConfig?.options?.rewardIgnoreUpdateCommand !== true) {
                        const configClone = Utils.clone(config)
                        configClone.title = await Utils.replaceTagsInText(configClone.title, user)
                        configClone.prompt = await Utils.replaceTagsInText(configClone.prompt, user)
                        const response = await modules.twitchHelix.updateReward(pair.id, config)
                        if(response != null && response.data != null) {
                            const success = response?.data[0]?.id == pair.id
                            Utils.logWithBold(`Reward <${pair.key}> updated: <${success?'YES':'NO'}>`, success ? Color.Green : Color.Red)

                            // If update was successful, also reset incremental setting as the reward should have been reset.
                            if(Array.isArray(rewardSetup)) {
                                const reset: IEventCounter = {key: pair.key, count: 0}
                                Settings.pushSetting(Settings.EVENT_COUNTERS_INCREMENTAL, 'key', reset)
                            }
                        } else {
                            Utils.logWithBold(`Reward <${pair.key}> update unsuccessful.`, Color.Red)
                        }
                    } else {
                        Utils.logWithBold(`Reward <${pair.key}> update skipped or unavailable.`, Color.Purple)
                    }
                }
            }
        },

        'GameRewardsOn': {
            tag: 'GameRewardsOn',
            description: 'Enable the channel rewards that are game specific.',
            call: (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.useGameSpecificRewards = true
                const speech = Config.controller.speechReferences['GameRewardsOn'] ?? ''
                modules.tts.enqueueSpeakSentence(speech).then()
                Functions.appIdCallback(states.lastSteamAppId ?? '', StatesSingleton.getInstance().lastSteamAppIsVR).then()
            }
        },
        'GameRewardsOff': {
            tag: 'GameRewardsOff',
            description: 'Disable the channel rewards that are game specific.',
            call: (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.useGameSpecificRewards = false
                const speech = Config.controller.speechReferences['GameRewardsOff'] ?? ''
                modules.tts.enqueueSpeakSentence(speech).then()
                Functions.appIdCallback('', false).then()
            }
        },
        'RefundRedemption': {
            tag: 'RefundRedemption',
            description: 'Refund the last registered redemption for a user.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const redemptions = Settings.getFullSettings<ITwitchRedemption>(Settings.TWITCH_REWARD_REDEMPTIONS)
                const userName = Utils.getFirstUserTagInText(user.input)
                if(!userName) return
                const userTag = `@${userName}`
                const userData = await modules.twitchHelix.getUserByLogin(userName)
                const userRedemptions = redemptions?.filter(
                    redemption => (redemption.userId == userData?.id) && (redemption.status == 'UNFULFILLED')
                )
                const message = Config.controller.chatReferences['RefundRedemption'] ?? []
                if(userRedemptions && userRedemptions.length > 0) {
                    const lastRedemption = userRedemptions.reduce(
                        (prev, current) => (Date.parse(prev.time) > Date.parse(current.time)) ? prev : current
                    )
                    if(lastRedemption) {
                        lastRedemption.status = 'CANCELED'
                        const result = await modules.twitchHelix.updateRedemption(lastRedemption)
                        if(result) {
                            Settings.pushSetting(Settings.TWITCH_REWARD_REDEMPTIONS, 'redemptionId', lastRedemption).then()
                            modules.twitch._twitchChatOut.sendMessageToChannel(await Utils.replaceTags( message[0], {targetTag: userTag, cost: lastRedemption.cost}))
                        } else {
                            modules.twitch._twitchChatOut.sendMessageToChannel(await Utils.replaceTags( message[1], {targetTag: userTag}))
                        }
                    } else modules.twitch._twitchChatOut.sendMessageToChannel(await Utils.replaceTags( message[2], {targetTag: userTag}))
                } else modules.twitch._twitchChatOut.sendMessageToChannel(await Utils.replaceTags( message[2], {targetTag: userTag}))
            }
        },
        'ClearRedemptions': {
            tag: 'ClearRedemptions',
            description: 'Clear redemptions from the queue for the channel, except ignored ones.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const redemptions = Settings.getFullSettings<ITwitchRedemption>(Settings.TWITCH_REWARD_REDEMPTIONS)
                const speech = Config.controller.speechReferences['ClearRedemptions'] ?? []
                modules.tts.enqueueSpeakSentence(speech[0]).then()
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
                    ).then()
                } else modules.tts.enqueueSpeakSentence(speech[2]).then()
            }
        },

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
        },
        // endregion

        // region Redemptions
        'ResetIncrementingEvents': {
            tag: 'ResetIncrementalReward',
            description: 'Reset the incremental reward counter for those rewards, unless ignored.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const speech = Config.controller.speechReferences['ResetIncrementingEvents'] ?? []
                modules.tts.enqueueSpeakSentence(speech[0]).then()
                // Reset rewards with multiple steps
                const allRewardKeys = Utils.getAllEventKeys(true)
                let totalCount = 0
                let totalResetCount = 0
                let totalSkippedCount = 0
                for(const key of allRewardKeys) {
                    const eventConfig = Utils.getEventConfig(key)
                    if(
                        eventConfig?.options?.behavior == EBehavior.Incrementing
                        && eventConfig?.options?.resetIncrementOnCommand === true
                    ) {
                        totalCount++
                        const rewardSetup = eventConfig?.triggers?.reward
                        if(Array.isArray(rewardSetup)) {
                            // We check if the reward counter is at zero because then we should not update as it enables
                            // the reward while it could have been disabled by profiles.
                            // To update settings for the base reward, we update it as any normal reward, using !update.
                            const current = await Settings.pullSetting<IEventCounter>(Settings.EVENT_COUNTERS_INCREMENTAL, 'key', key)
                            if((current?.count ?? 0) > 0) {
                                Utils.log(`Resetting incrementing reward: ${key}`, Color.Green)
                                const reset: IEventCounter = {key: key, count: 0}
                                await Settings.pushSetting(Settings.EVENT_COUNTERS_INCREMENTAL, 'key', reset)
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
                })).then()
            }
        },
        'ResetAccumulatingEvents': {
            tag: 'ResetAccumulatingReward',
            description: 'Reset the accumulating reward counter for those rewards, unless ignored.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const speech = Config.controller.speechReferences['ResetAccumulatingEvents'] ?? []
                modules.tts.enqueueSpeakSentence(speech[0]).then()
                // Reset rewards with multiple steps
                const allRewardKeys = Utils.getAllEventKeys(true)
                let totalCount = 0
                let totalResetCount = 0
                let totalSkippedCount = 0
                for(const key of allRewardKeys) {
                    const eventConfig = Utils.getEventConfig(key)
                    if(
                        eventConfig?.options?.behavior == EBehavior.Accumulating
                        && eventConfig?.options?.resetAccumulationOnCommand === true
                    ) {
                        totalCount++
                        const rewardSetup = eventConfig?.triggers?.reward
                        if(Array.isArray(rewardSetup)) {
                            // We check if the reward counter is at zero because then we should not update as it enables
                            // the reward while it could have been disabled by profiles.
                            // To update settings for the base reward, we update it as any normal reward, using !update.
                            const current = await Settings.pullSetting<IEventCounter>(Settings.EVENT_COUNTERS_ACCUMULATING, 'key', key)
                            if((current?.count ?? 0) > 0) {
                                Utils.log(`Resetting accumulating reward: ${key}`, Color.Green)
                                const reset: IEventCounter = {key: key, count: 0}
                                await Settings.pushSetting(Settings.EVENT_COUNTERS_ACCUMULATING, 'key', reset)
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
                })).then()
            }
        },

        // endregion

        // region System
        'ReloadWidget': {
            tag: 'ReloadWidget',
            description: 'Reloads the page for widget.',
            call: (user) => {
                window.location.reload()
            }
        },

        'ChannelTrophyStats': {
            tag: 'ChannelTrophyStats',
            description: 'Posts the last Channel Trophy stats to Discord.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const speech = Config.controller.speechReferences['ChannelTrophyStats'] ?? []
                const numberOfStreams = await ChannelTrophy.getNumberOfStreams()
                const streamNumber = Utils.toInt(user.input)
                if(user.input == "all") {
                    modules.tts.enqueueSpeakSentence(speech[0]).then()
                    for(let i=0; i<numberOfStreams; i++) {
                        const embeds = await ChannelTrophy.createStatisticsEmbedsForDiscord(modules.twitchHelix, i)
                        Discord.enqueuePayload(Config.credentials.DiscordWebhooks['ChannelTrophyStats'] ?? '', {
                            content: Utils.numberToDiscordEmote(i+1, true),
                            embeds: embeds
                        })
                    }
                    modules.tts.enqueueSpeakSentence(speech[1]).then()
                } else if (!isNaN(streamNumber)) {
                    modules.tts.enqueueSpeakSentence(speech[2]).then()
                    const embeds = await ChannelTrophy.createStatisticsEmbedsForDiscord(modules.twitchHelix, streamNumber-1)
                    Discord.enqueuePayload(Config.credentials.DiscordWebhooks['ChannelTrophyStats'] ?? '', {
                        content: Utils.numberToDiscordEmote(streamNumber, true),
                        embeds: embeds
                    }, (success) => {
                        modules.tts.enqueueSpeakSentence(speech[success ? 3 : 4])
                    })

                } else {
                    modules.tts.enqueueSpeakSentence(speech[2]).then()
                    const embeds = await ChannelTrophy.createStatisticsEmbedsForDiscord(modules.twitchHelix)
                    Discord.enqueuePayload(Config.credentials.DiscordWebhooks['ChannelTrophyStats'] ?? '', {
                        content: Utils.numberToDiscordEmote(numberOfStreams, true),
                        embeds: embeds
                    }, (success) => {
                        modules.tts.enqueueSpeakSentence(speech[success ? 3 : 4])
                    })
                }
            }
        },

        'GameReset': {
            tag: 'GameReset',
            description: 'Resets the currently detected game and trigger the app ID callback.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                modules.tts.enqueueSpeakSentence(Config.controller.speechReferences['GameReset'] ?? '').then()
                Functions.appIdCallback('', false).then()
                states.lastSteamAppId = undefined
                states.lastSteamAppIsVR = false
            }
        },

        'RemoteOn': {
            tag: 'RemoteOn',
            description: 'Enables remote commands.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.runRemoteCommands = true
                const speech = Utils.ensureValue(Config.controller.speechReferences['RemoteOn']) ?? ''
                modules.tts.enqueueSpeakSentence(
                    await Utils.replaceTagsInText(
                        speech,
                        user
                    ),
                    Config.twitch.chatbotName,
                    ETTSType.Announcement
                ).then()
            }
        },
        'RemoteOff': {
            tag: 'RemoteOff',
            description: 'Disables remote commands.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.runRemoteCommands = false
                const speech = Utils.ensureValue(Config.controller.speechReferences['RemoteOff']) ?? ''
                modules.tts.enqueueSpeakSentence(
                    await Utils.replaceTagsInText(speech, user),
                    Config.twitch.chatbotName,
                    ETTSType.Announcement
                ).then()
            }
        },
        'HelpToDiscord': {
            tag: 'PostHelp',
            description: 'Post help for all commands with documentation to the specified Discord channel.',
            call: async (user) => {
                let messageText = ''
                const url = Config.credentials?.DiscordWebhooks.HelpToDiscord ?? ''
                for(const [key, event] of Object.entries(Config.events) as [TKeys, IEvent][]) {
                    const entries = event.triggers.command?.entries

                    let helpTitle = (event.triggers.command?.helpTitle) ?? ''
                    if(helpTitle.length > 0) {
                        Discord.enqueuePayload(url, {content: messageText})
                        messageText = ''
                        helpTitle = `__${helpTitle}__\n`
                    }

                    let helpInput = (event.triggers.command?.helpInput ?? []).map((input)=>`[${input}]`).join(' ')
                    if(helpInput.length > 0) helpInput = ` ${helpInput}`

                    const helpText = event.triggers.command?.helpText
                    if(entries && helpText) {
                        const text = `${helpTitle}\`!${Utils.ensureArray(entries).join('|')}${helpInput}\` - ${helpText}`
                        if((messageText.length + text.length) > 2000) {
                            Discord.enqueuePayload(url, {content: messageText})
                            messageText = ''
                        }
                        if(messageText.length > 0) messageText += '\n'
                        messageText += text
                    }
                }
                Discord.enqueuePayload(url, {content: messageText})
            }
        },
        'HelpToChat': {
            tag: 'GetHelp',
            description: 'Post help for a single command to chat.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const command = user.input.toLowerCase()
                const event = (Object.values(Config.events) as IEvent[])
                    .find((event)=>Utils.ensureArray(event.triggers.command?.entries).includes(command))
                if(event && event.triggers.command?.helpText) {
                    let helpInput = (event.triggers.command?.helpInput ?? []).map((input)=>`[${input}]`).join(' ')
                    if(helpInput.length > 0) helpInput = ` ${helpInput}`
                    modules.twitch._twitchChatOut.sendMessageToChannel(`!${user.input.toLowerCase()}${helpInput} - ${event.triggers.command?.helpText}`)
                } else {
                    modules.twitch._twitchChatOut.sendMessageToChannel(`${user.input.toLowerCase()} - is not a command.`)
                }
            }
        },
        // endregion

        // region Twitch
        'Clips': {
            tag: 'Clips',
            description: 'Posts new channel clips to Discord.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const pageCount = 20
                let lastCount = pageCount
                const oldClips = await Settings.getFullSettings<ITwitchClip>(Settings.TWITCH_CLIPS)
                const speech = Config.controller.speechReferences['Clips'] ?? []
                modules.tts.enqueueSpeakSentence(speech[0]).then()

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
                ).then()

                // Post to Discord
                let count = oldClipIds.length+1
                for(const clip of sortedClips) {
                    let user = await modules.twitchHelix.getUserById(parseInt(clip.creator_id))
                    let game = await modules.twitchHelix.getGameById(parseInt(clip.game_id))
                    Discord.enqueuePayload(Config.credentials.DiscordWebhooks['Clips'] ?? '', {
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
                ).then()
            }
        },

        'Raid': {
            tag: 'Raid',
            description: 'Initiates a raid for the supplied target.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                let channel =
                    Utils.getFirstUserTagInText(user.input)
                    ?? user.input.split(' ').shift()
                    ?? ''
                if(channel.includes('https://')) channel = channel.split('/').pop() ?? ''
                Utils.log(`Command Raid: ${user.input} -> ${channel}`, Color.Blue, true, true)
                const channelData = await modules.twitchHelix.getChannelByName(channel)
                const chat = Config.controller.chatReferences['Raid']
                if(channelData) {
                    modules.twitchHelix.raidChannel(channelData.broadcaster_id).then()
                    if(chat) {
                        if(chat[0] && chat[0].length > 0) modules.twitch._twitchChatOut.sendMessageToChannel(await Utils.replaceTagsInText(chat[0], user))
                        if(chat[1] && chat[1].length > 0) modules.twitch._twitchChatOut.sendMessageToChannel(await Utils.replaceTagsInText(chat[1], user))
                    }
                } else {
                    if(chat && chat.length >= 3) modules.twitch._twitchChatOut.sendMessageToChannel(await Utils.replaceTagsInText(chat[2], user))
                }
            }
        },

        'Unraid': {
            tag: 'Unraid',
            description: 'Cancels the currently active raid.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const result = await modules.twitchHelix.cancelRaid()
                const chat = Config.controller.chatReferences['Unraid']
                if(chat) {
                    if(result) modules.twitch._twitchChatOut.sendMessageToChannel(chat[0])
                    else modules.twitch._twitchChatOut.sendMessageToChannel(chat[1])
                }
            }
        },
        // endregion
    }
}