import {IOpenVR2WSRelay} from '../Classes/OpenVR2WS.js'
import Relay, {IRelayTempMessage} from '../Classes/Relay.js'
import ModulesSingleton from '../Singletons/ModulesSingleton.js'
import StatesSingleton from '../Singletons/StatesSingleton.js'
import DataBaseHelper from '../Helpers/DataBaseHelper.js'
import DataUtils from '../Objects/Data/DataUtils.js'
import TwitchHelixHelper from '../Helpers/TwitchHelixHelper.js'
import TwitchFactory, {ITwitchMessageCmd} from '../Classes/TwitchFactory.js'
import {OptionTTSType} from '../Objects/Options/OptionTTS.js'
import Utils from '../Utils/Utils.js'
import DiscordUtils from '../Utils/DiscordUtils.js'
import {ITwitchEventSubEventRedemption} from '../Classes/TwitchEventSub.js'
import {IActionUser} from '../Objects/Data/Action/AbstractAction.js'
import TextHelper from '../Helpers/TextHelper.js'
import {Actions} from './Actions.js'
import ConfigAnnouncements, {ConfigAnnounceRaid} from '../Objects/Data/Config/ConfigAnnouncements.js'
import {PresetPipeCustom} from '../Objects/Data/Preset/PresetPipe.js'
import {OptionScreenshotFileType} from '../Objects/Options/OptionScreenshotFileType.js'
import ImageEditor from '../Classes/ImageEditor.js'
import SteamStoreHelper from '../Helpers/SteamStoreHelper.js'
import AudioPlayer from '../Classes/AudioPlayer.js'
import MainController from './MainController.js'
import Functions from './Functions.js'
import ConfigRelay from '../Objects/Data/Config/ConfigRelay.js'
import ConfigChat from '../Objects/Data/Config/ConfigChat.js'
import ConfigController from '../Objects/Data/Config/ConfigController.js'
import ConfigDiscord from '../Objects/Data/Config/ConfigDiscord.js'
import SettingUser from '../Objects/Data/Setting/SettingUser.js'
import ConfigScreenshots from '../Objects/Data/Config/ConfigScreenshots.js'
import {SettingTwitchTokens} from '../Objects/Data/Setting/SettingTwitch.js'
import Color from '../Constants/ColorConstants.js'
import {EEventSource} from './Enums.js'
import AssetsHelper from '../Helpers/AssetsHelper.js'
import ActionSign from '../Objects/Data/Action/ActionSign.js'

export default class Callbacks {
    private static _relays: Map<string, IOpenVR2WSRelay> = new Map()
    public static registerRelay(relay: IOpenVR2WSRelay) {
        this._relays.set(relay.key, relay)
    }

    private static _imageRelay: Relay

