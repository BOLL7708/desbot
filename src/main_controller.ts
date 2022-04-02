class MainController {
    private _modules = ModulesSingleton.getInstance()
    private _states = StatesSingleton.getInstance()


    constructor() {
        if(Config.controller.saveConsoleOutputToSettings) new LogWriter() // Saves log
        this.init() // To allow init to be async
    }
    
    private async init() {
        // Make sure settings are pre-cached
        await Settings.loadSettings(Settings.TTS_BLACKLIST)
        await Settings.loadSettings(Settings.TTS_USER_NAMES)
        await Settings.loadSettings(Settings.TTS_USER_VOICES)
        await Settings.loadSettings(Settings.TWITCH_TOKENS)
        await Settings.loadSettings(Settings.TWITCH_REWARDS)
        await Settings.loadSettings(Settings.TTS_DICTIONARY).then(dictionary => this._modules.tts.setDictionary(dictionary))
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
        await this._modules.twitchTokens.refreshToken()
        await this._modules.twitchHelix.init()

        this._modules.pipe.setOverlayTitle("Streaming Widget")

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
        this._modules.twitch.init(Config.controller.websocketsUsed.twitchChat, Config.controller.websocketsUsed.twitchPubsub)
        if(Config.controller.websocketsUsed.openvr2ws) this._modules.openvr2ws.init()
        if(Config.controller.websocketsUsed.pipe) this._modules.pipe.init()
        if(Config.controller.websocketsUsed.obs) this._modules.obs.init()
        if(Config.controller.websocketsUsed.screenshots) this._modules.sssvr.init()
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
        if(Config.steam.playerSummaryIntervalMs) {
            Utils.log('Starting Steam player summary interval', Color.Green)
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