import {IOpenVR2WSRelay} from '../../Interfaces/iopenvr2ws.js'
import {EEventSource, ETTSType} from './Enums.js'
import {Actions} from './Actions.js'
import Config from '../../Classes/Config.js'
import {ITwitchMessageCmd} from '../../Interfaces/itwitch_chat.js'
import Color from '../../Classes/ColorConstants.js'
import AudioPlayer from '../../Classes/AudioPlayer.js'
import Functions from './Functions.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
import TwitchFactory from '../../Classes/TwitchFactory.js'
import {ITwitchPubsubRewardMessage} from '../../Interfaces/itwitch_pubsub.js'
import StatesSingleton from '../../Singletons/StatesSingleton.js'
import Utils from '../../Classes/Utils.js'
import MainController from './MainController.js'
import DiscordUtils from '../../Classes/DiscordUtils.js'
import SteamStoreHelper from '../../Classes/SteamStoreHelper.js'
import TwitchHelixHelper from '../../Classes/TwitchHelixHelper.js'
import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import ImageEditor from '../../Classes/ImageEditor.js'
import {IRelayTempMessage} from '../../Classes/Relay.js'
import {TKeys} from '../../_data/!keys.js'
import {ConfigDiscord} from '../../Objects/Config/Discord.js'
import {SettingTwitchCheer, SettingTwitchSub, SettingTwitchTokens} from '../../Objects/Setting/Twitch.js'
import {PresetPipeCustom} from '../../Objects/Preset/Pipe.js'

export default class Callbacks {
    private static _relays: Map<TKeys, IOpenVR2WSRelay> = new Map()
    public static registerRelay(relay: IOpenVR2WSRelay) {
        this._relays.set(relay.key, relay)
    }

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

        // region Chat
        modules.twitch.registerAnnouncers({
            userNames: Config.twitch.announcerNames.map((name)=>{return name.toLowerCase()}),
            triggers: Config.twitch.announcerTriggers,
            callback: async (userData, messageData, firstWord) => {
                // TTS
                if(Config.audioplayer.configs.hasOwnProperty(firstWord)) {
                    modules.tts.enqueueSoundEffect(Config.audioplayer.configs[firstWord])
                }
                await modules.tts.enqueueSpeakSentence(messageData.text, userData.id)

                // Pipe to VR (basic)
                const user = await TwitchHelixHelper.getUserById(userData.id)
                await modules.pipe.sendBasicObj(messageData, userData, user)
            }
        })

        modules.twitch.setChatCheerCallback(async (userData, messageData) => {
            const clearRanges = TwitchFactory.getEmotePositions(messageData.emotes)
            // TTS
            await modules.tts.enqueueSpeakSentence(
                messageData.text, 
                userData.id,
                ETTSType.Cheer,
                Utils.getNonce('TTS'), 
                messageData.bits, 
                clearRanges
            )

            // Pipe to VR (basic)
            const user = await TwitchHelixHelper.getUserById(userData.id)
            await modules.pipe.sendBasicObj(messageData, userData, user)
        })

        modules.twitch.setChatCallback(async (userData, messageData) => {
            const clearRanges = TwitchFactory.getEmotePositions(messageData.emotes)
            let type = ETTSType.Said
            if(messageData.isAction) type = ETTSType.Action
            
            if(states.ttsForAll) { 
                // TTS is on for everyone
                await modules.tts.enqueueSpeakSentence(
                    messageData.text, 
                    userData.id,
                    type, 
                    undefined, 
                    Utils.getNonce('TTS'), 
                    clearRanges
                )
            } else if(states.ttsEnabledUsers.indexOf(userData.name) > -1) {
                // Reward users
                await modules.tts.enqueueSpeakSentence(
                    messageData.text, 
                    userData.id,
                    type, 
                    undefined, 
                    Utils.getNonce('TTS'), 
                    clearRanges
                )
            } else if(states.pingForChat && Config.twitchChat.audio) {
                // Chat sound
                const soundEffect = Config.twitchChat.audio
                if(!Utils.matchFirstChar(messageData.text, Config.controller.secretChatSymbols)) modules.tts.enqueueSoundEffect(soundEffect)
            }

            // Pipe to VR (basic)
            if(states.pipeAllChat) {
                const user = await TwitchHelixHelper.getUserById(userData.id)
                await modules.pipe.sendBasicObj(messageData, userData, user)
            }
        })

