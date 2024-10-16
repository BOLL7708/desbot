import {ConfigController, ConfigSteam, DataUtils, EnlistData, SettingAccumulatingCounter, SettingDictionaryEntry, SettingIncrementingCounter, SettingStreamQuote, SettingTwitchClip, SettingTwitchRedemption, SettingTwitchReward, SettingTwitchTokens, SettingUser} from '../../lib/index.mts'
import PasswordForm from '../../web/PasswordForm.mts'
import Color from '../Constants/ColorConstants.mts'
import DataBaseHelper from '../Helpers/DataBaseHelper.mts'
import TwitchHelixHelper from '../Helpers/TwitchHelixHelper.mts'
import TwitchTokensHelper from '../Helpers/TwitchTokensHelper.mts'
import ModulesSingleton from '../Singletons/ModulesSingleton.mts'
import StatesSingleton from '../Singletons/StatesSingleton.mts'
import AuthUtils from '../Utils/AuthUtils.mts'
import Utils from '../Utils/Utils.mts'
import {Actions} from './Actions.mts'
import Callbacks from './Callbacks.mts'
import Functions from './Functions.mts'
import Rewards from './Rewards.mts'

export default class MainController {
    public static async init() {
        EnlistData.run()
        const authed = await AuthUtils.checkIfAuthed()
        if(!authed) {
            PasswordForm.spawn()
            return
        }

        // Make sure settings are pre-cached
        await DataBaseHelper.loadAll(new SettingUser())
        await DataBaseHelper.loadAll(new SettingTwitchTokens())
        await DataBaseHelper.loadAll(new SettingTwitchReward())
        await DataBaseHelper.loadAll(new SettingTwitchRedemption())
        const dictionarySettings = await DataBaseHelper.loadAll(new SettingDictionaryEntry())
        await DataBaseHelper.loadAll(new SettingTwitchClip())
        await DataBaseHelper.loadAll(new SettingIncrementingCounter())
        await DataBaseHelper.loadAll(new SettingAccumulatingCounter())
        await DataBaseHelper.loadAll(new SettingStreamQuote())

        const modules = ModulesSingleton.getInstance()
        modules.tts.setDictionary(DataUtils.getKeyDataDictionary(dictionarySettings ?? {}))

        await TwitchHelixHelper.loadNamesForUsersWhoLackThem()

        // region Init
        await StatesSingleton.initInstance() // Init states
        await this.startTwitchTokenRefreshInterval() // Init Twitch tokens
        const controllerConfig = await DataBaseHelper.loadMain<ConfigController>(new ConfigController())
        if(controllerConfig.useWebsockets.twitchEventSub) modules.twitchEventSub.init().then()

        modules.pipe.setOverlayTitle("desbot").then()

        Functions.setEmptySoundForTTS().then()

        // Steam Web API intervals
        MainController.startSteamAchievementsInterval().then()

        // TODO: Should not the player summary be active at all time in case the user has websockets on but not playing VR?
        if(!controllerConfig.useWebsockets.openvr2ws) {
            MainController.startSteamPlayerSummaryInterval().then()
            const steamConfig = await DataBaseHelper.loadMain<ConfigSteam>(new ConfigSteam())
            if(steamConfig.playerSummaryIntervalMs > 0) {
                await Functions.loadPlayerSummary()
            }
        }

        // Run init on classes that register things in the modules.
        await Rewards.init()
        await Actions.init()
        await Callbacks.init()

        await modules.twitch.init(controllerConfig.useWebsockets.twitchChat)
        if(controllerConfig.useWebsockets.openvr2ws) modules.openvr2ws.init().then()
        if(controllerConfig.useWebsockets.pipe) modules.pipe.init().then()
        if(controllerConfig.useWebsockets.obs) modules.obs.init()
        if(controllerConfig.useWebsockets.sssvr) modules.sssvr.init()
        // if(controllerConfig.useWebsockets.sdrelay) modules.streamDeckRelay.init().then() // TODO

        // endregion
    }


    // region Intervals

    public static async startTwitchTokenRefreshInterval() {
        const states = StatesSingleton.getInstance()
        await TwitchTokensHelper.refreshToken()
        if(states.twitchTokenRefreshIntervalHandle == -1) {
            Utils.log('Starting Twitch token refresh interval', Color.Green)
            states.twitchTokenRefreshIntervalHandle = setInterval(async() => {
                await TwitchTokensHelper.refreshToken()
            }, 1000 * 60 * 45) // 45 minutes for a chunky margin
        }
    }

    public static async startSteamPlayerSummaryInterval() {
        const states = StatesSingleton.getInstance()
        const steamConfig = await DataBaseHelper.loadMain<ConfigSteam>(new ConfigSteam())
        if(
            steamConfig.playerSummaryIntervalMs
            && states.steamPlayerSummaryIntervalHandle == -1 
            && !ModulesSingleton.getInstance().openvr2ws.isConnected
        ) {
            Utils.log('Starting Steam player summary interval', Color.Green)
            await Functions.loadPlayerSummary() // Get initial state immediately
            states.steamPlayerSummaryIntervalHandle = setInterval(async() => {
                await Functions.loadPlayerSummary()
            }, steamConfig.playerSummaryIntervalMs)
        }
    }

    public static async startSteamAchievementsInterval() {
        const steamConfig = await DataBaseHelper.loadMain<ConfigSteam>(new ConfigSteam())
        if(steamConfig.achievementsIntervalMs) {
            Utils.log('Starting Steam achievements interval', Color.Green)
            const states = StatesSingleton.getInstance()
            states.steamAchievementsIntervalHandle = setInterval(async() => {
                await Functions.loadAchievements()
            }, steamConfig.achievementsIntervalMs)
        }
    }

    // endregion
}