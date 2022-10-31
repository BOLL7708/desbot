import Config from '../ClassesStatic/Config.js'
import LogWriter from '../ClassesStatic/Log.js'
import Callbacks from './Callbacks.js'
import StatesSingleton from '../Singletons/StatesSingleton.js'
import Utils from '../ClassesStatic/Utils.js'
import {Actions} from './Actions.js'
import Color from '../ClassesStatic/Colors.js'
import Rewards from './Rewards.js'
import Functions from './Functions.js'
import ModulesSingleton from '../Singletons/ModulesSingleton.js'
import DB from '../ClassesStatic/DB.js'
import {
    SettingAccumulatingCounter,
    SettingDictionaryEntry, SettingIncrementingCounter, SettingStreamQuote, SettingTwitchClip,
    SettingTwitchRedemption,
    SettingTwitchReward,
    SettingTwitchTokens,
    SettingUserMute,
    SettingUserName,
    SettingUserVoice
} from '../Classes/_Settings.js'
import {IDictionaryEntry} from '../Classes/Dictionary.js'
import Auth from '../ClassesStatic/Auth.js'
import PasswordForm from './PasswordForm.js'

export default class MainController {
    public static async init() {
        const authed = await Auth.checkIfAuthed()
        if(!authed) {
            PasswordForm.spawn()
            return
        }
        if(Config.controller.saveConsoleOutputToSettings) LogWriter.init()

        // Check configs
        const cfgPropCount = Object.keys(Config).length
        const cfgPropTotal = 14
        if(cfgPropCount < cfgPropTotal) {
            Utils.log(`Warning: Config is incomplete, only ${cfgPropCount}/${cfgPropTotal} set!`, Color.Red, true, true)
        }

        // Make sure settings are pre-cached
        await DB.loadSettingsDictionary(new SettingUserMute())
        await DB.loadSettingsDictionary(new SettingUserName())
        await DB.loadSettingsDictionary(new SettingUserVoice())
        await DB.loadSettingsDictionary(new SettingTwitchTokens())
        await DB.loadSettingsDictionary(new SettingTwitchReward())
        await DB.loadSettingsDictionary(new SettingTwitchRedemption())
        const dictionarySettings = await DB.loadSettingsDictionary(new SettingDictionaryEntry())
        await DB.loadSettingsDictionary(new SettingTwitchClip())
        await DB.loadSettingsDictionary(new SettingIncrementingCounter())
        await DB.loadSettingsDictionary(new SettingAccumulatingCounter())
        await DB.loadSettingsArray(new SettingStreamQuote())

        const modules = ModulesSingleton.getInstance()
        if(dictionarySettings) {
            // TODO: Make a custom mapping function for this.
            const dictionary: IDictionaryEntry[] = []
            for(const [key, dictionaryEntry] of Object.entries(dictionarySettings)) {
                const entry: IDictionaryEntry = {
                    original: key,
                    substitute: dictionaryEntry.substitute
                }
                dictionary.push(entry)
            }
            modules.tts.setDictionary(dictionary ?? [])
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
        await modules.twitch.init(Config.controller.websocketsUsed.twitchChat)
        if(Config.controller.websocketsUsed.openvr2ws) modules.openvr2ws.init()
        if(Config.controller.websocketsUsed.pipe) modules.pipe.init()
        if(Config.controller.websocketsUsed.obs) modules.obs.init()
        if(Config.controller.websocketsUsed.sssvr) modules.sssvr.init()
        if(Config.controller.websocketsUsed.sdrelay) modules.streamDeckRelay.init()
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
        if(
            Config.steam.playerSummaryIntervalMs 
            && states.steamPlayerSummaryIntervalHandle == -1 
            && !ModulesSingleton.getInstance().openvr2ws.isConnected
        ) {
            Utils.log('Starting Steam player summary interval', Color.Green)
            await Functions.loadPlayerSummary() // Get initial state immidately
            states.steamPlayerSummaryIntervalHandle = setInterval(async() => {
                await Functions.loadPlayerSummary()
            }, Config.steam.playerSummaryIntervalMs)
        }
    }

    public static async startSteamAchievementsInterval() {
        if(Config.steam.achievementsIntervalMs) {
            Utils.log('Starting Steam achievements interval', Color.Green)
            const states = StatesSingleton.getInstance()
            states.steamAchievementsIntervalHandle = setInterval(async() => {
                await Functions.loadAchievements()
            }, Config.steam.achievementsIntervalMs)
        }
    }
}