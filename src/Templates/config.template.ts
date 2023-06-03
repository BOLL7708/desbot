import Config from '../Classes/Config.js'
import {ICredentialsConfig} from '../Interfaces/icredentials.js'
import {ITwitchConfig} from '../Interfaces/itwitch.js'
import {IControllerConfig} from '../Interfaces/icontroller.js'
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
    DiscordWebhooks: {
        'Clips': 'The webhook URL you want to use for Twitch clips'
    }
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
    gameDefaults: {
        // [Games.YOUR_GAME]: { pipeAllChat: false }
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
    callback: {
        pipeEnabledForRewards: [
            'Unknown' // Your screenshot reward key
        ]
    }
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