        modules.twitch.setAllChatCallback(async (message:ITwitchMessageCmd) => {
            const rewardId = message?.properties?.["custom-reward-id"]           
            if(rewardId) return // Skip rewards as handled elsewhere
            const bits = Utils.toInt(message?.properties?.bits, 0)
            
            // Discord
            const user = await TwitchHelixHelper.getUserById(Utils.toInt(message.properties['user-id']))
            let text = message?.message?.text
            if(text == null || text.length == 0) return

            // Format text
            let logText = Utils.escapeForDiscord(text)
            if(message?.message?.isAction) logText = `_${logText}_`
            
            // Label messages with bits
            let label = ''
            if(!isNaN(bits) && bits > 0) {
                const discordConfig = await DataBaseHelper.loadMain(new ConfigDiscord())
                const unit = bits == 1 ? 'bit' : 'bits'
                label = `${discordConfig.prefixCheer}**Cheered ${bits} ${unit}**: `
            }
            
            // TODO: Add more things like sub messages? Need to check that from raw logs.
            // TODO: Reference Jeppe's twitch logger for the other messages! :D
            
            if(states.logChatToDiscord) {
                DiscordUtils.enqueueMessage(
                    Config.credentials.DiscordWebhooks['DiscordChat'] ?? '',
                    user?.display_name,
                    user?.profile_image_url,
                    `${label}${logText}`
                )
            }
        })
        // endregion

        // region Rewards

        // This callback was added as rewards with no text input does not come in through the chat callback
        modules.twitchPubsub.setOnRewardCallback(async (id: string, message: ITwitchPubsubRewardMessage) => {
            const redemption = message?.data?.redemption
            if(!redemption) return console.warn('Reward redemption empty', message)

            const user = await TwitchHelixHelper.getUserById(parseInt(redemption.user.id))
            const rewardPairs = await Utils.getRewardPairs()
            const rewardPair = rewardPairs.find((pair) => { return pair.id === redemption.reward.id })

            // Discord
            const amount = redemption.reward.redemptions_redeemed_current_stream
            const amountStr = amount != null ? ` #${amount}` : ''
            const discordConfig = await DataBaseHelper.loadMain(new ConfigDiscord())
            let description = `${discordConfig.prefixReward}**${redemption.reward.title}${amountStr}** (${redemption.reward.cost})`
            if(redemption.user_input) description += `: ${Utils.escapeForDiscord(Utils.fixLinks(redemption.user_input))}`
            if(states.logChatToDiscord) {
                DiscordUtils.enqueueMessage(
                    Config.credentials.DiscordWebhooks['DiscordChat'] ?? '',
                    user?.display_name,
                    user?.profile_image_url,
                    description
                )
            }
            const key = rewardPair?.key ?? 'Unknown'
            const rewardSpecificWebhook = Config.credentials.DiscordWebhooks[key]
            const ignoreWebhook = !!Config.events[key]?.options?.rewardIgnoreAutomaticDiscordPosting
            if(rewardSpecificWebhook && !ignoreWebhook) {
                DiscordUtils.enqueueMessage(
                    rewardSpecificWebhook,
                    user?.display_name,
                    user?.profile_image_url,
                    description
                )
            }

            // Pipe to VR (basic)
            const showReward = Config.pipe.showRewardsWithKeys.indexOf(rewardPair?.key ?? 'Unknown') > -1
            if(showReward) {
                modules.pipe.sendBasic(
                    redemption.user_input, 
                    user?.display_name, 
                    await TwitchHelixHelper.getUserColor(parseInt(redemption.user.id)) ?? Color.White,
                    user?.profile_image_url
                ).then()
            }
        })

