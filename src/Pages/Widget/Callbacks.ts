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
import StatesSingleton from '../../Singletons/StatesSingleton.js'
import Utils from '../../Classes/Utils.js'
import MainController from './MainController.js'
import DiscordUtils from '../../Classes/DiscordUtils.js'
import SteamStoreHelper from '../../Classes/SteamStoreHelper.js'
import TwitchHelixHelper from '../../Classes/TwitchHelixHelper.js'
import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import ImageEditor from '../../Classes/ImageEditor.js'
import Relay, {IRelayTempMessage} from '../../Classes/Relay.js'
import {TKeys} from '../../_data/!keys.js'
import {ConfigDiscord} from '../../Objects/Config/Discord.js'
import {SettingTwitchTokens} from '../../Objects/Setting/Twitch.js'
import {PresetPipeCustom} from '../../Objects/Preset/Pipe.js'
import {ConfigPipe} from '../../Objects/Config/Pipe.js'
import {
    ITwitchEventSubEventGiftSubscription,
    ITwitchEventSubEventRedemption,
    ITwitchEventSubEventSubscription
} from '../../Interfaces/itwitch_eventsub.js'
import TwitchChat from '../../Classes/TwitchChat.js'
import TextHelper from '../../Classes/TextHelper.js'
import {ConfigRelay} from '../../Objects/Config/Relay.js'
import WebSockets from '../../Classes/WebSockets.js'
import LegacyUtils from '../../Classes/LegacyUtils.js'
import {SettingUser} from '../../Objects/Setting/User.js'
import ConfigOBS from '../../Objects/Config/OBS.js'
import ConfigTwitch from '../../Objects/Config/Twitch.js'
import {IAudioAction} from '../../Interfaces/iactions.js'
import TempFactory from '../../Classes/TempFactory.js'
import ConfigScreenshots from '../../Objects/Config/Screenshots.js'
import {EnumScreenshotFileType} from '../../Enums/EnumScreenshotFileType.js'
import ConfigTwitchChat from '../../Objects/Config/TwitchChat.js'

export default class Callbacks {
    private static _relays: Map<TKeys, IOpenVR2WSRelay> = new Map()
    public static registerRelay(relay: IOpenVR2WSRelay) {
        this._relays.set(relay.key, relay)
    }

    private static _imageRelay: Relay

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

        // TODO: This should be on or off depending on a general websockets setting.
        //  Also add support for subscriber avatars, cheer emotes & avatar, raiders avatars.
        const relayConfig = await DataBaseHelper.loadMain(new ConfigRelay())
        this._imageRelay = new Relay(relayConfig.overlayImagesChannel)
        this._imageRelay.init().then()

