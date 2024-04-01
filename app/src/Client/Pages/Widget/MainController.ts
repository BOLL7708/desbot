import EnlistData from '../../../Shared/Objects/EnlistData.js'
import AuthUtils from '../../../Shared/Classes/AuthUtils.js'
import PasswordForm from './PasswordForm.js'
import DataBaseHelper from '../../../Shared/Classes/DataBaseHelper.js'
import ModulesSingleton from '../../../Shared/Singletons/ModulesSingleton.js'
import {DataUtils} from '../../../Shared/Objects/DataUtils.js'
import TwitchHelixHelper from '../../../Shared/Classes/TwitchHelixHelper.js'
import StatesSingleton from '../../../Shared/Singletons/StatesSingleton.js'
import Functions from './Functions.js'
import Rewards from './Rewards.js'
import {Actions} from './Actions.js'
import Callbacks from './Callbacks.js'
import TwitchTokensHelper from '../../../Shared/Classes/TwitchTokensHelper.js'
import Utils from '../../../Shared/Classes/Utils.js'
import {SettingUser} from '../../../Shared/Objects/Setting/SettingUser.js'
import {SettingTwitchClip, SettingTwitchRedemption, SettingTwitchReward, SettingTwitchTokens} from '../../../Shared/Objects/Setting/SettingTwitch.js'
import {SettingDictionaryEntry} from '../../../Shared/Objects/Setting/SettingDictionary.js'
import {SettingAccumulatingCounter, SettingIncrementingCounter} from '../../../Shared/Objects/Setting/SettingCounters.js'
import {SettingStreamQuote} from '../../../Shared/Objects/Setting/SettingStream.js'
import {ConfigController} from '../../../Shared/Objects/Config/ConfigController.js'
import {ConfigSteam} from '../../../Shared/Objects/Config/ConfigSteam.js'
import Color from '../../../Shared/Classes/ColorConstants.js'

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