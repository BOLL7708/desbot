import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
import StatesSingleton from '../../Singletons/StatesSingleton.js'
import Functions from './Functions.js'
import Utils from '../../Classes/Utils.js'
import SteamStoreHelper from '../../Classes/SteamStoreHelper.js'
import Color from '../../Classes/ColorConstants.js'
import ChannelTrophyUtils from '../../Classes/ChannelTrophyUtils.js'
import DiscordUtils from '../../Classes/DiscordUtils.js'
import {ITwitchHelixClipResponseData} from '../../Interfaces/itwitch_helix.js'
import TwitchHelixHelper from '../../Classes/TwitchHelixHelper.js'
import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import DataFileUtils from '../../Classes/DataFileUtils.js'
import {SettingTwitchClip, SettingTwitchRedemption, SettingTwitchTokens} from '../../Objects/Setting/SettingTwitch.js'
import {SettingStreamQuote} from '../../Objects/Setting/SettingStream.js'
import {SettingAccumulatingCounter, SettingIncrementingCounter} from '../../Objects/Setting/SettingCounters.js'
import {SettingChannelTrophyStat} from '../../Objects/Setting/SettingChannel.js'
import TextHelper from '../../Classes/TextHelper.js'
import LegacyUtils from '../../Classes/LegacyUtils.js'
import {OptionSystemActionType} from '../../Options/OptionSystemActionType.js'
import {ConfigController} from '../../Objects/Config/ConfigController.js'
import {PresetSystemActionText} from '../../Objects/Preset/PresetSystemActionText.js'
import {IActionsCallbackStack, IActionUser} from '../../Objects/Action.js'
import {ActionSettingVR} from '../../Objects/Action/ActionSettingVR.js'
import {OptionSteamVRSettingType} from '../../Options/OptionSteamVRSetting.js'
import {EventDefault} from '../../Objects/Event/EventDefault.js'
import {TriggerReward} from '../../Objects/Trigger/TriggerReward.js'
import {PresetReward} from '../../Objects/Preset/PresetReward.js'
import {OptionEventBehavior} from '../../Options/OptionEventBehavior.js'
import ConfigTwitch from '../../Objects/Config/ConfigTwitch.js'
import {TriggerCommand} from '../../Objects/Trigger/TriggerCommand.js'
import ConfigCommands from '../../Objects/Config/ConfigCommands.js'
import EventHelper from '../../Classes/EventHelper.js'
import {OptionsMap} from '../../Options/OptionsMap.js'
import OptionCommandCategory from '../../Options/OptionCommandCategory.js'
import {OptionTTSType} from '../../Options/OptionTTS.js'
import {DataUtils} from '../../Objects/DataUtils.js'