        modules.twitchPubsub.setOnSubscriptionCallback( async(message) => {
            // https://dev.twitch.tv/docs/pubsub#topics Channel Subscription Event Message
            const subTier = parseInt(message.sub_plan) || 0 // Prime ends up as 0 as it's not a valid int.
            const multiMonth = message.multi_month_duration ?? 0 // Only exists if it was a multi month subscription.
            const sub = Config.twitch.announceSubs.find((sub) =>
                    sub.gift == message.is_gift
                    && sub.tier == subTier
                    && sub.multi == false // Not sure how to get this value, just listen for messages with some common transaction ID?
            )

            // Save user sub
            const subSetting = new SettingTwitchSub()
            subSetting.totalMonths = message.cumulative_months ?? 0
            subSetting.streakMonths = message.streak_months ?? 0
            await DataBaseHelper.save(subSetting, message.user_id)

            // Announce sub
            if(sub) {
                const user = await Actions.buildUserDataFromSubscriptionMessage('Unknown', message)
                modules.twitch._twitchChatOut.sendMessageToChannel(
                    await Utils.replaceTagsInText(sub.message, user, {
                        targetLogin: message.recipient_user_name ?? '',
                        targetName: message.recipient_display_name ?? '',
                        targetTag: `@${message.recipient_display_name}`
                    })
                )
            }
        })
        modules.twitchPubsub.setOnCheerCallback(async (message) => {
            // Save user cheer
            const cheerSetting = new SettingTwitchCheer()
            cheerSetting.totalBits = message.data.total_bits_used
            cheerSetting.lastBits = message.data.bits_used
            await DataBaseHelper.save(cheerSetting, message.data.user_id)

            // Announce cheer
            const bits = message.data.bits_used ?? 0
            const levels = Utils.clone(Config.twitch.announceCheers)
            let selectedLevel = levels.shift()
            for(const level of levels) {
                if(bits >= level.bits) selectedLevel = level
            }
            if(selectedLevel) {
                const user = await Actions.buildUserDataFromCheerMessage('Unknown', message)
                modules.twitch._twitchChatOut.sendMessageToChannel(
                    await Utils.replaceTagsInText(selectedLevel.message, user)
                )
            }
        })

        // endregion

        // region Screenshots

        modules.sssvr.setScreenshotCallback(async (requestData, responseData) => {
            // Pipe manual screenshots into VR if configured.
            if(
                Config.screenshots.callback.pipeEnabledForRewards.includes(requestData?.rewardKey ?? 'Unknown')
                || (requestData == null && Config.screenshots.callback.pipeEnabledForManual)
            ) {
                const preset = Config.screenshots.callback.pipeMessagePreset
                if(preset != undefined) {
                    const configClone: PresetPipeCustom = Utils.clone(preset.config)
                    configClone.imageData = responseData.image
                    if(configClone.customProperties) {
                        configClone.customProperties.durationMs = preset.durationMs
                        const tas = configClone.customProperties.textAreas
                        if(tas && tas.length > 0) {
                            tas[0].text = `${responseData.width}x${responseData.height}`
                        }
                        if(requestData != null && tas && tas.length > 1) {
                            const userData = await TwitchHelixHelper.getUserById(requestData.userId)
                            const title = requestData.userInput
                                ? `"${requestData.userInput}"\n${userData?.display_name ?? ''}`
                                : userData?.display_name ?? ''
                            tas[1].text = title
                        }
                    }
                    modules.pipe.sendCustom(configClone)
                }
            }

            const discordCfg = Config.credentials.DiscordWebhooks['DiscordVRScreenshot'] ?? ''
            const dataUrl = Utils.b64ToDataUrl(responseData.image)
            const discordConfig = await DataBaseHelper.loadMain(new ConfigDiscord())

            // Post screenshot to Sign and Discord
            if(requestData) { // A screenshot from a reward
                const userData = await TwitchHelixHelper.getUserById(requestData.userId)
                const authorName = userData?.display_name ?? ''

                // Sign
                modules.sign.enqueueSign({
                    title: Config.screenshots.callback.signTitle,
                    image: dataUrl,
                    subtitle: authorName,
                    durationMs: Config.screenshots.callback.signDurationMs
                })

                // Discord
                if(discordCfg) {
                    const gameData = await SteamStoreHelper.getGameMeta(states.lastSteamAppId ?? '')
                    const gameTitle = gameData != null ? gameData.name : states.lastSteamAppId
                    const description = requestData.userInput
                    const authorUrl = `https://twitch.tv/${userData?.login ?? ''}`
                    const authorIconUrl = userData?.profile_image_url ?? ''
                    const color = Utils.hexToDecColor(
                        await TwitchHelixHelper.getUserColor(requestData.userId) ?? discordConfig.screenshotEmbedColorRemote
                    )
                    const descriptionText = description?.trim().length > 0
                        ? Utils.replaceTags(Config.screenshots.callback.discordRewardTitle, {text: description})
                        : Config.screenshots.callback.discordRewardInstantTitle
                    const blob = await ImageEditor.convertPngDataUrlToJpegBlobForDiscord(dataUrl)
                    DiscordUtils.enqueuePayloadEmbed(discordCfg, blob, color, descriptionText, authorName, authorUrl, authorIconUrl, gameTitle)
                }
            } else { // A manually taken screenshot
                // Sign
                modules.sign.enqueueSign({
                    title: Config.screenshots.callback.signTitle,
                    image: dataUrl,
                    subtitle: Config.screenshots.callback.signManualSubtitle,
                    durationMs: Config.screenshots.callback.signDurationMs
                })

                // Discord
                if(discordCfg) {
                    const gameData = await SteamStoreHelper.getGameMeta(states.lastSteamAppId ?? '')
                    const gameTitle = gameData != null ? gameData.name : states.lastSteamAppId
                    const color = Utils.hexToDecColor(discordConfig.screenshotEmbedColorManual)
                    const blob = await ImageEditor.convertPngDataUrlToJpegBlobForDiscord(dataUrl)
                    DiscordUtils.enqueuePayloadEmbed(discordCfg, blob, color, Config.screenshots.callback.discordManualTitle, undefined, undefined, undefined, gameTitle)
                }
            }
        })

