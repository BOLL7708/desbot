import Config from '../Classes/Config.js'
import {ICredentialsConfig} from '../Interfaces/icredentials.js'
import {ITwitchConfig} from '../Interfaces/itwitch.js'
import {IControllerConfig} from '../Interfaces/icontroller.js'
import {ITwitchChatConfig} from '../Interfaces/itwitch_chat.js'
import {IScreenshotConfig} from '../Interfaces/iscreenshots.js'

/*
..######..########..########.########..########.##....##.########.####....###....##........######.
.##....##.##.....##.##.......##.....##.##.......###...##....##.....##....##.##...##.......##....##
.##.......##.....##.##.......##.....##.##.......####..##....##.....##...##...##..##.......##......
.##.......########..######...##.....##.######...##.##.##....##.....##..##.....##.##........######.
.##.......##...##...##.......##.....##.##.......##..####....##.....##..#########.##.............##
.##....##.##....##..##.......##.....##.##.......##...###....##.....##..##.....##.##.......##....##
..######..##.....##.########.########..########.##....##....##....####.##.....##.########..######.
*/
Config.credentials = <ICredentialsConfig> {
    OBSPassword: '',
    OpenVR2WSPassword: '',
    GoogleTTSApiKey: '',
    PhilipsHueUsername: '',
    DiscordWebhooks: {
        'DiscordChat': 'The webhook URL you want to use for logging Twitch chat',
        'DiscordVRScreenshot': 'The webhook URL you want to use for VR screenshots',
        'DiscordOBSScreenshot': 'The webhook URL you want to use for OBS screenshots',
        'ChannelTrophy': 'The webhook URL you want to use for the channel trophy',
        'CallbackAchievement': 'The webhook URL you want to use for the achievement callback',
        'ChannelTrophyStats': 'The webhook URL you want to use for channel trophy statistics',
        'Clips': 'The webhook URL you want to use for Twitch clips'
    },
    SteamWebAPIKey: '',
    SteamUserID: ''
}