export default class ActionsCallbacks {
    public static stack: IActionsCallbackStack = {
        // region Chat
        [OptionSystemActionType.Chat]: {
            tag: 'Chat',
            description: 'Sends a message to the chat overlay in VR.',
            call: (user) => {
                const modules = ModulesSingleton.getInstance()
                modules.pipe.sendBasic(user.input)
            }
        },
        [OptionSystemActionType.ChatOn]: {
            tag: 'Chat On',
            description: 'Enables the chat overlay in VR.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.pipeAllChat = true
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.ChatOn.valueOf().toString())
                const speech = textPreset?.filledData?.speech[0] ?? ''
                modules.tts.enqueueSpeakSentence(speech).then()
            }
        },
        [OptionSystemActionType.ChatOff]: {
            tag: 'Chat Off',
            description: 'Disables the chat overlay in VR.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.pipeAllChat = false
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.ChatOff.valueOf().toString())
                const speech = textPreset?.filledData?.speech[0] ?? ''
                modules.tts.enqueueSpeakSentence(speech).then()
            }
        },
        [OptionSystemActionType.PingOn]: {
            tag: 'Ping On',
            description: 'Enables a sound effect for chat messages if TTS is off or messages are empty.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.pingForChat = true
                Functions.setEmptySoundForTTS()
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.PingOn.valueOf().toString())
                const speech = textPreset?.filledData?.speech[0] ?? ''
                modules.tts.enqueueSpeakSentence(speech).then()
            }
        },
        [OptionSystemActionType.PingOff]: {
            tag: 'Ping Off',
            description: 'Disables the sound effect for chat messages.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.pingForChat = false
                Functions.setEmptySoundForTTS()
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.PingOff.valueOf().toString())
                const speech = textPreset?.filledData?.speech[0] ?? ''
                modules.tts.enqueueSpeakSentence(speech).then()
            }
        },
        // endregion

        // region Channel
        [OptionSystemActionType.Mod]: {
            tag: 'Add mod',
            description: 'Make a user channel moderator',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const result = await TwitchHelixHelper.makeUserModerator(parseInt(await TextHelper.replaceTagsInText('%targetId', user)))
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.Mod.valueOf().toString())
                const speechArr = textPreset?.filledData?.speech ?? []
                if(Array.isArray(speechArr)) {
                    const speech = result ? speechArr[0] : speechArr[1]
                    modules.tts.enqueueSpeakSentence(await TextHelper.replaceTagsInText(speech, user)).then()
                }
            }
        },
        [OptionSystemActionType.UnMod]: {
            tag: 'Remove mod',
            description: 'Remove user from channel moderators',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const result = await TwitchHelixHelper.removeUserModerator(parseInt(await TextHelper.replaceTagsInText('%targetId', user)))
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.UnMod.valueOf().toString())
                const speechArr = textPreset?.filledData?.speech ?? []
                if(Array.isArray(speechArr)) {
                    const speech = result ? speechArr[0] : speechArr[1]
                    modules.tts.enqueueSpeakSentence(await TextHelper.replaceTagsInText(speech, user)).then()
                }
            }
        },
        [OptionSystemActionType.Vip]: {
            tag: 'Add VIP',
            description: 'Make a user channel VIP',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const result = await TwitchHelixHelper.makeUserVIP(parseInt(await TextHelper.replaceTagsInText('%targetId', user)))
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.Vip.valueOf().toString())
                const speechArr = textPreset?.filledData?.speech ?? []
                if(Array.isArray(speechArr)) {
                    const speech = result ? speechArr[0] : speechArr[1]
                    modules.tts.enqueueSpeakSentence(await TextHelper.replaceTagsInText(speech, user)).then()
                }
            }
        },
        [OptionSystemActionType.UnVip]: {
            tag: 'Remove VIP',
            description: 'Remove user from channel VIPs',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const result = await TwitchHelixHelper.removeUserVIP(parseInt(await TextHelper.replaceTagsInText('%targetId', user)))
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.UnVip.valueOf().toString())
                const speechArr = textPreset?.filledData?.speech ?? []
                if(Array.isArray(speechArr)) {
                    const speech = result ? speechArr[0] : speechArr[1]
                    modules.tts.enqueueSpeakSentence(await TextHelper.replaceTagsInText(speech, user)).then()
                }
            }
        },
        // endregion

        [OptionSystemActionType.Quote]: {
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
                        const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.Quote.valueOf().toString())
                        const speech = textPreset?.filledData?.speech[0] ?? ''
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
                    const quotes = DataUtils.getKeyDataDictionary(await DataBaseHelper.loadAll(new SettingStreamQuote()) ?? {})
                    const quote = Utils.randomFromArray(Object.values(quotes))
                    if(quote) {
                        const date = new Date(quote.datetime)
                        const userData = await TwitchHelixHelper.getUserById(quote.quoteeUserId)
                        const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.Quote.valueOf().toString())
                        const chat = textPreset?.filledData?.chat[0] ?? ''
                        modules.twitch._twitchChatOut.sendMessageToChannel(
                            await TextHelper.replaceTagsInText(
                                chat,
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
        [OptionSystemActionType.LogOn]: {
            tag: 'Log On',
            description: 'Enables logging of chat to Discord.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.logChatToDiscord = true
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.LogOn.valueOf().toString())
                const speech = textPreset?.filledData?.speech[0] ?? ''
                modules.tts.enqueueSpeakSentence(speech).then()
            }
        },
        [OptionSystemActionType.LogOff]: {
            tag: 'Log Off',
            description: 'Disables logging of chat to Discord.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.logChatToDiscord = false
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.LogOff.valueOf().toString())
                const speech = textPreset?.filledData?.speech[0] ?? ''
                modules.tts.enqueueSpeakSentence(speech).then()
            }
        },
        // endregion

        // region Scale
        [OptionSystemActionType.Scale]: {
            tag: 'Scale',
            description: 'Changes the world scale of the currently running VR game.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                const parts = user.input.split(' ')
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.Scale.valueOf().toString())
                const speechArr = textPreset?.filledData?.speech ?? []
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
                            OptionTTSType.Announcement
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
                                const action = new ActionSettingVR()
                                action.settingPreset = OptionSteamVRSettingType.WorldScale
                                action.setToValue = (currentScale/100.0).toString()
                                modules.openvr2ws.setSetting(action).then()
                                DataFileUtils.writeText(fileName, `🌍 ${Math.round(currentScale*100)/100}%`)
                                currentScale *= multiple
                                if(currentStep == steps) {
                                    modules.tts.enqueueSpeakSentence(speechArr[2])
                                    clearInterval(states.scaleIntervalHandle)
                                    setTimeout(async ()=>{
                                        await DataFileUtils.writeText(fileName, '')
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
                        await DataFileUtils.writeText(fileName, '')
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
                    const action = new ActionSettingVR()
                    action.settingPreset = OptionSteamVRSettingType.WorldScale
                    action.setToValue = (value/100.0).toString()
                    modules.openvr2ws.setSetting(action).then()
                }
            }
        },
        // endregion

        // region SteamVR
        // TODO: WIP - Should only work with what the headset supports
        [OptionSystemActionType.Brightness]: {
            tag: 'Brightness',
            description: 'Changes the display brightness of the headset.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const brightness = Utils.toInt(user.input, 130)
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.Brightness.valueOf().toString())
                const speech = textPreset?.filledData?.speech[0] ?? ''
                const value = Math.max(0, Math.min(160, brightness)) // TODO: There are properties in SteamVR to read out for safe min/max values or if available at all! https://github.com/ValveSoftware/openvr/blob/4c85abcb7f7f1f02adaf3812018c99fc593bc341/headers/openvr.h#L475
                modules.tts.enqueueSpeakSentence(TextHelper.replaceTags(speech, {value: value.toString()})).then()
                const action = new ActionSettingVR()
                action.settingPreset = OptionSteamVRSettingType.HMDAnalogGain
                action.setToValue = (value/100.0).toString()
                modules.openvr2ws.setSetting(action).then()
            }
        },

        // TODO: WIP - Should only work with what the headset supports
        [OptionSystemActionType.RefreshRate]: {
            tag: 'RefreshRate',
            description: 'Changes the display refresh rate of the headset.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const validRefreshRates = [80, 90, 120, 144] // TODO: Load from OpenVR2WS so we don't set unsupported frame-rates as it breaks the headset.
                const possibleRefreshRate = Utils.toInt(user.input, 120)
                const refreshRate = (validRefreshRates.indexOf(possibleRefreshRate) != -1) ? possibleRefreshRate : 120
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.RefreshRate.valueOf().toString())
                const speech = textPreset?.filledData?.speech[0] ?? ''
                const value = Math.max(0, Math.min(160, refreshRate)) // TODO: Are there also properties for supported frame-rates?! https://github.com/ValveSoftware/openvr/blob/4c85abcb7f7f1f02adaf3812018c99fc593bc341/headers/openvr.h#L470
                modules.tts.enqueueSpeakSentence(TextHelper.replaceTags(speech, {value: value.toString()})).then()
                const action = new ActionSettingVR()
                action.settingPreset = OptionSteamVRSettingType.HMDRefreshRate
                action.setToValue = value.toString()
                modules.openvr2ws.setSetting(action).then()
            }
        },

        // Currently not actually effective due to how the VR View does not listen to config changes
        [OptionSystemActionType.VrViewEye]: {
            tag: 'VRViewEye',
            description: 'Changes the eye used for the VR View. Or would if it updated live.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const eyeMode = Utils.toInt(user.input, 4)
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.VrViewEye.valueOf().toString())
                const speech = textPreset?.filledData?.speech[0] ?? ''
                const value = Math.max(0, Math.min(5, eyeMode))
                modules.tts.enqueueSpeakSentence(TextHelper.replaceTags(speech, {value: value.toString()})).then()
                const action = new ActionSettingVR()
                action.settingPreset = OptionSteamVRSettingType.MirrorViewEye
                action.setToValue = value.toString()
                modules.openvr2ws.setSetting(action).then()
            }
        },
        // endregion

        // region Rewards
        [OptionSystemActionType.UpdateRewards]: {
            tag: 'UpdateRewards',
            description: 'Update the properties of the channel rewards managed by the widget.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const allEvents = DataUtils.getKeyDataDictionary(await DataBaseHelper.loadAll(new EventDefault()) ?? {})
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.UpdateRewards.valueOf().toString())
                const speechArr = textPreset?.filledData?.speech ?? []
                modules.tts.enqueueSpeakSentence(speechArr[0]).then()
                const result = await TwitchHelixHelper.updateRewards(allEvents)
                modules.tts.enqueueSpeakSentence(TextHelper.replaceTags(speechArr[1], {
                    updated: result.updated.toString(),
                    skipped: result.skipped.toString(),
                    failed: result.failed.toString()
                })).then()
            }
        },

        [OptionSystemActionType.GameRewardsOn]: {
            tag: 'GameRewardsOn',
            description: 'Enable the channel rewards that are game specific.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.useGameSpecificRewards = true
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.GameRewardsOn.valueOf().toString())
                const speech = textPreset?.filledData?.speech[0] ?? ''
                modules.tts.enqueueSpeakSentence(speech).then()
                Functions.appIdCallback(states.lastSteamAppId ?? '', StatesSingleton.getInstance().lastSteamAppIsVR).then()
            }
        },
        [OptionSystemActionType.GameRewardsOff]: {
            tag: 'GameRewardsOff',
            description: 'Disable the channel rewards that are game specific.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.useGameSpecificRewards = false
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.GameRewardsOff.valueOf().toString())
                const speech = textPreset?.filledData?.speech[0] ?? ''
                modules.tts.enqueueSpeakSentence(speech).then()
                Functions.appIdCallback('', false).then()
            }
        },
        [OptionSystemActionType.RefundRedemption]: {
            tag: 'RefundRedemption',
            description: 'Refund the last registered redemption for a user.',
            call: async (user) => {
                // TODO: Still broken, appears we're not getting new redemptions to register.
                const modules = ModulesSingleton.getInstance()
                const redemptions = DataUtils.getKeyDataDictionary(await DataBaseHelper.loadAll(new SettingTwitchRedemption()) ?? {})
                const userName = TextHelper.getFirstUserTagInText(user.input)
                if(!userName) return
                const userTag = `@${userName}`
                const userData = await TwitchHelixHelper.getUserByLogin(userName)
                const userRedemptions = Object.fromEntries(Object.entries(redemptions).filter(
                    row => (row[1].userId.toString() == userData?.id ?? '') && (row[1].status.toLowerCase() == 'unfulfilled')
                ))
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.RefundRedemption.valueOf().toString())
                const chatArr = textPreset?.filledData?.chat ?? []
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
        [OptionSystemActionType.ClearRedemptions]: {
            tag: 'ClearRedemptions',
            description: 'Clear redemptions from the queue for the channel, except ignored ones.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const redemptions = DataUtils.getKeyDataDictionary(await DataBaseHelper.loadAll(new SettingTwitchRedemption()) ?? {})
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.ClearRedemptions.valueOf().toString())
                const speechArr = textPreset?.filledData?.speech ?? []
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

        [OptionSystemActionType.ChannelTrophy]: {
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
                const rewardData = await TwitchHelixHelper.getReward(rewardId ?? '', true)
                if(rewardData?.data?.length == 1) { // We only loaded one reward, so this should be 1
                    const cost = rewardData.data[0].cost

                    /* TODO reimplement as a separate module
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
                    const labelUpdated = await DataFileUtils.writeText(
                        'trophy_label.txt', // TODO: Save as a constant or something?
                        await TextHelper.replaceTagsInText(
                            controllerConfig.channelTrophySettings.label,
                            user,
                            { number: cost.toString(), userName: user.name }
                        )
                    )
                    if(!labelUpdated) return Utils.log(`ChannelTrophy: Could not write label`, Color.Red)

                    // Update reward
                    // TODO: This should be rewritten to use the database data. Or, MOVE ALL OF THE CHANNEL TROPHY TO A UNIQUE ACTION!
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
                    */
                } else Utils.log(`ChannelTrophy: Could not get reward data from helix: ChannelTrophy->${rewardId}`, Color.Red)
            }
        },
        // endregion

        // region Redemptions
        [OptionSystemActionType.ResetIncrementingEvents]: {
            tag: 'ResetIncrementalReward',
            description: 'Reset the incremental reward counter for those rewards, unless ignored.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.ResetIncrementingEvents.valueOf().toString())
                const speechArr = textPreset?.filledData?.speech ?? []
                modules.tts.enqueueSpeakSentence(speechArr[0]).then()
                // Reset rewards with multiple steps
                const allEvents = DataUtils.getKeyDataDictionary(await DataBaseHelper.loadAll(new EventDefault()) ?? {})
                let totalCount = 0
                let totalResetCount = 0
                let totalSkippedCount = 0
                for(const [key, eventConfig] of Object.entries(allEvents)) {
                    if(
                        eventConfig.behavior == OptionEventBehavior.Incrementing
                        && eventConfig.incrementingOptions.resetOnCommand
                    ) {
                        const eventID = await DataBaseHelper.loadID(EventDefault.ref.build(), key)
                        if(!eventID) {
                            totalSkippedCount++
                            continue
                        }

                        // We check if the reward counter is at zero because then we should not update as it enables
                        // the reward while it could have been disabled by profiles.
                        // To update settings for the widget reward, we update it as any normal reward, using !update.
                        const counter = await DataBaseHelper.loadOrEmpty(new SettingIncrementingCounter(), eventID.toString())
                        if(counter.count == 0) {
                            totalSkippedCount++
                            continue
                        }

                        const triggers = eventConfig.getTriggers(new TriggerReward())
                        for(const trigger of triggers) {
                            totalCount++
                            const rewardEntries = DataUtils.ensureDataArray(trigger.rewardEntries) as PresetReward[] // TODO: This cast won't be needed if we support parents for things that are not generic...
                            const preset = rewardEntries[0]
                            const rewardID = DataUtils.ensureKey(trigger.rewardID)
                            if(preset && rewardID) {
                                const clone = Utils.clone(preset)
                                clone.title = await TextHelper.replaceTagsInText(clone.title, user)
                                clone.prompt = await TextHelper.replaceTagsInText(clone.prompt, user)
                                Utils.log(`Resetting incrementing reward: ${key}`, Color.Green)
                                await DataBaseHelper.save(new SettingIncrementingCounter(), eventID.toString())
                                await TwitchHelixHelper.updateReward(rewardID, clone)
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
        [OptionSystemActionType.ResetAccumulatingEvents]: {
            tag: 'ResetAccumulatingReward',
            description: 'Reset the accumulating reward counter for those rewards, unless ignored.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.ResetAccumulatingEvents.valueOf().toString())
                const speechArr = textPreset?.filledData?.speech ?? []
                modules.tts.enqueueSpeakSentence(speechArr[0]).then()
                // Reset rewards with multiple steps
                const allEvents = DataUtils.getKeyDataDictionary(await DataBaseHelper.loadAll(new EventDefault()) ?? {})
                let totalCount = 0
                let totalResetCount = 0
                let totalSkippedCount = 0
                for(const [key, eventConfig] of Object.entries(allEvents)) {
                    if(
                        eventConfig.behavior == OptionEventBehavior.Accumulating
                        && eventConfig.accumulatingOptions.resetOnCommand
                    ) {
                        const eventID = await DataBaseHelper.loadID(EventDefault.ref.build(), key)
                        if(!eventID) {
                            totalSkippedCount++
                            continue
                        }

                        // We check if the reward counter is at zero because then we should not update as it enables
                        // the reward while it could have been disabled by profiles.
                        // To update settings for the widget reward, we update it as any normal reward, using !update.
                        const counter = await DataBaseHelper.loadOrEmpty(new SettingAccumulatingCounter(), eventID.toString())
                        if(counter.count == 0) {
                            totalSkippedCount++
                            continue
                        }

                        const triggers = eventConfig.getTriggers(new TriggerReward())
                        for(const trigger of triggers) {
                            totalCount++
                            const rewardEntries = DataUtils.ensureDataArray(trigger.rewardEntries) as PresetReward[] // TODO: This cast won't be needed if we support parents for things that are not generic...
                            const preset = rewardEntries[0] as PresetReward
                            const rewardID = DataUtils.ensureKey(trigger.rewardID)
                            if(preset && rewardID) {
                                await DataBaseHelper.save(new SettingAccumulatingCounter(), eventID.toString())
                                const clone = Utils.clone(preset)
                                const userClone = Utils.clone(user)
                                userClone.eventKey = key
                                clone.title = await TextHelper.replaceTagsInText(clone.title, userClone)
                                clone.prompt = await TextHelper.replaceTagsInText(clone.prompt, userClone)
                                Utils.log(`Resetting accumulating reward: ${key}`, Color.Green)
                                await TwitchHelixHelper.updateReward(rewardID, clone)
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

        // endregion

        // region System
        [OptionSystemActionType.ReloadWidget]: {
            tag: 'ReloadWidget',
            description: 'Reloads the page for widget.',
            call: (user) => {
                Utils.reload()
            }
        },

        [OptionSystemActionType.ChannelTrophyStats]: {
            tag: 'ChannelTrophyStats',
            description: 'Posts the last Channel Trophy stats to DiscordUtils.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.ChannelTrophyStats.valueOf().toString())
                const speechArr = textPreset?.filledData?.speech ?? []
                const numberOfStreams = await ChannelTrophyUtils.getNumberOfStreams()
                const streamNumber = Utils.toInt(user.input)
                const controllerConfig = await DataBaseHelper.loadMain(new ConfigController())
                /* TODO move this to a separate module
                const webhook = DataUtils.ensureDataSingle(controllerConfig.channelTrophySettings.discordStatistics)?.data
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
                */
            }
        },

        [OptionSystemActionType.GameReset]: {
            tag: 'GameReset',
            description: 'Resets the currently detected game and trigger the app ID callback.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.GameReset.valueOf().toString())
                const speech = textPreset?.filledData?.speech[0] ?? ''
                modules.tts.enqueueSpeakSentence(speech).then()
                Functions.appIdCallback('', false).then()
                states.lastSteamAppId = undefined
                states.lastSteamAppIsVR = false
            }
        },

        [OptionSystemActionType.RemoteOn]: {
            tag: 'RemoteOn',
            description: 'Enables remote commands.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.runRemoteCommands = true
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.RemoteOn.valueOf().toString())
                const speech = textPreset?.filledData?.speech[0] ?? ''
                modules.tts.enqueueSpeakSentence(
                    await TextHelper.replaceTagsInText(
                        speech,
                        user
                    )
                ).then()
            }
        },
        [OptionSystemActionType.RemoteOff]: {
            tag: 'RemoteOff',
            description: 'Disables remote commands.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const states = StatesSingleton.getInstance()
                states.runRemoteCommands = false
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.RemoteOff.valueOf().toString())
                const speech = textPreset?.filledData?.speech[0] ?? ''
                modules.tts.enqueueSpeakSentence(
                    await TextHelper.replaceTagsInText(speech, user)
                ).then()
            }
        },
        [OptionSystemActionType.HelpToDiscord]: {
            tag: 'PostHelp',
            description: 'Post help for all commands with documentation to the specified Discord channel.',
            call: async (user) => {
                let messageText = ''

                const commandsConfig = await DataBaseHelper.loadMain(new ConfigCommands())
                const url = DataUtils.ensureData(commandsConfig.postCommandHelpToDiscord)?.url // TODO use full preset?
                if(!url) return console.warn('No Discord webhook URL specified for posting command help.')

                const commandTriggers = await EventHelper.getAllTriggersOfType(new TriggerCommand())
                commandTriggers.sort((a, b) => {
                    return a.category === b.category
                        ? a.entries.join('').localeCompare(b.entries.join(''))
                        : a.category.toString().localeCompare(b.category.toString())
                })
                let previousCategory: number = -1
                for(const trigger of commandTriggers) {
                    const entries = trigger.entries

                    let helpTitle = ''
                    if(trigger.category !== previousCategory) {
                        const meta = OptionsMap.getMeta(OptionCommandCategory.name)
                        helpTitle = meta?.getDocumentationFromValue(trigger.category) ?? 'New but unknown category'
                        DiscordUtils.enqueuePayload(url, {content: messageText})
                        messageText = ''
                        helpTitle = `__${helpTitle}__\n`
                        console.log('meta', meta, 'helpTitle', helpTitle)
                    }

                    let helpInput = (trigger.helpInput).map((input)=>`[${input}]`).join(' ')
                    if(helpInput.length > 0) helpInput = ` ${helpInput}`

                    const helpText = trigger.helpText
                    if(entries && helpText) {
                        const text = `${helpTitle}\`!${Utils.ensureArray(entries).join('|')}${helpInput}\` - ${helpText}`
                        if((messageText.length + text.length) > 2000) {
                            DiscordUtils.enqueuePayload(url, {content: messageText})
                            messageText = ''
                        }
                        if(messageText.length > 0) messageText += '\n'
                        messageText += text
                    }
                    previousCategory = trigger.category
                }
                DiscordUtils.enqueuePayload(url, {content: messageText})
            }
        },
        [OptionSystemActionType.HelpToChat]: {
            tag: 'GetHelp',
            description: 'Post help for a single command to chat.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const command = user.input.toLowerCase()
                const allCommandEvents = await EventHelper.getAllEventsWithTriggersOfType(new TriggerCommand())
                console.log('event keys', Object.keys(allCommandEvents))
                if(!allCommandEvents) return
                let foundMatch = false
                for(const [key, event] of Object.entries(allCommandEvents)) {
                    const triggers = event.getTriggers(new TriggerCommand())
                    if(event && triggers.length > 0) {
                        for(const trigger of triggers) {
                            console.log('trigger', trigger.entries.join(', '))
                            if(trigger.entries.includes(command)) {
                                foundMatch = true
                                let helpInput = trigger.helpInput.map((input) => `[${input}]`).join(' ')
                                if (helpInput.length > 0) helpInput = ` ${helpInput}`
                                modules.twitch._twitchChatOut.sendMessageToChannel(`!${user.input.toLowerCase()}${helpInput} - ${trigger.helpText}`)
                            }
                        }
                    }
                }
                if(!foundMatch) {
                    modules.twitch._twitchChatOut.sendMessageToChannel(`${user.input.toLowerCase()} - is not a command.`)
                }
            }
        },
        // endregion

        // region Twitch
        [OptionSystemActionType.Clips]: {
            tag: 'Clips',
            description: 'Posts new channel clips to Discord.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const config = await DataBaseHelper.loadMain(new ConfigTwitch())
                const pageCount = 20
                let lastCount = pageCount
                const oldClips = await DataBaseHelper.loadAll(new SettingTwitchClip())
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.Clips.valueOf().toString())
                const speechArr = textPreset?.filledData?.speech ?? []
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
                    const discordPreset = DataUtils.ensureData(config.postTwitchClipsToDiscord)
                    DiscordUtils.enqueuePayload(discordPreset?.url ?? '', { // TODO: Support full preset here.
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

        [OptionSystemActionType.Raid]: {
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
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.Raid.valueOf().toString())
                const chatArr = textPreset?.filledData?.chat ?? []
                if(channelData) {
                    user.input = `@${channel}` // TODO: Temporary to fix text replacement! In the future we will generate the FULL set of text replacements ONCE per EVENT.
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

        [OptionSystemActionType.Unraid]: {
            tag: 'Unraid',
            description: 'Cancels the currently active raid.',
            call: async (user) => {
                const modules = ModulesSingleton.getInstance()
                const result = await TwitchHelixHelper.cancelRaid()
                const textPreset = await DataBaseHelper.loadItem(new PresetSystemActionText(), OptionSystemActionType.Unraid.valueOf().toString())
                const chatArr = textPreset?.filledData?.chat ?? []
                if(chatArr) {
                    if(result) modules.twitch._twitchChatOut.sendMessageToChannel(chatArr[0])
                    else modules.twitch._twitchChatOut.sendMessageToChannel(chatArr[1])
                }
            }
        },
        // endregion
    }
}