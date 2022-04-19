class MainController {   
    public static async init() {
        if(Config.controller.saveConsoleOutputToSettings) LogWriter.init()
        const modules = ModulesSingleton.getInstance()

        // Make sure settings are pre-cached
        await Settings.loadSettings(Settings.TTS_BLACKLIST)
        await Settings.loadSettings(Settings.TTS_USER_NAMES)
        await Settings.loadSettings(Settings.TTS_USER_VOICES)
        await Settings.loadSettings(Settings.TWITCH_TOKENS)
        await Settings.loadSettings(Settings.TWITCH_REWARDS)
        await Settings.loadSettings<IDictionaryEntry>(Settings.TTS_DICTIONARY).then(dictionary => modules.tts.setDictionary(dictionary ?? []))
        await Settings.loadSettings(Settings.TWITCH_CLIPS)
        await Settings.loadSettings(Settings.TWITCH_REWARD_COUNTERS)

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

        modules.pipe.setOverlayTitle("Streaming Widget")

        Functions.setEmptySoundForTTS()
        Functions.appIdCallback('', false)

        // Steam Web API intervals
        MainController.startSteamAchievementsInterval()
        MainController.startSteamPlayerSummaryInterval()
        if(!Config.controller.websocketsUsed.openvr2ws) {
            
            if(Config.steam.playerSummaryIntervalMs > 0) {
                await Functions.loadPlayerSummary()
            }
        }

        // Run init on classes that register things in the modules.
        Commands.init()
        Rewards.init()
        AutoRewards.init()
        Callbacks.init()

        /*
        .####.##....##.####.########
        ..##..###...##..##.....##...
        ..##..####..##..##.....##...
        ..##..##.##.##..##.....##...
        ..##..##..####..##.....##...
        ..##..##...###..##.....##...
        .####.##....##.####....##...
        */
        modules.twitch.init(Config.controller.websocketsUsed.twitchChat, Config.controller.websocketsUsed.twitchPubsub)
        if(Config.controller.websocketsUsed.openvr2ws) modules.openvr2ws.init()
        if(Config.controller.websocketsUsed.pipe) modules.pipe.init()
        if(Config.controller.websocketsUsed.obs) modules.obs.init()
        if(Config.controller.websocketsUsed.screenshots) modules.sssvr.init()
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
        if(Config.steam.playerSummaryIntervalMs && !ModulesSingleton.getInstance().openvr2ws.isConnected) {
            Utils.log('Starting Steam player summary interval', Color.Green)
            Functions.loadPlayerSummary() // Get initial state immidately
            const states = StatesSingleton.getInstance()
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