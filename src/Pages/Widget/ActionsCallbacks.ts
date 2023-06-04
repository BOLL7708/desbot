import {IActionsCallbackStack, IActionUser} from '../../Interfaces/iactions.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
import StatesSingleton from '../../Singletons/StatesSingleton.js'
import Config from '../../Classes/Config.js'
import Functions from './Functions.js'
import Utils from '../../Classes/Utils.js'
import SteamStoreHelper from '../../Classes/SteamStoreHelper.js'
import Color from '../../Classes/ColorConstants.js'
import {ETTSType} from './Enums.js'
import OpenVR2WS from '../../Classes/OpenVR2WS.js'
import {EBehavior, IEvent} from '../../Interfaces/ievents.js'
import ChannelTrophyUtils from '../../Classes/ChannelTrophyUtils.js'
import DiscordUtils from '../../Classes/DiscordUtils.js'
import {ITwitchHelixClipResponseData} from '../../Interfaces/itwitch_helix.js'
import TwitchHelixHelper from '../../Classes/TwitchHelixHelper.js'
import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import DataUtils from '../../Classes/DataUtils.js'
import {TKeys} from '../../_data/!keys.js'
import {SettingTwitchClip, SettingTwitchRedemption, SettingTwitchTokens} from '../../Objects/Setting/Twitch.js'
import {SettingStreamQuote} from '../../Objects/Setting/Stream.js'
import {SettingAccumulatingCounter, SettingIncrementingCounter} from '../../Objects/Setting/Counters.js'
import {SettingChannelTrophyStat} from '../../Objects/Setting/Channel.js'
import TextHelper from '../../Classes/TextHelper.js'
import LegacyUtils from '../../Classes/LegacyUtils.js'
import {EnumSystemActionType} from '../../Enums/SystemActionType.js'
import {ConfigController} from '../../Objects/Config/Controller.js'
import {PresetSystemActionText} from '../../Objects/Preset/SystemActionText.js'

