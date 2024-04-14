import EnlistData from '../Objects/Data/EnlistData.js'
import AuthUtils from '../Utils/AuthUtils.js'
import PasswordForm from './PasswordForm.js'
import DataBaseHelper from '../Helpers/DataBaseHelper.js'
import ModulesSingleton from '../Singletons/ModulesSingleton.js'
import {DataUtils} from '../Objects/Data/DataUtils.js'
import TwitchHelixHelper from '../Helpers/TwitchHelixHelper.js'
import StatesSingleton from '../Singletons/StatesSingleton.js'
import Functions from './Functions.js'
import Rewards from './Rewards.js'
import {Actions} from './Actions.js'
import Callbacks from './Callbacks.js'
import TwitchTokensHelper from '../Helpers/TwitchTokensHelper.js'
import Utils from '../Utils/Utils.js'
import {SettingUser} from '../Objects/Data/Setting/SettingUser.js'
import {SettingTwitchClip, SettingTwitchRedemption, SettingTwitchReward, SettingTwitchTokens} from '../Objects/Data/Setting/SettingTwitch.js'
import {SettingDictionaryEntry} from '../Objects/Data/Setting/SettingDictionary.js'
import {SettingAccumulatingCounter, SettingIncrementingCounter} from '../Objects/Data/Setting/SettingCounters.js'
import {SettingStreamQuote} from '../Objects/Data/Setting/SettingStream.js'
import {ConfigController} from '../Objects/Data/Config/ConfigController.js'
import {ConfigSteam} from '../Objects/Data/Config/ConfigSteam.js'
import Color from '../Constants/ColorConstants.js'

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
        const controllerConfig = await DataBaseHelper.loadMain(new ConfigController())
        if(controllerConfig.useWebsockets.twitchEventSub) modules.twitchEventSub.init().then()

        modules.pipe.setOverlayTitle("desbot")

        Functions.setEmptySoundForTTS().then()

        // Steam Web API intervals
        MainController.startSteamAchievementsInterval().then()

        // TODO: Should not the player summary be active at all time in case the user has websockets on but not playing VR?
        if(!controllerConfig.useWebsockets.openvr2ws) {
            MainController.startSteamPlayerSummaryInterval().then()
            const steamConfig = await DataBaseHelper.loadMain(new ConfigSteam())
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
        const steamConfig = await DataBaseHelper.loadMain(new ConfigSteam())
        if(
            steamConfig.playerSummaryIntervalMs
            && states.steamPlayerSummaryIntervalHandle == -1 
            && !ModulesSingleton.getInstance().openvr2ws.isConnected
        ) {
            Utils.log('Starting Steam player summary interval', Color.Green)
            await Functions.loadPlayerSummary() // Get initial state immidately
            states.steamPlayerSummaryIntervalHandle = setInterval(async() => {
                await Functions.loadPlayerSummary()
            }, steamConfig.playerSummaryIntervalMs)
        }
    }

    public static async startSteamAchievementsInterval() {
        const steamConfig = await DataBaseHelper.loadMain(new ConfigSteam())
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