    public static async init() {   
        // region Callbacks
        const modules = ModulesSingleton.getInstance()
        const states = StatesSingleton.getInstance()

        // TODO: This should be on or off depending on a general websockets setting.
        //  Also add support for subscriber avatars, cheer emotes & avatar, raiders avatars.
        const relayConfig = await DataBaseHelper.loadMain(new ConfigRelay())
        this._imageRelay = new Relay(relayConfig.overlayImagesChannel)
        this._imageRelay.init().then()

        // region Chat
        const announcementsConfig = await DataBaseHelper.loadMain(new ConfigAnnouncements())
        const announcerNames = (DataUtils.ensureDataArray(announcementsConfig.announcerUsers) ?? [])
                .map((user)=>{return user.userName.toLowerCase() ?? ''})
                .filter(v=>v) // Remove empty strings
        modules.twitch.registerAnnouncers({
            userNames: announcerNames,
            triggers: announcementsConfig.announcerTriggers.map((announcer)=>announcer.trigger),
            callback: async (userData, messageData, firstWord) => {
                // TTS
                const announcerTrigger = announcementsConfig.announcerTriggers.find((announcer)=> announcer.trigger == firstWord)
                const audioConfig = announcerTrigger ? DataUtils.ensureData(announcerTrigger.trigger_audio) : undefined
                modules.tts.enqueueSoundEffect(audioConfig)
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
                OptionTTSType.Cheer,
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
            let type = OptionTTSType.Said
            if(messageData.isAction) type = OptionTTSType.Action

            this._imageRelay.sendJSON(TwitchFactory.getEmoteImages(messageData.emotes, 2))
            const twitchChatConfig = await DataBaseHelper.loadMain(new ConfigChat())
            const controllerConfig = await DataBaseHelper.loadMain(new ConfigController())
            const soundEffect = DataUtils.ensureData(twitchChatConfig.soundEffectOnEmptyMessage)
            if(states.ttsForAll) {
                console.log('SPEECH', type)
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
                if(soundEffect && !Utils.matchFirstChar(messageData.text, controllerConfig.secretChatSymbols)) {
                    const clone = Utils.clone(soundEffect)
                    clone.srcEntries = await AssetsHelper.preparePathsForUse(clone.srcEntries)
                    modules.tts.enqueueSoundEffect(clone)
                }
            }

            // Pipe to VR (basic)
            if(states.pipeAllChat) {
                const user = await TwitchHelixHelper.getUserById(userData.id)
                modules.pipe.sendBasicObj(messageData, userData, user)
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
            
            const twitchChatConfig = await DataBaseHelper.loadMain(new ConfigChat())
            const webhook = DataUtils.ensureData(twitchChatConfig.logToDiscord)
            if(states.logChatToDiscord && webhook) {
                DiscordUtils.enqueueMessage(
                    webhook.url ?? '',
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

            // TODO: Get event(s) from reward ID somehow? event.reward.id

            // Discord
            // TODO: Not yet available with EventSub, handle it on our own I guess.
            const amount = null // redemption.reward.redemptions_redeemed_current_stream
            const amountStr = amount != null ? ` #${amount}` : ''
            const twitchChatConfig = await DataBaseHelper.loadMain(new ConfigChat())
            const webhook = DataUtils.ensureData(twitchChatConfig.logToDiscord)
            const discordConfig = await DataBaseHelper.loadMain(new ConfigDiscord())
            let description = `${discordConfig.prefixReward}**${event.reward.title}${amountStr}** (${event.reward.cost})`
            if(event.user_input.length > 0) description += `: ${Utils.escapeForDiscord(Utils.fixLinks(event.user_input))}`
            if(states.logChatToDiscord && webhook) {
                DiscordUtils.enqueueMessage(
                    webhook.url ?? '',
                    user?.display_name,
                    user?.profile_image_url,
                    description
                )
            }
            /* TODO: Reimplement this with some kind of reference per event?!
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
            */
        })

        const subscriptionHandler = async (user:IActionUser, tier: number, gift: boolean, multi: boolean)=>{
            const sub = announcementsConfig.announceSubs.find((sub)=>
                sub.tier == tier
                && sub.tier_gift == gift
                && sub.tier_multi == multi
            )
            if(sub) {
                console.log('Found a sub announcement: ', sub)
                modules.twitch._twitchChatOut.sendMessageToChannel(
                    await TextHelper.replaceTagsInText(sub.message, user)
                )
            } else {
                console.warn('Did not find a sub announcement: ', tier, gift, multi)
            }
        }
        modules.twitchEventSub.setOnSubscriptionCallback( async(event) => {
            const user = await Actions.buildUserDataFromLimitedData('Unknown', event.user_id, event.user_login, event.user_name, '')
            subscriptionHandler(user, parseInt(event.tier), event.is_gift, false).then()
        })
        modules.twitchEventSub.setOnGiftSubscriptionCallback( async(event)=>{
            const user = await Actions.buildUserDataFromLimitedData('Unknown', event.user_id, event.user_login, event.user_name, '')
            subscriptionHandler(user, parseInt(event.tier), true, event.total > 1).then()
        })
        modules.twitchEventSub.setOnResubscriptionCallback( async(event)=>{
            const user = await Actions.buildUserDataFromLimitedData('Unknown', event.user_id, event.user_login, event.user_name, event.message.text) // TODO: Also handle emotes?
            subscriptionHandler(user, parseInt(event.tier), false, false).then()
        })

        modules.twitchEventSub.setOnCheerCallback(async (event) => {
            // Save user cheer
            const user = await DataBaseHelper.loadOrEmpty(new SettingUser(), event.user_id)
            user.cheer.lastBits = event.bits
            await DataBaseHelper.save(user, event.user_id)

            // Announce cheer
            const bits = event.bits
            const levels = Utils.clone(announcementsConfig.announceCheers)
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

        modules.twitchEventSub.setOnRaidCallback(async (event) => {
            const broadcasterId = (await TwitchHelixHelper.getBroadcasterUserId()).toString()
            let announcement: ConfigAnnounceRaid|undefined = undefined
            let currentViewerThreshold = 0
            for(const raidAnnouncement of announcementsConfig.announceRaids) {
                if(event.viewers >= raidAnnouncement.viewers && raidAnnouncement.viewers >= currentViewerThreshold) {
                    announcement = raidAnnouncement
                    currentViewerThreshold = raidAnnouncement.viewers
                }
            }
            if(event.to_broadcaster_user_id == broadcasterId) {
                const message = `@${event.from_broadcaster_user_name} raided the channel with ${event.viewers} viewer(s)! (this is a test)`
                console.log(message)
                // TODO: Make customizable with tags
                if(announcement) ModulesSingleton.getInstance().twitch._twitchChatOut.sendMessageToChannel(announcement.message)
                else console.warn(`Did not find any announcement matching ${event.viewers} viewers!`)
            }
            if (event.from_broadcaster_user_id == broadcasterId) {
                const message = `This channel raided @${event.to_broadcaster_user_name} with ${event.viewers} viewer(s)! (this is a test)`
                console.log(message)
            }
        })
        // endregion

        // region Screenshots
        modules.sssvr.setScreenshotCallback(async (requestData, responseData) => {
            const screenshotsConfig = await DataBaseHelper.loadMain(new ConfigScreenshots())

            // Pipe manual screenshots into VR if configured.
            const pipeEnabledForEvents = DataUtils.ensureKeyArray(screenshotsConfig.callback.pipeEnabledForEvents) ?? []
            if(
                pipeEnabledForEvents.includes(requestData?.eventKey ?? '') ||
                (!requestData && screenshotsConfig.callback.pipeEnabledForManual)
            ) {
                const preset = DataUtils.ensureData(screenshotsConfig.callback.pipePreset)
                if(preset) {
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

            const webhooks = DataUtils.ensureDataArray(screenshotsConfig.callback.discordWebhooksSSSVR) ?? []
            const dataUrl = Utils.b64ToDataUrl(responseData.image)
            const discordConfig = await DataBaseHelper.loadMain(new ConfigDiscord())

            // Post screenshot to Sign and Discord
            const blob = screenshotsConfig.callback.discordEmbedImageFormat == OptionScreenshotFileType.JPG
                ? await ImageEditor.convertPngDataUrlToJpegBlobForDiscord(dataUrl)
                : Utils.b64toBlob(dataUrl)
            if(requestData) { // A screenshot from a reward
                const userData = await TwitchHelixHelper.getUserById(requestData.userId)
                const authorName = userData?.display_name ?? ''

                // Sign
                const action = new ActionSign()
                action.title = screenshotsConfig.callback.signTitle
                action.imageSrc = dataUrl
                action.subtitle = authorName
                action.durationMs = screenshotsConfig.callback.signTitle_forMs
                modules.sign.enqueueSign(action)

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
                const action = new ActionSign()
                action.title = screenshotsConfig.callback.signTitle
                action.imageSrc = dataUrl
                action.subtitle = screenshotsConfig.callback.signManualSubtitle
                action.durationMs = screenshotsConfig.callback.signTitle_forMs
                modules.sign.enqueueSign(action)

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
                const action = new ActionSign()
                action.title = screenshotsConfig.callback.signTitle
                action.imageSrc = dataUrl
                action.subtitle = authorName
                action.durationMs = screenshotsConfig.callback.signTitle_forMs
                modules.sign.enqueueSign(action)

                // Discord
                const webhooks = DataUtils.ensureDataArray(screenshotsConfig.callback.discordWebhooksSSSVR) ?? []
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
            switch(data.Input) {
                case "Proximity": if(data.Source == 'Head') {
                    // TODO: This is unreliable as it does not always register, and dashboard will mess it up.
                    // modules.obs.toggleSource(Config.obs.rewards[Keys.KEY_ROOMPEEK], !data.value)
                    console.log(`OpenVR2WS: Headset proximity changed: ${data.State}`)
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
            /* TODO: Reimplement this
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
            */
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
    // endregion
}