export default class ActionsCallbacks {
    public static stack: IActionsCallbackStack = {
        // region Chat
        [EnumSystemActionType.Chat]: {
            tag: 'Chat',
            description: 'Sends a message to the chat overlay in VR.',
            call: (user) => {
                const modules = ModulesSingleton.getInstance()
                modules.pipe.sendBasic(user.input)
            }
        },
        [EnumSystemActionType.ChatOn]: {
            tag: 'Chat On',
            description: 'Enables the chat overlay in VR.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.pipeAllChat = true
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), EnumSystemActionType.ChatOn.valueOf().toString())
                const speech = textPreset?.data?.speech[0] ?? ''
                modules.tts.enqueueSpeakSentence(speech).then()
            }
        },
        [EnumSystemActionType.ChatOff]: {
            tag: 'Chat Off',
            description: 'Disables the chat overlay in VR.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.pipeAllChat = false
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), EnumSystemActionType.ChatOff.valueOf().toString())
                const speech = textPreset?.data?.speech[0] ?? ''
                modules.tts.enqueueSpeakSentence(speech).then()
            }
        },
        [EnumSystemActionType.PingOn]: {
            tag: 'Ping On',
            description: 'Enables a sound effect for chat messages if TTS is off or messages are empty.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.pingForChat = true
                Functions.setEmptySoundForTTS()
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), EnumSystemActionType.PingOn.valueOf().toString())
                const speech = textPreset?.data?.speech[0] ?? ''
                modules.tts.enqueueSpeakSentence(speech).then()
            }
        },
        [EnumSystemActionType.PingOff]: {
            tag: 'Ping Off',
            description: 'Disables the sound effect for chat messages.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.pingForChat = false
                Functions.setEmptySoundForTTS()
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), EnumSystemActionType.PingOff.valueOf().toString())
                const speech = textPreset?.data?.speech[0] ?? ''
                modules.tts.enqueueSpeakSentence(speech).then()
            }
        },
        // endregion

        // region Channel
        [EnumSystemActionType.Mod]: {
            tag: 'Add mod',
            description: 'Make a user channel moderator',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const result = await TwitchHelixHelper.makeUserModerator(parseInt(await TextHelper.replaceTagsInText('%targetId', user)))
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), EnumSystemActionType.Mod.valueOf().toString())
                const speechArr = textPreset?.data?.speech ?? []
                if(Array.isArray(speechArr)) {
                    const speech = result ? speechArr[0] : speechArr[1]
                    modules.tts.enqueueSpeakSentence(await TextHelper.replaceTagsInText(speech, user)).then()
                }
            }
        },
        [EnumSystemActionType.UnMod]: {
            tag: 'Remove mod',
            description: 'Remove user from channel moderators',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const result = await TwitchHelixHelper.removeUserModerator(parseInt(await TextHelper.replaceTagsInText('%targetId', user)))
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), EnumSystemActionType.UnMod.valueOf().toString())
                const speechArr = textPreset?.data?.speech ?? []
                if(Array.isArray(speechArr)) {
                    const speech = result ? speechArr[0] : speechArr[1]
                    modules.tts.enqueueSpeakSentence(await TextHelper.replaceTagsInText(speech, user)).then()
                }
            }
        },
        [EnumSystemActionType.Vip]: {
            tag: 'Add VIP',
            description: 'Make a user channel VIP',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const result = await TwitchHelixHelper.makeUserVIP(parseInt(await TextHelper.replaceTagsInText('%targetId', user)))
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), EnumSystemActionType.Vip.valueOf().toString())
                const speechArr = textPreset?.data?.speech ?? []
                if(Array.isArray(speechArr)) {
                    const speech = result ? speechArr[0] : speechArr[1]
                    modules.tts.enqueueSpeakSentence(await TextHelper.replaceTagsInText(speech, user)).then()
                }
            }
        },
        [EnumSystemActionType.UnVip]: {
            tag: 'Remove VIP',
            description: 'Remove user from channel VIPs',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const result = await TwitchHelixHelper.removeUserVIP(parseInt(await TextHelper.replaceTagsInText('%targetId', user)))
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), EnumSystemActionType.UnVip.valueOf().toString())
                const speechArr = textPreset?.data?.speech ?? []
                if(Array.isArray(speechArr)) {
                    const speech = result ? speechArr[0] : speechArr[1]
                    modules.tts.enqueueSpeakSentence(await TextHelper.replaceTagsInText(speech, user)).then()
                }
            }
        },
        // endregion

        [EnumSystemActionType.Quote]: {
            tag: 'Quote',
            description: 'Stores a new quote or posts a random quote to chat.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                let [possibleUserTag, quote] = Utils.splitOnFirst(' ', user.input)
                if(user.input.length > 0 && (possibleUserTag.length > 0 || quote.length > 0)) {
                    // Get login or use channel name
                    const isTag = possibleUserTag.includes('@')
                    const channelTokens = await DataBaseHelper.load(new SettingTwitchTokens(), 'Channel')
                    const userLogin = isTag
                        ? TextHelper.cleanUserName(possibleUserTag)
                        : channelTokens?.userLogin ?? ''
                    const userData = await TwitchHelixHelper.getUserByLogin(userLogin)
                    if(!isTag) {
                        quote = user.input // Use the full input
                        user.input = `@${userLogin} ${user.input}` // To make text tags work.
                    }
                    const gameData = await SteamStoreHelper.getGameMeta(states.lastSteamAppId?.toString() ?? '')

                    // Save quote to settings
                    if(userData) {
                        const quoteSetting = new SettingStreamQuote()
                        quoteSetting.quote = quote
                        quoteSetting.quoterUserId = user.id
                        quoteSetting.quoteeUserId = parseInt(userData?.id ?? '')
                        quoteSetting.datetime = Utils.getISOTimestamp()
                        quoteSetting.game = gameData?.name ?? ''
                        await DataBaseHelper.save(quoteSetting)
                        const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), EnumSystemActionType.Quote.valueOf().toString())
                        const speech = textPreset?.data?.speech[0] ?? ''
                        modules.tts.enqueueSpeakSentence(
                            await TextHelper.replaceTagsInText(
                                <string> speech,
                                user,
                                {quote: quote}
                            )
                        ).then()
                    } else Utils.log(`Could not find user: ${possibleUserTag}`, Color.Red)
                } else {
                    // Grab quote and write it in chat.
                    const quotes = await DataBaseHelper.loadAll(new SettingStreamQuote()) ?? {}
                    const quote = Utils.randomFromArray(Object.values(quotes))
                    if(quote) {
                        const date = new Date(quote.datetime)
                        const userData = await TwitchHelixHelper.getUserById(quote.quoteeUserId)
                        const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), EnumSystemActionType.Quote.valueOf().toString())
                        const speech = textPreset?.data?.speech[0] ?? ''
                        modules.twitch._twitchChatOut.sendMessageToChannel(
                            await TextHelper.replaceTagsInText(
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
        [EnumSystemActionType.LogOn]: {
            tag: 'Log On',
            description: 'Enables logging of chat to Discord.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.logChatToDiscord = true
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), EnumSystemActionType.LogOn.valueOf().toString())
                const speech = textPreset?.data?.speech[0] ?? ''
                modules.tts.enqueueSpeakSentence(speech).then()
            }
        },
        [EnumSystemActionType.LogOff]: {
            tag: 'Log Off',
            description: 'Disables logging of chat to Discord.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.logChatToDiscord = false
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), EnumSystemActionType.LogOff.valueOf().toString())
                const speech = textPreset?.data?.speech[0] ?? ''
                modules.tts.enqueueSpeakSentence(speech).then()
            }
        },
        // endregion

        // region Scale
        [EnumSystemActionType.Scale]: {
            tag: 'Scale',
            description: 'Changes the world scale of the currently running VR game.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                const parts = user.input.split(' ')
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), EnumSystemActionType.Scale.valueOf().toString())
                const speechArr = textPreset?.data?.speech ?? []
                const fileName = 'word_scale_label.txt'
                if(parts.length == 3) {
                    const fromScale = parseInt(parts[0])
                    const toScale = parseInt(parts[1])
                    const forMinutes = parseInt(parts[2])
                    const intervalMs = 10000 // 10s
                    const steps = forMinutes*60*1000/intervalMs
                    const chatbotTokens = await DataBaseHelper.load(new SettingTwitchTokens(), 'Chatbot')
                    if(isNaN(fromScale) || isNaN(toScale) || isNaN(forMinutes)) {
                        // Fail to start interval
                        modules.tts.enqueueSpeakSentence(
                            speechArr[3],
                            chatbotTokens?.userId,
                            ETTSType.Announcement
                        ).then()
                    } else {
                        // TODO: Disable all scale rewards
                        // Launch interval
                        modules.tts.enqueueSpeakSentence(
                            await TextHelper.replaceTagsInText(
                                speechArr[1],
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
                                const fileName = 'word_scale_label.txt'
                                modules.openvr2ws.setSetting({
                                    setting: OpenVR2WS.SETTING_WORLD_SCALE,
                                    value: currentScale/100.0
                                })
                                DataUtils.writeText(fileName, `🌍 ${Math.round(currentScale*100)/100}%`)
                                currentScale *= multiple
                                if(currentStep == steps) {
                                    modules.tts.enqueueSpeakSentence(speechArr[2])
                                    clearInterval(states.scaleIntervalHandle)
                                    setTimeout(async ()=>{
                                        await DataUtils.writeText(fileName, '')
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
                        clearInterval(states.scaleIntervalHandle)
                        states.scaleIntervalHandle = -1
                        await DataUtils.writeText(fileName, '')
                        modules.tts.enqueueSpeakSentence(speechArr[4]).then()
                    }
                    const value = Math.max(10, Math.min(1000, scale || 100))
                    modules.tts.enqueueSpeakSentence(
                        await TextHelper.replaceTagsInText(
                            speechArr[0],
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
        [EnumSystemActionType.Brightness]: {
            tag: 'Brightness',
            description: 'Changes the display brightness of the headset.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const brightness = Utils.toInt(user.input, 130)
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), EnumSystemActionType.Brightness.valueOf().toString())
                const speech = textPreset?.data?.speech[0] ?? ''
                const value = Math.max(0, Math.min(160, brightness)) // TODO: There are properties in SteamVR to read out for safe min/max values or if available at all! https://github.com/ValveSoftware/openvr/blob/4c85abcb7f7f1f02adaf3812018c99fc593bc341/headers/openvr.h#L475
                modules.tts.enqueueSpeakSentence(TextHelper.replaceTags(speech, {value: value.toString()})).then()
                modules.openvr2ws.setSetting({
                    setting: OpenVR2WS.SETTING_ANALOG_GAIN,
                    value: value/100.0
                }).then()
            }
        },

        // TODO: WIP - Should only work with what the headset supports
        [EnumSystemActionType.RefreshRate]: {
            tag: 'RefreshRate',
            description: 'Changes the display refresh rate of the headset.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const validRefreshRates = [80, 90, 120, 144] // TODO: Load from OpenVR2WS so we don't set unsupported frame-rates as it breaks the headset.
                const possibleRefreshRate = Utils.toInt(user.input, 120)
                const refreshRate = (validRefreshRates.indexOf(possibleRefreshRate) != -1) ? possibleRefreshRate : 120
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), EnumSystemActionType.RefreshRate.valueOf().toString())
                const speech = textPreset?.data?.speech[0] ?? ''
                const value = Math.max(0, Math.min(160, refreshRate)) // TODO: Are there also properties for supported frame-rates?! https://github.com/ValveSoftware/openvr/blob/4c85abcb7f7f1f02adaf3812018c99fc593bc341/headers/openvr.h#L470
                modules.tts.enqueueSpeakSentence(TextHelper.replaceTags(speech, {value: value.toString()})).then()
                modules.openvr2ws.setSetting({
                    setting: OpenVR2WS.SETTING_PREFERRED_REFRESH_RATE,
                    value: value
                }).then()
            }
        },

        // Currently not actually effective due to how the VR View does not listen to config changes
        [EnumSystemActionType.VrViewEye]: {
            tag: 'VRViewEye',
            description: 'Changes the eye used for the VR View. Or would if it updated live.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const eyeMode = Utils.toInt(user.input, 4)
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), EnumSystemActionType.VrViewEye.valueOf().toString())
                const speech = textPreset?.data?.speech[0] ?? ''
                const value = Math.max(0, Math.min(5, eyeMode))
                modules.tts.enqueueSpeakSentence(TextHelper.replaceTags(speech, {value: value.toString()})).then()
                modules.openvr2ws.setSetting({
                    setting: OpenVR2WS.SETTING_MIRROR_VIEW_EYE,
                    value: value
                }).then()
            }
        },
        // endregion

        // region Rewards
        [EnumSystemActionType.UpdateRewards]: {
            tag: 'UpdateRewards',
            description: 'Update the properties of the channel rewards managed by the widget.',
            call: async (user) => {
                const storedRewards = await LegacyUtils.getRewardPairs()
                for(const pair of storedRewards) {
                    user.eventKey = pair.key
                    const eventConfig = Utils.getEventConfig(pair.key)
                    const rewardSetup = eventConfig?.triggers?.reward
                    const config = Array.isArray(rewardSetup) ? rewardSetup[0] : rewardSetup
                    if(config != undefined && eventConfig?.options?.rewardIgnoreUpdateCommand !== true) {
                        const configClone = Utils.clone(config)
                        configClone.title = await TextHelper.replaceTagsInText(configClone.title, user)
                        configClone.prompt = await TextHelper.replaceTagsInText(configClone.prompt, user)
                        const response = await TwitchHelixHelper.updateReward(pair.id, configClone)
                        if(response != null && response.data != null) {
                            const success = response?.data[0]?.id == pair.id
                            Utils.logWithBold(`Reward <${pair.key}> updated: <${success?'YES':'NO'}>`, success ? Color.Green : Color.Red)

                            // If update was successful, also reset incremental setting as the reward should have been reset.
                            if(Array.isArray(rewardSetup)) {
                                const reset = new SettingIncrementingCounter()
                                await DataBaseHelper.save(reset, pair.key)
                            }
                            // TODO: Also reset accumulating counters here?!
                        } else {
                            Utils.logWithBold(`Reward <${pair.key}> update unsuccessful.`, Color.Red)
                        }
                    } else {
                        Utils.logWithBold(`Reward <${pair.key}> update skipped or unavailable.`, Color.Purple)
                    }
                }
            }
        },

        [EnumSystemActionType.GameRewardsOn]: {
            tag: 'GameRewardsOn',
            description: 'Enable the channel rewards that are game specific.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.useGameSpecificRewards = true
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), EnumSystemActionType.GameRewardsOn.valueOf().toString())
                const speech = textPreset?.data?.speech[0] ?? ''
                modules.tts.enqueueSpeakSentence(speech).then()
                Functions.appIdCallback(states.lastSteamAppId ?? '', StatesSingleton.getInstance().lastSteamAppIsVR).then()
            }
        },
        [EnumSystemActionType.GameRewardsOff]: {
            tag: 'GameRewardsOff',
            description: 'Disable the channel rewards that are game specific.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.useGameSpecificRewards = false
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), EnumSystemActionType.GameRewardsOff.valueOf().toString())
                const speech = textPreset?.data?.speech[0] ?? ''
                modules.tts.enqueueSpeakSentence(speech).then()
                Functions.appIdCallback('', false).then()
            }
        },
        [EnumSystemActionType.RefundRedemption]: {
            tag: 'RefundRedemption',
            description: 'Refund the last registered redemption for a user.',
            call: async (user) => {
                // TODO: Still broken, appears we're not getting new redemptions to register.
                const modules = ModulesSingleton.getInstance()
                const redemptions = await DataBaseHelper.loadAll(new SettingTwitchRedemption())
                const userName = TextHelper.getFirstUserTagInText(user.input)
                if(!userName) return
                const userTag = `@${userName}`
                const userData = await TwitchHelixHelper.getUserByLogin(userName)
                const userRedemptions = Object.fromEntries(Object.entries(redemptions ?? {}).filter(
                    row => (row[1].userId.toString() == userData?.id ?? '') && (row[1].status.toLowerCase() == 'unfulfilled')
                ))
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), EnumSystemActionType.RefundRedemption.valueOf().toString())
                const chatArr = textPreset?.data?.chat ?? []
                console.log('REFUND', userName, userTag, userData, userRedemptions, redemptions )
                if(userRedemptions && Object.keys(userRedemptions).length > 0) {
                    const [lastRedemptionId, lastRedemption] = Object.entries(userRedemptions).reduce(
                        (prevRow, currentRow) => (Date.parse(prevRow[1].time) > Date.parse(currentRow[1].time)) ? prevRow : currentRow
                    )
                    console.log('REFUND', lastRedemptionId, lastRedemption)
                    if(lastRedemption) {
                        lastRedemption.status = 'CANCELED'
                        const result = await TwitchHelixHelper.updateRedemption(lastRedemptionId, lastRedemption)
                        console.log('REFUND', result)
                        if(result) {
                            await DataBaseHelper.save(lastRedemption, lastRedemptionId)
                            modules.twitch._twitchChatOut.sendMessageToChannel(await TextHelper.replaceTags( chatArr[0], {targetTag: userTag, cost: lastRedemption.cost.toString()}))
                        } else {
                            modules.twitch._twitchChatOut.sendMessageToChannel(await TextHelper.replaceTags( chatArr[1], {targetTag: userTag}))
                        }
                    } else modules.twitch._twitchChatOut.sendMessageToChannel(await TextHelper.replaceTags( chatArr[2], {targetTag: userTag}))
                } else modules.twitch._twitchChatOut.sendMessageToChannel(await TextHelper.replaceTags( chatArr[2], {targetTag: userTag}))
            }
        },
        [EnumSystemActionType.ClearRedemptions]: {
            tag: 'ClearRedemptions',
            description: 'Clear redemptions from the queue for the channel, except ignored ones.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const redemptions = await DataBaseHelper.loadAll(new SettingTwitchRedemption()) ?? {}
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), EnumSystemActionType.ClearRedemptions.valueOf().toString())
                const speechArr = textPreset?.data?.speech ?? []
                modules.tts.enqueueSpeakSentence(speechArr[0]).then()
                let totalClearable = 0
                let totalCleared = 0
                for(const [key, redemption] of Object.entries(redemptions)) {
                    if(redemption.status.toLowerCase() == 'unfulfilled') {
                        totalClearable++
                        const redemptionClone = Utils.clone(redemption)
                        redemptionClone.status = 'FULFILLED'
                        const result = await TwitchHelixHelper.updateRedemption(key, redemptionClone)
                        if(result) {
                            await DataBaseHelper.delete(new SettingTwitchRedemption(), key)
                            totalCleared++
                        } else if (result === null) { // Not found, so should be deleted.
                            await DataBaseHelper.delete(new SettingTwitchRedemption(), key)
                        }
                    } else {
                        // It has a good state already, clear from list.
                        await DataBaseHelper.delete(new SettingTwitchRedemption(), key)
                    }
                }

                if(totalClearable) {
                    modules.tts.enqueueSpeakSentence(
                        TextHelper.replaceTags(
                            speechArr[1],
                            {total: totalClearable.toString(), count: totalCleared.toString()}
                        )
                    ).then()
                }
                else modules.tts.enqueueSpeakSentence(speechArr[2]).then()
            }
        },

        [EnumSystemActionType.ChannelTrophy]: {
            tag: 'ChannelTrophy',
            description: 'A user grabbed the Channel Trophy.',
            call: async (user: IActionUser) => {
                const modules = ModulesSingleton.getInstance()
                const controllerConfig = await DataBaseHelper.loadMain(new ConfigController())

                // Save stat
                const cost = user.rewardMessage?.reward.cost ?? 0
                const setting = new SettingChannelTrophyStat()
                setting.userId = user.id

                // TODO: This is not available in EventSub
                setting.index = 0 //  user.rewardMessage?.data?.redemption.reward.redemptions_redeemed_current_stream

                const settingsUpdated = await DataBaseHelper.save(setting, cost.toString())
                if(!settingsUpdated) return Utils.log('ChannelTrophy: Could not write settings reward', Color.Red)

                const userData = await TwitchHelixHelper.getUserById(user.id)
                if(userData == undefined) return Utils.log('ChannelTrophy: Could not retrieve user for reward', Color.Red)

                // Update reward
                const rewardId = await LegacyUtils.getRewardId('ChannelTrophy')
                const rewardData = await TwitchHelixHelper.getReward(rewardId ?? '')
                if(rewardData?.data?.length == 1) { // We only loaded one reward, so this should be 1
                    const cost = rewardData.data[0].cost

                    // Do TTS
                    const funnyNumberConfig = await ChannelTrophyUtils.detectFunnyNumber(cost)
                    if(funnyNumberConfig != null && controllerConfig.channelTrophySettings.ttsOn) {
                        modules.tts.enqueueSpeakSentence(
                            await TextHelper.replaceTagsInText(
                                funnyNumberConfig.speech,
                                user
                            )
                        ).then()
                    }
                    // Update label in overlay
                    const labelUpdated = await DataUtils.writeText(
                        'trophy_label.txt', // TODO: Save as a constant or something?
                        await TextHelper.replaceTagsInText(
                            controllerConfig.channelTrophySettings.label,
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
                        const updatedReward = await TwitchHelixHelper.updateReward(rewardId, {
                            title: await TextHelper.replaceTagsInText(
                                controllerConfig.channelTrophySettings.rewardTitle,
                                user
                            ),
                            cost: newCost,
                            is_global_cooldown_enabled: true,
                            global_cooldown_seconds: (config.global_cooldown_seconds ?? 30) + Math.round(Math.log(newCost)*controllerConfig.channelTrophySettings.rewardCooldownMultiplier),
                            prompt: await TextHelper.replaceTagsInText(
                                controllerConfig.channelTrophySettings.rewardPrompt,
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
        [EnumSystemActionType.ResetIncrementingEvents]: {
            tag: 'ResetIncrementalReward',
            description: 'Reset the incremental reward counter for those rewards, unless ignored.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), EnumSystemActionType.ResetIncrementingEvents.valueOf().toString())
                const speechArr = textPreset?.data?.speech ?? []
                modules.tts.enqueueSpeakSentence(speechArr[0]).then()
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
                            // To update settings for the widget reward, we update it as any normal reward, using !update.
                            const current = await DataBaseHelper.load(new SettingIncrementingCounter(), key)
                            if((current?.count ?? 0) > 0) {
                                Utils.log(`Resetting incrementing reward: ${key}`, Color.Green)
                                const reset = new SettingIncrementingCounter()
                                await DataBaseHelper.save(reset, key)
                                await TwitchHelixHelper.updateReward(await LegacyUtils.getRewardId(key), rewardSetup[0])
                                totalResetCount++
                            } else {
                                totalSkippedCount++
                            }
                        }
                    }
                }
                modules.tts.enqueueSpeakSentence(TextHelper.replaceTags(speechArr[1], {
                    total: totalCount.toString(),
                    reset: totalResetCount.toString(),
                    skipped: totalSkippedCount.toString()
                })).then()
            }
        },
        [EnumSystemActionType.ResetAccumulatingEvents]: {
            tag: 'ResetAccumulatingReward',
            description: 'Reset the accumulating reward counter for those rewards, unless ignored.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), EnumSystemActionType.ResetAccumulatingEvents.valueOf().toString())
                const speechArr = textPreset?.data?.speech ?? []
                modules.tts.enqueueSpeakSentence(speechArr[0]).then()
                // Reset rewards with multiple steps
                const allRewardKeys = Utils.getAllEventKeys(true)
                let totalCount = 0
                let totalResetCount = 0
                let totalSkippedCount = 0
                for(const key of allRewardKeys) {
                    const eventConfig = Utils.getEventConfig(key)
                    if(
                        eventConfig?.options?.behavior === EBehavior.Accumulating
                    ) {
                        totalCount++
                        if(eventConfig?.options?.resetAccumulationOnCommand === true) {
                            const rewardSetup = eventConfig?.triggers?.reward
                            if(Array.isArray(rewardSetup)) {
                                // We check if the reward counter is at zero because then we should not update as it enables
                                // the reward while it could have been disabled by profiles.
                                // To update settings for the widget reward, we update it as any normal reward, using !update.
                                const current = await DataBaseHelper.load(new SettingAccumulatingCounter(), key)
                                if((current?.count ?? 0) > 0) {
                                    Utils.log(`Resetting accumulating reward: ${key}`, Color.Green)
                                    const reset = new SettingAccumulatingCounter()
                                    await DataBaseHelper.save(reset, key)
                                    const setup = Utils.clone(rewardSetup[0])
                                    user.rewardCost = setup.cost ?? 0
                                    user.eventKey = key
                                    setup.title = await TextHelper.replaceTagsInText(setup.title, user)
                                    setup.prompt = await TextHelper.replaceTagsInText(setup.prompt, user)
                                    await TwitchHelixHelper.updateReward(await LegacyUtils.getRewardId(key), setup)
                                    totalResetCount++
                                } else {
                                    totalSkippedCount++
                                }
                            }
                        }
                    }
                }
                modules.tts.enqueueSpeakSentence(TextHelper.replaceTags(speechArr[1], {
                    total: totalCount.toString(),
                    reset: totalResetCount.toString(),
                    skipped: totalSkippedCount.toString()
                })).then()
            }
        },

        // endregion

        // region System
        [EnumSystemActionType.ReloadWidget]: {
            tag: 'ReloadWidget',
            description: 'Reloads the page for widget.',
            call: (user) => {
                Utils.reload()
            }
        },

        [EnumSystemActionType.ChannelTrophyStats]: {
            tag: 'ChannelTrophyStats',
            description: 'Posts the last Channel Trophy stats to DiscordUtils.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), EnumSystemActionType.ChannelTrophyStats.valueOf().toString())
                const speechArr = textPreset?.data?.speech ?? []
                const numberOfStreams = await ChannelTrophyUtils.getNumberOfStreams()
                const streamNumber = Utils.toInt(user.input)
                const controllerConfig = await DataBaseHelper.loadMain(new ConfigController())
                const webhook = Utils.ensureObjectNotId(controllerConfig.channelTrophySettings.discordStatistics)
                if(user.input == "all") {
                    modules.tts.enqueueSpeakSentence(speechArr[0]).then()
                    for(let i=0; i<numberOfStreams; i++) {
                        const embeds = await ChannelTrophyUtils.createStatisticsEmbedsForDiscord(TwitchHelixHelper, i)
                        DiscordUtils.enqueuePayload(webhook?.url ?? '', {
                            content: Utils.numberToDiscordEmote(i+1, true),
                            embeds: embeds
                        })
                    }
                    modules.tts.enqueueSpeakSentence(speechArr[1]).then()
                } else if (!isNaN(streamNumber)) {
                    modules.tts.enqueueSpeakSentence(speechArr[2]).then()
                    const embeds = await ChannelTrophyUtils.createStatisticsEmbedsForDiscord(TwitchHelixHelper, streamNumber-1)
                    DiscordUtils.enqueuePayload(webhook?.url ?? '', {
                        content: Utils.numberToDiscordEmote(streamNumber, true),
                        embeds: embeds
                    }, (success) => {
                        modules.tts.enqueueSpeakSentence(speechArr[success ? 3 : 4])
                    })

                } else {
                    modules.tts.enqueueSpeakSentence(speechArr[2]).then()
                    const embeds = await ChannelTrophyUtils.createStatisticsEmbedsForDiscord(TwitchHelixHelper)
                    DiscordUtils.enqueuePayload(webhook?.url ?? '', {
                        content: Utils.numberToDiscordEmote(numberOfStreams, true),
                        embeds: embeds
                    }, (success) => {
                        modules.tts.enqueueSpeakSentence(speechArr[success ? 3 : 4])
                    })
                }
            }
        },

        [EnumSystemActionType.GameReset]: {
            tag: 'GameReset',
            description: 'Resets the currently detected game and trigger the app ID callback.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), EnumSystemActionType.GameReset.valueOf().toString())
                const speech = textPreset?.data?.speech[0] ?? ''
                modules.tts.enqueueSpeakSentence(speech).then()
                Functions.appIdCallback('', false).then()
                states.lastSteamAppId = undefined
                states.lastSteamAppIsVR = false
            }
        },

        [EnumSystemActionType.RemoteOn]: {
            tag: 'RemoteOn',
            description: 'Enables remote commands.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.runRemoteCommands = true
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), EnumSystemActionType.RemoteOn.valueOf().toString())
                const speech = textPreset?.data?.speech[0] ?? ''
                modules.tts.enqueueSpeakSentence(
                    await TextHelper.replaceTagsInText(
                        speech,
                        user
                    )
                ).then()
            }
        },
        [EnumSystemActionType.RemoteOff]: {
            tag: 'RemoteOff',
            description: 'Disables remote commands.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.runRemoteCommands = false
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), EnumSystemActionType.RemoteOff.valueOf().toString())
                const speech = textPreset?.data?.speech[0] ?? ''
                modules.tts.enqueueSpeakSentence(
                    await TextHelper.replaceTagsInText(speech, user)
                ).then()
            }
        },
        [EnumSystemActionType.HelpToDiscord]: {
            tag: 'PostHelp',
            description: 'Post help for all commands with documentation to the specified Discord channel.',
            call: async (user) => {
                let messageText = ''
                const url = Config.credentials?.DiscordWebhooks.HelpToDiscord ?? ''
                for(const [key, event] of Object.entries(Config.events) as [TKeys, IEvent][]) {
                    const entries = event.triggers.command?.entries

                    let helpTitle = (event.triggers.command?.helpTitle) ?? ''
                    if(helpTitle.length > 0) {
                        DiscordUtils.enqueuePayload(url, {content: messageText})
                        messageText = ''
                        helpTitle = `__${helpTitle}__\n`
                    }

                    let helpInput = (event.triggers.command?.helpInput ?? []).map((input)=>`[${input}]`).join(' ')
                    if(helpInput.length > 0) helpInput = ` ${helpInput}`

                    const helpText = event.triggers.command?.helpText
                    if(entries && helpText) {
                        const text = `${helpTitle}\`!${Utils.ensureArray(entries).join('|')}${helpInput}\` - ${helpText}`
                        if((messageText.length + text.length) > 2000) {
                            DiscordUtils.enqueuePayload(url, {content: messageText})
                            messageText = ''
                        }
                        if(messageText.length > 0) messageText += '\n'
                        messageText += text
                    }
                }
                DiscordUtils.enqueuePayload(url, {content: messageText})
            }
        },
        [EnumSystemActionType.HelpToChat]: {
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
        [EnumSystemActionType.Clips]: {
            tag: 'Clips',
            description: 'Posts new channel clips to Discord.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const pageCount = 20
                let lastCount = pageCount
                const oldClips = await DataBaseHelper.loadAll(new SettingTwitchClip())
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), EnumSystemActionType.Clips.valueOf().toString())
                const speechArr = textPreset?.data?.speech ?? []
                modules.tts.enqueueSpeakSentence(speechArr[0]).then()

                // Get all clips
                const allClips: ITwitchHelixClipResponseData[] = []
                let pagination: string = ''
                let i = 0
                while(i == 0 || (pagination.length > 0)) {
                    const clipsResponse = await TwitchHelixHelper.getClips(pageCount, pagination)
                    allClips.push(...clipsResponse.data)
                    lastCount = clipsResponse.data.length
                    pagination = clipsResponse.pagination?.cursor ?? ''
                    i++
                }
                const oldClipIds = oldClips == undefined ? [] : Object.keys(oldClips)
                const newClips = allClips.filter((clip)=>{
                    return oldClipIds.indexOf(clip.id) == -1
                })
                const sortedClips = newClips.sort((a,b)=>{
                    return Date.parse(a.created_at) - Date.parse(b.created_at)
                })
                modules.tts.enqueueSpeakSentence(
                    await TextHelper.replaceTagsInText(
                        speechArr[1],
                        user,
                        {
                            count1: oldClipIds.length.toString(),
                            count2: newClips.length.toString()
                        }
                    )
                ).then()

                // Post to DiscordUtils
                let count = oldClipIds.length
                for(const clip of sortedClips) {
                    let user = await TwitchHelixHelper.getUserById(parseInt(clip.creator_id))
                    let game = await TwitchHelixHelper.getGameById(parseInt(clip.game_id))
                    DiscordUtils.enqueuePayload(Config.credentials.DiscordWebhooks['Clips'] ?? '', {
                        username: user?.display_name ?? '[Deleted User]',
                        avatar_url: user?.profile_image_url ?? '',
                        content: [
                            Utils.numberToDiscordEmote(++count, true),
                            `**Title**: ${clip.title}`,
                            `**Creator**: ${user?.display_name ?? '[Deleted User]'}`,
                            `**Created**: ${Utils.getDiscordTimetag(clip.created_at)}`,
                            `**Game**: ${game != undefined ? game.name : 'N/A'}`,
                            `**Link**: ${clip.url}`
                        ].join("\n")
                    }, (success)=>{
                        if(success) DataBaseHelper.save(new SettingTwitchClip(), clip.id)
                    })
                }
                modules.tts.enqueueSpeakSentence(
                    await TextHelper.replaceTagsInText(
                        speechArr[2],
                        user,
                        {count: (count-oldClipIds.length).toString()}
                    )
                ).then()
            }
        },

        [EnumSystemActionType.Raid]: {
            tag: 'Raid',
            description: 'Initiates a raid for the supplied target.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                let channel =
                    TextHelper.getFirstUserTagInText(user.input)
                    ?? user.input.split(' ').shift()
                    ?? ''
                if(channel.includes('https://')) channel = channel.split('/').pop() ?? ''
                Utils.log(`Command Raid: ${user.input} -> ${channel}`, Color.Blue, true, true)
                const channelData = await TwitchHelixHelper.getChannelByName(channel)
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), EnumSystemActionType.Raid.valueOf().toString())
                const chatArr = textPreset?.data?.chat ?? []
                if(channelData) {
                    TwitchHelixHelper.raidChannel(channelData.broadcaster_id).then()
                    if(chatArr) {
                        if(chatArr[0] && chatArr[0].length > 0) modules.twitch._twitchChatOut.sendMessageToChannel(await TextHelper.replaceTagsInText(chatArr[0], user))
                        if(chatArr[1] && chatArr[1].length > 0) modules.twitch._twitchChatOut.sendMessageToChannel(await TextHelper.replaceTagsInText(chatArr[1], user))
                    }
                } else {
                    if(chatArr && chatArr.length >= 3) modules.twitch._twitchChatOut.sendMessageToChannel(await TextHelper.replaceTagsInText(chatArr[2], user))
                }
            }
        },

        [EnumSystemActionType.Unraid]: {
            tag: 'Unraid',
            description: 'Cancels the currently active raid.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const result = await TwitchHelixHelper.cancelRaid()
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), EnumSystemActionType.Unraid.valueOf().toString())
                const chatArr = textPreset?.data?.chat ?? []
                if(chatArr) {
                    if(result) modules.twitch._twitchChatOut.sendMessageToChannel(chatArr[0])
                    else modules.twitch._twitchChatOut.sendMessageToChannel(chatArr[1])
                }
            }
        },
        // endregion
    }
}