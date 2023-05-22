import Config from '../../Classes/Config.js'
import LogWriter from '../../Classes/LogHelper.js'
import Callbacks from './Callbacks.js'
import StatesSingleton from '../../Singletons/StatesSingleton.js'
import Utils from '../../Classes/Utils.js'
import {Actions} from './Actions.js'
import Color from '../../Classes/ColorConstants.js'
import Rewards from './Rewards.js'
import Functions from './Functions.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import AuthUtils from '../../Classes/AuthUtils.js'
import PasswordForm from './PasswordForm.js'
import {SettingUser} from '../../Objects/Setting/User.js'
import {
    SettingTwitchClip,
    SettingTwitchRedemption,
    SettingTwitchReward,
    SettingTwitchTokens
} from '../../Objects/Setting/Twitch.js'
import {SettingDictionaryEntry} from '../../Objects/Setting/Dictionary.js'
import {SettingAccumulatingCounter, SettingIncrementingCounter} from '../../Objects/Setting/Counters.js'
import {SettingStreamQuote} from '../../Objects/Setting/Stream.js'
import {ConfigSteam} from '../../Objects/Config/Steam.js'
import TwitchHelixHelper from '../../Classes/TwitchHelixHelper.js'

export default class MainController {
    public static async init() {
        DataBaseHelper.setFillReferences(true)
        const authed = await AuthUtils.checkIfAuthed()
        if(!authed) {
            PasswordForm.spawn()
            return
        }
        if(Config.controller.saveConsoleOutputToSettings) LogWriter.init().then()

        // Check configs
        const cfgPropCount = Object.keys(Config).length
        const cfgPropTotal = 7
        if(cfgPropCount < cfgPropTotal) {
            Utils.log(`Warning: Config is incomplete, only ${cfgPropCount}/${cfgPropTotal} set!`, Color.Red, true, true)
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
        modules.tts.setDictionary(dictionarySettings)

        await TwitchHelixHelper.loadNamesForUsersWhoLackThem()

        /*
        .####.##....##.####.########
        ..##..###...##..##.....##...
        ..##..####..##..##.....##...
        ..##..##.##.##..##.....##...
        ..##..##..####..##.....##...
        ..##..##...###..##.....##...
        .####.##....##.####....##...
        */
        await modules.twitchTokens.refreshToken()
        if(Config.controller.websocketsUsed.twitchEventSub) modules.twitchEventSub.init().then()

        modules.pipe.setOverlayTitle("Streaming Widget")

        Functions.setEmptySoundForTTS()

        // Steam Web API intervals
        MainController.startSteamAchievementsInterval().then()
        
        if(!Config.controller.websocketsUsed.openvr2ws) {
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

        /*
        .####.##....##.####.########
        ..##..###...##..##.....##...
        ..##..####..##..##.....##...
        ..##..##.##.##..##.....##...
        ..##..##..####..##.....##...
        ..##..##...###..##.....##...
        .####.##....##.####....##...
        */
        await modules.twitch.init(Config.controller.websocketsUsed.twitchChat)
        if(Config.controller.websocketsUsed.openvr2ws) modules.openvr2ws.init().then()
        if(Config.controller.websocketsUsed.pipe) modules.pipe.init().then()
        if(Config.controller.websocketsUsed.obs) modules.obs.init()
        if(Config.controller.websocketsUsed.sssvr) modules.sssvr.init()
        if(Config.controller.websocketsUsed.sdrelay) modules.streamDeckRelay.init().then()
    }


    /*
    .####.##....##.########.########.########..##.....##....###....##........######.
    ..##..###...##....##....##.......##.....##.##.....##...##.##...##.......##....##
    ..##..####..##....##....##.......##.....##.##.....##..##...##..##.......##......
    ..##..##.##.##....##....######...########..##.....##.##.....##.##........######.
    ..##..##..####....##....##.......##...##....##...##..#########.##.............##
    ..##..##...###....##....##.......##....##....##.##...##.....##.##.......##....##
    .####.##....##....##....########.##.....##....###....##.....##.########..######.
    */

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
}