/*
..######...#######..##....##.########.########...#######..##.......##.......########.########.
.##....##.##.....##.###...##....##....##.....##.##.....##.##.......##.......##.......##.....##
.##.......##.....##.####..##....##....##.....##.##.....##.##.......##.......##.......##.....##
.##.......##.....##.##.##.##....##....########..##.....##.##.......##.......######...########.
.##.......##.....##.##..####....##....##...##...##.....##.##.......##.......##.......##...##..
.##....##.##.....##.##...###....##....##....##..##.....##.##.......##.......##.......##....##.
..######...#######..##....##....##....##.....##..#######..########.########.########.##.....##
*/
Config.controller = <IControllerConfig> { // Set defaults for the widget
    defaults: {
        pipeAllChat: true,
        ttsForAll: true,
        pingForChat: true,
        logChatToDiscord: true,
        useGameSpecificRewards: true,
        updateTwitchGameCategory: true,
        runRemoteCommands: false
    },
    gameDefaults: {
        // [Games.YOUR_GAME]: { pipeAllChat: false }
    },
    websocketsUsed: {
        twitchChat: true,
        twitchPubSub: true,
        twitchEventSub: true,
        obs: true,
        openvr2ws: false,
        pipe: false,
        relay: false,
        sssvr: false,
        sdrelay: false
    },
    commandPermissionsDefault: {
        streamer: true,
        moderators: true,
        VIPs: false,
        subscribers: false,
        everyone: false
    },
    speechReferences: {
        /*
        .######..######..##..##..######..#####..
        .##........##.....####...##......##..##.
        .####......##......##....####....##..##.
        .##........##.....####...##......##..##.
        .##......######..##..##..######..#####..
        */
        'Scale': [
            'World scale set to %userNumber%',
            'World scale will change from %from to %to% over %mins minutes',
            'World scale sequence finished',
            'World scale sequence not set',
            'World scale sequence terminated'
        ],
        'ChannelTrophyStats': [
            'Initiating posting all Channel Trophy statistics',
            'Completed posting all Channel Trophy statistics',
            'Initiating posting of Channel Trophy statistics',
            'Completed posting of Channel Trophy statistics',
            'Failed to post Channel Trophy statistics'
        ],
        'Clips': [
            'Starting Twitch clip import.',
            'There are %count1 old clips, %count2 new clips.',
            'Finished posting %count new clips.'
        ],
        'CallbackAppID': [
            'Twitch game updated: %game',
            'Twitch game not matched: %game'
        ],
        'ClearRedemptions': [
            'Initiating clearing of reward redemptions queue',
            'Completed clearing the reward redemptions queue, set %count out of %total to fulfilled',
            'There were no reward redemptions in the queue to clear'
        ],
        'ResetIncrementingEvents': [
            'Initiating reset of incremental events',
            'Finished resetting %reset out of %total incremental events, skipping %skipped'
        ],
        'ResetAccumulatingEvents': [
            'Initiating reset of accumulating events',
            'Finished resetting %reset out of %total accumulating events, skipping %skipped'
        ],
        'Mod': [
            '%targetNick made moderator',
            '%targetNick could not be made moderator'
        ],
        'UnMod': [
            '%targetNick removed from moderators',
            '%targetNick could not be removed from moderators'
        ],
        'Vip': [
            '%targetNick made V I P',
            '%targetNick could not be made V I P'
        ],
        'UnVip': [
            '%targetNick removed from V I Ps',
            '%targetNick could not be removed from V I Ps'
        ],
        'Quote': 'Quote by %targetOrUserTag added',
        'GameReset': 'Currently running Steam game has been reset.',
        'ChatOn': 'Chat enabled',
        'ChatOff': 'Chat disabled',
        'PingOn': 'Chat ping enabled',
        'PingOff': 'Chat ping disabled',
        'LogOn': 'Logging enabled',
        'LogOff': 'Logging disabled',
        'Brightness': 'Headset brightness set to %value%',
        'RefreshRate': 'Headset refresh rate set to %value hertz',
        'VrViewEye': 'Output eye mode changed to %value',
        'GameRewardsOn': 'Game specific rewards enabled',
        'GameRewardsOff': 'Game specific rewards disabled',
    },
    chatReferences: {
        'Quote': '%targetTag said: "%text" (on: %date, game: %gameName)',
        'RefundRedemption': [
            '%targetTag was refunded: %cost points',
            'Failed to refund %targetTag anything.',
            '%targetTag has nothing to refund!'
        ],
        'Raid': [
            'Initiating raid on %targetTag, currently playing: %targetGame',
            'Stream title "%targetTitle", link to avoid preroll: %targetLink',
            'I could not find channel: "%userInput"'
        ],
        'Unraid': [
            'Raid cancelled.',
            'Could not cancel raid.'
        ]
    },
    saveConsoleOutputToSettings: false,
    secretChatSymbols: ['!'],
    channelTrophySettings: {
        label: 'Channel Trophy #%number\n%userName',
        rewardTitle: 'Held by %userName!',
        rewardPrompt: 'Currently held by %userName! %prompt Now costs %number points!',
        rewardCooldownMultiplier: 30,
        ttsOn: true,
        ttsName: '@%userName grabbed',
        ttsTrophy: 'trophy',
        uniqueNumbers: {
            /* 
            1234: { 
                speech: "%start the best trophy! Number %number is so cool!", 
                label: "Trippy Channel Trophy: %entry" 
            }
            */
        }
    }
}

/*
..######...######..########..########.########.##....##..######..##.....##..#######..########
.##....##.##....##.##.....##.##.......##.......###...##.##....##.##.....##.##.....##....##...
.##.......##.......##.....##.##.......##.......####..##.##.......##.....##.##.....##....##...
..######..##.......########..######...######...##.##.##..######..#########.##.....##....##...
.......##.##.......##...##...##.......##.......##..####.......##.##.....##.##.....##....##...
.##....##.##....##.##....##..##.......##.......##...###.##....##.##.....##.##.....##....##...
..######...######..##.....##.########.########.##....##..######..##.....##..#######.....##...
*/
Config.screenshots = <IScreenshotConfig> {
    SSSVRPort: 8807,
    callback: {
        discordManualTitle: 'Manual Screenshot',
        discordRewardTitle: 'Photograph: %text',
        discordRewardInstantTitle: 'Instant shot!',
        signTitle: 'Screenshot',
        signManualSubtitle: 'Manual shot!',
        signDurationMs: 5000,
        pipeEnabledForManual: false,
        pipeEnabledForRewards: [
            'Unknown' // Your screenshot reward key
        ],
        pipeMessagePreset:  {
            durationMs: 5000,
            configRef: 'database_group_key' // TODO: Is a DB reference to PresetPipeCustom
        },
        soundEffectForOBSScreenshots: {
            // srcEntries: '_assets/yoursound.wav',
        }
    }
}

