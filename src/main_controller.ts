import Config from './statics/config.js'
import LogWriter from './modules/log.js'
import {IDictionaryEntry} from './interfaces/isettings.js'
import Callbacks from './callbacks.js'
import StatesSingleton from './base/states_singleton.js'
import Utils from './base/utils.js'
import {Actions} from './actions.js'
import Color from './statics/colors.js'
import Rewards from './rewards.js'
import Functions from './functions.js'
import ModulesSingleton from './modules_singleton.js'
import Settings from './modules/settings.js'

export default class MainController {
    public static async init() {
        if(Config.controller.saveConsoleOutputToSettings) LogWriter.init()

        // Check configs
        const cfgPropCount = Object.keys(Config).length
        const cfgPropTotal = 14
        if(cfgPropCount < cfgPropTotal) {
            Utils.log(`Warning: Config is incomplete, only ${cfgPropCount}/${cfgPropTotal} set!`, Color.Red, true, true)
        }

        // Make sure settings are pre-cached
        await Settings.loadSettings(Settings.TTS_BLACKLIST)
        await Settings.loadSettings(Settings.TTS_USER_NAMES)
        await Settings.loadSettings(Settings.TTS_USER_VOICES)
        await Settings.loadSettings(Settings.TWITCH_CREDENTIALS)
        await Settings.loadSettings(Settings.TWITCH_REWARDS)
        await Settings.loadSettings(Settings.TWITCH_REWARD_REDEMPTIONS)
        await Settings.loadSettings(Settings.TTS_DICTIONARY)
        await Settings.loadSettings(Settings.TWITCH_CLIPS)
        await Settings.loadSettings(Settings.EVENT_COUNTERS_INCREMENTAL)
        await Settings.loadSettings(Settings.EVENT_COUNTERS_ACCUMULATING)
        await Settings.loadSettings(Settings.QUOTES)

        const modules = ModulesSingleton.getInstance()

        const dictionarySettings = Settings.getFullSettings<IDictionaryEntry>(Settings.TTS_DICTIONARY)
        modules.tts.setDictionary(dictionarySettings ?? [])

        
        const channelTokens = await Settings.pullSetting(Settings.TWITCH_CREDENTIALS, 'userName', Config.twitch.channelName)
        const chatbotTokens = await Settings.pullSetting(Settings.TWITCH_CREDENTIALS, 'userName', Config.twitch.chatbotName)
        if(!channelTokens) {
            document.location.href = 'login.php?missing=channel&missingName='+Config.twitch.channelName
            return
        }
        if(!chatbotTokens) {
            document.location.href = 'login.php?missing=chatbot&missingName='+Config.twitch.chatbotName
            return
        }

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
        await modules.twitchHelix.init()
        if(Config.controller.websocketsUsed.twitchPubsub) await modules.twitchPubsub.init()

        modules.pipe.setOverlayTitle("Streaming Widget")

        Functions.setEmptySoundForTTS()

        // Steam Web API intervals
        MainController.startSteamAchievementsInterval()
        
        if(!Config.controller.websocketsUsed.openvr2ws) {
            MainController.startSteamPlayerSummaryInterval()
            if(Config.steam.playerSummaryIntervalMs > 0) {
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
        modules.twitch.init(Config.controller.websocketsUsed.twitchChat)
        if(Config.controller.websocketsUsed.openvr2ws) modules.openvr2ws.init()
        if(Config.controller.websocketsUsed.pipe) modules.pipe.init()
        if(Config.controller.websocketsUsed.obs) modules.obs.init()
        if(Config.controller.websocketsUsed.sssvr) modules.sssvr.init()
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

    public static startSteamPlayerSummaryInterval() {
        const states = StatesSingleton.getInstance()
        if(
            Config.steam.playerSummaryIntervalMs 
            && states.steamPlayerSummaryIntervalHandle == -1 
            && !ModulesSingleton.getInstance().openvr2ws.isConnected
        ) {
            Utils.log('Starting Steam player summary interval', Color.Green)
            Functions.loadPlayerSummary() // Get initial state immidately
            states.steamPlayerSummaryIntervalHandle = setInterval(() => {
                Functions.loadPlayerSummary()
            }, Config.steam.playerSummaryIntervalMs)
        }
    }

    public static startSteamAchievementsInterval() {
        if(Config.steam.achievementsIntervalMs) {
            Utils.log('Starting Steam achievements interval', Color.Green)
            const states = StatesSingleton.getInstance()
            states.steamAchievementsIntervalHandle = setInterval(() => {
                Functions.loadAchievements()
            }, Config.steam.achievementsIntervalMs)
        }
    }
}