        // region Chat
        const twitchConfig = await DataBaseHelper.loadMain(new ConfigTwitch())
        const announcerNames = Utils.ensureObjectArrayNotId(twitchConfig.announcerUsers)
                .map((user)=>{return Utils.ensureObjectNotId(user)?.userName.toLowerCase() ?? ''})
                .filter(v=>v) // Remove empty strings
        modules.twitch.registerAnnouncers({
            userNames: announcerNames,
            triggers: Object.keys(twitchConfig.announcerTriggers),
            callback: async (userData, messageData, firstWord) => {
                // TTS
                const audioConfig = Utils.ensureObjectNotId(twitchConfig.announcerTriggers[firstWord]?.audio)
                if(audioConfig) {
                    // TODO: Convert to use class instead of interface
                    modules.tts.enqueueSoundEffect(TempFactory.configAudio(audioConfig))
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

            this._imageRelay.sendJSON(TwitchFactory.getEmoteImages(messageData.emotes, 2))
            const twitchChatConfig = await DataBaseHelper.loadMain(new ConfigTwitchChat())
            const soundEffect = Utils.ensureObjectNotId(twitchChatConfig.soundEffectOnEmptyMessage)
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
            } else if(states.pingForChat && twitchChatConfig.soundEffectOnEmptyMessage) {
                // Chat sound
                if(soundEffect && !Utils.matchFirstChar(messageData.text, Config.controller.secretChatSymbols)) {
                    modules.tts.enqueueSoundEffect(TempFactory.configAudio(soundEffect))
                }
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
        modules.twitchEventSub.setOnRewardCallback(async (event: ITwitchEventSubEventRedemption) => {
            if(!event) return console.warn('Reward redemption empty', event)
            const user = await TwitchHelixHelper.getUserById(parseInt(event.user_id))
            const rewardPairs = await LegacyUtils.getRewardPairs()
            const rewardPair = rewardPairs.find((pair) => { return pair.id === event.reward.id })

            // Discord
            // TODO: Not yet available with EventSub
            const amount = null // redemption.reward.redemptions_redeemed_current_stream
            const amountStr = amount != null ? ` #${amount}` : ''
            const discordConfig = await DataBaseHelper.loadMain(new ConfigDiscord())
            let description = `${discordConfig.prefixReward}**${event.reward.title}${amountStr}** (${event.reward.cost})`
            if(event.user_input.length > 0) description += `: ${Utils.escapeForDiscord(Utils.fixLinks(event.user_input))}`
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
            const pipeConfig = await DataBaseHelper.loadMain(new ConfigPipe())
            const showReward = pipeConfig.showRewardsWithKeys.indexOf(rewardPair?.key ?? 'Unknown') > -1
            if(showReward) {
                modules.pipe.sendBasic(
                    event.user_input,
                    user?.display_name, 
                    await TwitchHelixHelper.getUserColor(parseInt(event.user_id)) ?? Color.White,
                    user?.profile_image_url
                ).then()
            }
        })

        const subscriptionHandler = async (tier: number, gift: boolean, multi: boolean)=>{
            const sub = Config.twitch.announceSubs.find((sub) =>
                sub.gift == gift
                && sub.tier == tier
                && sub.multi == multi
            )

            // TODO: Announce sub
            if(sub) {
                console.warn('Found a sub announcement: ', sub)
                /*
                const user = await Actions.buildUserDataFromSubscriptionMessage('Unknown', event)
                modules.twitch._twitchChatOut.sendMessageToChannel(
                    await TextHelper.replaceTagsInText(sub.message, user)
                )
                */
            }
        }

        modules.twitchEventSub.setOnSubscriptionCallback( async(event) => {
            subscriptionHandler(parseInt(event.tier), event.is_gift, false).then()
            const modules = ModulesSingleton.getInstance()
            const message = `${event.user_name} subscribed to the channel! (${event.tier}, ${event.is_gift}, this is a test)`
            console.log('TwitchEventSub: OnSubscription', message)
            // TODO: Make customizable
            // modules.twitch._twitchChatOut.sendMessageToChannel(message)
        })

        modules.twitchEventSub.setOnGiftSubscriptionCallback( async(event)=>{
            subscriptionHandler(parseInt(event.tier), true, event.total > 1).then()
            const modules = ModulesSingleton.getInstance()
            const message = `@${event.user_name} gifter ${event.total} subs in the channel! (${event.tier}, ${event.cumulative_total}, this is a test)`
            console.log('TwitchEventSub: OnGifSubscription', message)
            // TODO: Make customizable
            // modules.twitch._twitchChatOut.sendMessageToChannel(message)
        })

        modules.twitchEventSub.setOnResubscriptionCallback( async(event)=>{
            subscriptionHandler(parseInt(event.tier), false, false).then()
            const modules = ModulesSingleton.getInstance()
            const message = `@${event.user_name} resubscribed for a total of ${event.cumulative_months} months! (${event.tier}, ${event.duration_months}, this is a test)`
            console.log('TwitchEventSub: OnGifSubscription', message)
            // TODO: Make customizable
            // modules.twitch._twitchChatOut.sendMessageToChannel(message)
        })

        modules.twitchEventSub.setOnCheerCallback(async (event) => {
            // Save user cheer
            const user = await DataBaseHelper.loadOrEmpty(new SettingUser(), event.user_id)
            user.cheer.lastBits = event.bits
            await DataBaseHelper.save(user, event.user_id)

            // Announce cheer
            const bits = event.bits
            const levels = Utils.clone(Config.twitch.announceCheers)
            let selectedLevel = levels.shift()
            for(const level of levels) {
                if(bits >= level.bits) selectedLevel = level
            }
            if(selectedLevel) {
                const user = await Actions.buildUserDataFromCheerMessage('Unknown', event)
                modules.twitch._twitchChatOut.sendMessageToChannel(
                    await TextHelper.replaceTagsInText(selectedLevel.message, user)
                )
            }
        })

        // endregion

        // region Screenshots
        modules.sssvr.setScreenshotCallback(async (requestData, responseData) => {
            const screenshotsConfig = await DataBaseHelper.loadMain(new ConfigScreenshots())

            // Pipe manual screenshots into VR if configured.
            // TODO: Figure out how to associate this with either events or actions in the future... probably events?
            if(
                Config.screenshots.callback.pipeEnabledForRewards.includes(requestData?.rewardKey ?? 'Unknown')
                || (requestData == null && screenshotsConfig.callback.pipeEnabledForManual)
            ) {
                const preset = Utils.ensureObjectNotId(screenshotsConfig.callback.pipePreset)
                if(preset !== undefined) {
                    const configClone: PresetPipeCustom = Utils.clone(preset)
                    configClone.imageData = responseData.image
                    if(configClone.customProperties) {
                        configClone.customProperties.durationMs = screenshotsConfig.callback.pipePreset_forMs
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
                    modules.pipe.sendCustom(configClone).then()
                }
            }

            const webhooks = Utils.ensureObjectArrayNotId(screenshotsConfig.callback.discordWebhooksSSSVR)
            const dataUrl = Utils.b64ToDataUrl(responseData.image)
            const discordConfig = await DataBaseHelper.loadMain(new ConfigDiscord())

            // Post screenshot to Sign and Discord
            const blob = screenshotsConfig.callback.discordEmbedImageFormat == EnumScreenshotFileType.JPG
                ? await ImageEditor.convertPngDataUrlToJpegBlobForDiscord(dataUrl)
                : Utils.b64toBlob(dataUrl)
            if(requestData) { // A screenshot from a reward
                const userData = await TwitchHelixHelper.getUserById(requestData.userId)
                const authorName = userData?.display_name ?? ''

                // Sign
                modules.sign.enqueueSign({
                    title: screenshotsConfig.callback.signTitle,
                    image: dataUrl,
                    subtitle: authorName,
                    durationMs: screenshotsConfig.callback.signTitle_forMs
                })

                // Discord
                for(const webhook of webhooks) {
                    const gameData = await SteamStoreHelper.getGameMeta(states.lastSteamAppId ?? '')
                    const gameTitle = gameData != null ? gameData.name : states.lastSteamAppId
                    const description = requestData.userInput
                    const authorUrl = `https://twitch.tv/${userData?.login ?? ''}`
                    const authorIconUrl = userData?.profile_image_url ?? ''
                    const color = Utils.hexToDecColor(
                        await TwitchHelixHelper.getUserColor(requestData.userId) ?? discordConfig.screenshotEmbedColorRemote
                    )
                    const descriptionText = description?.trim().length > 0
                        ? TextHelper.replaceTags(screenshotsConfig.callback.discordRewardTitle, {text: description})
                        : screenshotsConfig.callback.discordRewardInstantTitle
                    DiscordUtils.enqueuePayloadEmbed(webhook.url, blob, color, descriptionText, authorName, authorUrl, authorIconUrl, gameTitle)
                }
            } else { // A manually taken screenshot
                // Sign
                modules.sign.enqueueSign({
                    title: screenshotsConfig.callback.signTitle,
                    image: dataUrl,
                    subtitle: screenshotsConfig.callback.signManualSubtitle,
                    durationMs: screenshotsConfig.callback.signTitle_forMs
                })

                // Discord
                for(const webhook of webhooks) {
                    const gameData = await SteamStoreHelper.getGameMeta(states.lastSteamAppId ?? '')
                    const gameTitle = gameData != null ? gameData.name : states.lastSteamAppId
                    const color = Utils.hexToDecColor(discordConfig.screenshotEmbedColorManual)
                    DiscordUtils.enqueuePayloadEmbed(webhook.url, blob, color, screenshotsConfig.callback.discordManualTitle, undefined, undefined, undefined, gameTitle)
                }
            }
        })

        modules.obs.registerSourceScreenshotCallback(async (img, requestData, nonce) => {
            const screenshotsConfig = await DataBaseHelper.loadMain(new ConfigScreenshots())

            const b64data = img.split(',').pop() ?? ''
            const dataUrl = Utils.b64ToDataUrl(b64data)
            const nonceCallback = states.nonceCallbacks.get(nonce)
            const discordConfig = await DataBaseHelper.loadMain(new ConfigDiscord())
            if(nonceCallback) nonceCallback()

            if(requestData != null) {
                const userData = await TwitchHelixHelper.getUserById(requestData.userId)
                const authorName = userData?.display_name ?? ''

                // Sign
                modules.sign.enqueueSign({
                    title: screenshotsConfig.callback.signTitle,
                    image: dataUrl,
                    subtitle: authorName,
                    durationMs: screenshotsConfig.callback.signTitle_forMs
                })

                // Discord
                const webhooks = Utils.ensureObjectArrayNotId(screenshotsConfig.callback.discordWebhooksSSSVR)
                for(const webhook of webhooks) {
                    const gameData = await SteamStoreHelper.getGameMeta(states.lastSteamAppId ?? '')
                    const gameTitle = gameData ? gameData.name : screenshotsConfig.callback.discordDefaultGameTitle
                    const description = requestData.userInput
                    const authorUrl = `https://twitch.tv/${userData?.login ?? ''}`
                    const authorIconUrl = userData?.profile_image_url ?? ''
                    const color = Utils.hexToDecColor(
                        await TwitchHelixHelper.getUserColor(requestData.userId) ?? discordConfig.screenshotEmbedColorRemote
                    )
                    const descriptionText = description?.trim().length > 0
                        ? TextHelper.replaceTags(screenshotsConfig.callback.discordRewardTitle, {text: description})
                        : screenshotsConfig.callback.discordRewardInstantTitle
                    const blob = await ImageEditor.convertPngDataUrlToJpegBlobForDiscord(dataUrl)
                    DiscordUtils.enqueuePayloadEmbed(webhook.url, blob, color, descriptionText, authorName, authorUrl, authorIconUrl, gameTitle)
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
        modules.audioPlayer.setMainPlayedCallback((nonce:string, status:number) => {
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