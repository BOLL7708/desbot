class MainController {   
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
        await Settings.loadSettings(Settings.TWITCH_TOKENS)
        await Settings.loadSettings(Settings.TWITCH_REWARDS)
        await Settings.loadSettings(Settings.TWITCH_REWARD_REDEMPTIONS)
        await Settings.loadSettings(Settings.TTS_DICTIONARY)
        await Settings.loadSettings(Settings.TWITCH_CLIPS)
        await Settings.loadSettings(Settings.TWITCH_REWARD_COUNTERS)
        await Settings.loadSettings(Settings.QUOTES)
        await Settings.loadSettings(Settings.IKEA_TRADFRI)

        const modules = ModulesSingleton.getInstance()

        const dictionarySettings = Settings.getFullSettings<IDictionaryEntry>(Settings.TTS_DICTIONARY)
        modules.tts.setDictionary(dictionarySettings ?? [])

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