/*
.########.##......##.####.########..######..##.....##.....######..##.....##....###....########
....##....##..##..##..##.....##....##....##.##.....##....##....##.##.....##...##.##......##...
....##....##..##..##..##.....##....##.......##.....##....##.......##.....##..##...##.....##...
....##....##..##..##..##.....##....##.......#########....##.......#########.##.....##....##...
....##....##..##..##..##.....##....##.......##.....##....##.......##.....##.#########....##...
....##....##..##..##..##.....##....##....##.##.....##....##....##.##.....##.##.....##....##...
....##.....###..###..####....##.....######..##.....##.....######..##.....##.##.....##....##...
*/
Config.twitchChat = <ITwitchChatConfig> {
    pipe: {
        durationMs: 5000,
        configRef: 'database_group_key'
    },
    audio: {
        srcEntries: '_assets/SOUND_FOR_EMPTY_CHAT_MESSAGE_NOTIFICATIONS.wav',
        volume: 0.5
    },
    speech: '%userNick said: %userInput'
}

/*
.########.##......##.####.########..######..##.....##
....##....##..##..##..##.....##....##....##.##.....##
....##....##..##..##..##.....##....##.......##.....##
....##....##..##..##..##.....##....##.......#########
....##....##..##..##..##.....##....##.......##.....##
....##....##..##..##..##.....##....##....##.##.....##
....##.....###..###..####....##.....######..##.....##
*/
Config.twitch = <ITwitchConfig> {
    commandPrefix: '!',
    allowWhisperCommands: false,
    remoteCommandPrefix: '!',
    remoteCommandChannel: '',       
    remoteCommandAllowedUsers: ['AllowedUser1', 'AllowedUser2'],
    announceSubs: [
        {tier: 0, gift: false, multi: false, message: '%userTag subbed with Prime'},
        {tier: 1000, gift: false, multi: false, message: '%userTag subbed with tier 1'},
        {tier: 2000, gift: false, multi: false, message: '%userTag subbed with tier 2'},
        {tier: 3000, gift: false, multi: false, message: '%userTag subbed with tier 3'},
        {tier: 1000, gift: true, multi: false, message: '%userTag gifted %targetTag a tier 1 sub'},
        {tier: 2000, gift: true, multi: false, message: '%userTag gifted %targetTag a tier 2 sub'},
        {tier: 3000, gift: true, multi: false, message: '%userTag gifted %targetTag a tier 3 sub'}
    ],
    announceCheers: [
        {bits: 1, message: '%userTag cheered %userBits bits! (will be the default message)'},
        {bits: 100, message: 'Wow %userTag cheered %userBits bits! (for 100 or more)'}
    ],

    defaultGameCategory: 'Games + Demos',
    gameTitleToCategoryOverride: {
        // 'Game Title from Steam': 'Twitch Category Name'
    },

    proxyChatBotName: 'RestreamBot',
    proxyChatFormat: /\[(\w*):\s(.+)\]\s(.+)/,

    ignoreModerators: [
        'RestreamBot'
    ],

    alwaysOnRewards: [ // Will be turned on unless they are in the other setting below to be disabled.
        'ChannelTrophy'
    ],
    alwaysOffRewards: [],

    rewardProfileDefault: {
        // 'YourReward': true,
    },
    rewardProfileDefaultVR: {
        // 'YourReward': true,
    },
    rewardProfileNoGame: {
        // 'YourReward': true,
    },
    rewardProfilePerGame: {
        // [GamesTemplate.A_GAME]: { 'YourReward': true, 'YourOtherReward': false }
    },

    turnOnRewardForGames: {
        // [GamesTemplate.A_GAME]: ['YourReward', 'YourOtherReward']
    },
    turnOffRewardForGames: {
        // [GamesTemplate.A_GAME]: ['YourReward', 'YourOtherReward']
    },
    turnOnRewardForOverlays: {
        // [OpenVR2WS.AN_OVERLAY_KEY]: ['YourReward', 'YourOtherReward']
    },

    eventOptionsDefault: {
        // 'YourReward': { multiTierMaxLevel: 2 }
    },
    eventOptionsPerGame: {
        // [GamesTemplate.A_GAME]: { 'YourReward': { multiTierMaxLevel: 5 } }
    }
}