        modules.obs.registerSourceScreenshotCallback(async (img, requestData, nonce) => {
            const b64data = img.split(',').pop() ?? ''
            const discordCfg = Config.credentials.DiscordWebhooks['DiscordOBSScreenshot'] ?? ''
            const dataUrl = Utils.b64ToDataUrl(b64data)
            const nonceCallback = states.nonceCallbacks.get(nonce)
            const discordConfig = await DataBaseHelper.loadMain(new ConfigDiscord())
            if(nonceCallback) nonceCallback()

            if(requestData != null) {
                const userData = await TwitchHelixHelper.getUserById(requestData.userId)
                const authorName = userData?.display_name ?? ''

                // Sign
                modules.sign.enqueueSign({
                    title: Config.screenshots.callback.signTitle,
                    image: dataUrl,
                    subtitle: authorName,
                    durationMs: Config.screenshots.callback.signDurationMs
                })

                // Sound effect
                const soundConfig = Config.audioplayer.configs['DiscordOBSScreenshot']
                if(soundConfig) modules.audioPlayer.enqueueAudio(soundConfig)

                // Discord
                if(discordCfg) {
                    const gameData = await SteamStoreHelper.getGameMeta(states.lastSteamAppId ?? '')
                    const gameTitle = gameData ? gameData.name : Config.obs.sourceScreenshotConfig.discordGameTitle
                    const description = requestData.userInput
                    const authorUrl = `https://twitch.tv/${userData?.login ?? ''}`
                    const authorIconUrl = userData?.profile_image_url ?? ''
                    const color = Utils.hexToDecColor(
                        await TwitchHelixHelper.getUserColor(requestData.userId) ?? discordConfig.screenshotEmbedColorRemote
                    )
                    const descriptionText = description?.trim().length > 0
                        ? Utils.replaceTags(Config.screenshots.callback.discordRewardTitle, {text: description})
                        : Config.obs.sourceScreenshotConfig.discordDescription
                    const blob = await ImageEditor.convertPngDataUrlToJpegBlobForDiscord(dataUrl)
                    DiscordUtils.enqueuePayloadEmbed(discordCfg, blob, color, descriptionText, authorName, authorUrl, authorIconUrl, gameTitle)
                }
            }
        })

        // endregion

        // region OBS
        modules.obs.registerSceneChangeCallback((sceneName) => {
            // let filterScene = Config.obs.filterOnScenes.indexOf(sceneName) > -1
            // this._ttsForAll = !filterScene
        })
        // endregion

        // region Audio
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
        // endregion

        // region VR
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
                TwitchHelixHelper.toggleRewards(rewards)
            }
        })

        // TODO: Nothing should be using this so possibly redundant.
        modules.openvr2ws.setInputPoseCallback((pose)=>{
            console.warn('InputPoseCallback', pose)
        })

        modules.relay.setOnMessageCallback(async (message) => {
            const msg = message as IRelayTempMessage
            const relay = this._relays.get(msg.key)
            const user = await DataBaseHelper.load(new SettingTwitchTokens(), 'Channel')
            if(relay) {
                Utils.log(`Callbacks: Relay callback found for ${msg.key}: ${JSON.stringify(msg.data)}`, Color.Green)
                relay.handler?.call(await Actions.buildEmptyUserData(EEventSource.Relay, msg.key, user?.userLogin, msg.data))
            } else {
                Utils.log(`Callbacks: OpenVR2WS Relay callback for ${msg.key} not found.`, Color.OrangeRed)
            }
        })
        // endregion

        // region App ID
        modules.openvr2ws.setAppIdCallback(async (appId) => {
            Functions.appIdCallback(appId, true).then()
        })
        // endregion
    }
}