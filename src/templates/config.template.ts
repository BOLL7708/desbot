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
    TwitchClientID: '',
    TwitchClientSecret: '',
    TwitchChannelRefreshToken: '',
    TwitchChatbotRefreshToken: '',
    PHPPassword: '',
    DiscordWebhooks: {
        [KeysTemplate.DISCORD_CHAT]: 'The webhook URL you want to use for logging Twitch chat',
        [KeysTemplate.DISCORD_VRSCREENSHOT]: 'The webhook URL you want to use for VR screenshots',
        [KeysTemplate.DISCORD_OBSSCREENSHOT]: 'The webhook URL you want to use for OBS screenshots',
        [KeysTemplate.REWARD_CHANNELTROPHY]: 'The webhook URL you want to use for the channel trophy',
        [KeysTemplate.CALLBACK_ACHIEVEMENT]: 'The webhook URL you want to use for the achievement callback',
        [KeysTemplate.COMMAND_CHANNELTROPHY_STATS]: 'The webhook URL you want to use for channel trophy statistics',
        [KeysTemplate.COMMAND_CLIPS]: 'The webhook URL you want to use for Twitch clips'
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
        updateTwitchGameCategory: true
    },
    gameDefaults: {
        // [Games.YOUR_GAME]: { pipeAllChat: false }
    },
    websocketsUsed: {
        twitchChat: true,
        twitchPubsub: true,
        obs: true,
        openvr2ws: false,
        pipe: false,
        sssvr: false
    },
    commandPermissionsDefault: {
        streamer: true,
        moderators: true,
        VIPs: false,
        subscribers: false,
        everyone: false
    },
    commandPermissionsOverrides: {
        [KeysTemplate.COMMAND_LOG_ON]: {moderators: false},
        [KeysTemplate.COMMAND_LOG_OFF]: {moderators: false},
        [KeysTemplate.COMMAND_TTS_NICK]: {VIPs: true},
        [KeysTemplate.COMMAND_BRIGHTNESS]: {moderators: false},
        [KeysTemplate.COMMAND_REFRESHRATE]: {moderators: false},
        [KeysTemplate.COMMAND_VRVIEWEYE]: {moderators: false},
        [KeysTemplate.COMMAND_GAME]: {everyone: true}
    },
    speechReferences: {
        /*
        .######..######..##..##..######..#####..
        .##........##.....####...##......##..##.
        .####......##......##....####....##..##.
        .##........##.....####...##......##..##.
        .##......######..##..##..######..#####..
        */
        [KeysTemplate.COMMAND_TTS_ON]: [
            'Global TTS activated', 
            'Global TTS already on'
        ],
        [KeysTemplate.COMMAND_TTS_OFF]: [
            'Global TTS terminated', 
            'Global TTS already off'
        ],
        [KeysTemplate.COMMAND_TTS_MUTE]: [
            '%targetName has lost their voice',
            '%targetName is already muted'
        ],
        [KeysTemplate.COMMAND_TTS_UNMUTE]: [
            '%targetName has regained their voice', 
            '%targetName is not muted'
        ],
        [KeysTemplate.COMMAND_SCALE]: [
            'World scale set to %userNumber%',
            'World scale will change from %from to %to% over %mins minutes',
            'World scale sequence finished',
            'World scale sequence not set',
            'World scale sequence terminated'
        ],
        [KeysTemplate.COMMAND_CHANNELTROPHY_STATS]: [
            'Initiating posting all Channel Trophy statistics',
            'Completed posting all Channel Trophy statistics',
            'Initiating posting of Channel Trophy statistics',
            'Completed posting of Channel Trophy statistics',
            'Failed to post Channel Trophy statistics'
        ],
        [KeysTemplate.COMMAND_CLIPS]: [
            'Starting Twitch clip import.',
            'There are %count1 old clips, %count2 new clips.',
            'Finished posting %count new clips.'
        ],
        [KeysTemplate.CALLBACK_APPID]: [
            'Twitch game updated: %game',
            'Twitch game not matched: %game'
        ],
        [KeysTemplate.COMMAND_CLEAR_REDEMPTIONS]: [
            'Initiating clearing of reward redemptions queue',
            'Completed clearing the reward redemptions queue, set %count out of %total to fulfilled',
            'There were no reward redemptions in the queue to clear'
        ],
        [KeysTemplate.COMMAND_RESET_INCREWARD]: [
            'Initiating reset of incremental rewards',
            'Finished resetting %reset out of %total incremental rewards, skipping %skipped'
        ],
        [KeysTemplate.COMMAND_QUOTE]: 'Quote by %targetTag added',
        [KeysTemplate.COMMAND_TTS_NICK]: '%targetName is now called %targetNick',
        [KeysTemplate.COMMAND_GAMERESET]: 'Currently running Steam game has been reset.',
        [KeysTemplate.COMMAND_DICTIONARY]: '%word is now said as %substitute',
        [KeysTemplate.COMMAND_CHAT_ON]: 'Chat enabled',
        [KeysTemplate.COMMAND_CHAT_OFF]: 'Chat disabled',
        [KeysTemplate.COMMAND_PING_ON]: 'Chat ping enabled',
        [KeysTemplate.COMMAND_PING_OFF]: 'Chat ping disabled',
        [KeysTemplate.COMMAND_LOG_ON]: 'Logging enabled',
        [KeysTemplate.COMMAND_LOG_OFF]: 'Logging disabled',
        [KeysTemplate.COMMAND_BRIGHTNESS]: 'Headset brightness set to %value%',
        [KeysTemplate.COMMAND_REFRESHRATE]: 'Headset refresh rate set to %value hertz',
        [KeysTemplate.COMMAND_VRVIEWEYE]: 'Output eye mode changed to %value',
        [KeysTemplate.COMMAND_GAMEREWARDS_ON]: 'Game specific rewards enabled',
        [KeysTemplate.COMMAND_GAMEREWARDS_OFF]: 'Game specific rewards disabled',
    },
    chatReferences: {
        [KeysTemplate.COMMAND_DICTIONARY]: [
            'There is no entry for "%word" in the dictionary.',
            '"%word" is set to "%value" in the dictionary.'
        ],
        [KeysTemplate.COMMAND_TTS_NICK]: '%targetName is called: "%targetNick"',
        [KeysTemplate.COMMAND_QUOTE]: '%targetTag said: "%text" (on: %date, game: %gameName)',
        [KeysTemplate.COMMAND_REFUND_REDEMPTION]: [
            '%targetTag was refunded: %cost points',
            'Failed to refund %targetTag anything.',
            '%targetTag has nothing to refund!'
        ],
        [KeysTemplate.COMMAND_RAID]: [
            'Initiating raid on %targetTag, currently playing: %targetGame',
            'Stream title "%targetTitle", link to avoid preroll: %targetLink',
            'I could not find channel: "%userInput"'
        ],
        [KeysTemplate.COMMAND_UNRAID]: [
            'Raid cancelled.',
            'Could not cancel raid.'
        ]
    },
    defaultTwitchGameCategory: 'Games + Demos',
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
..######....#######...#######...######...##.......########
.##....##..##.....##.##.....##.##....##..##.......##......
.##........##.....##.##.....##.##........##.......##......
.##...####.##.....##.##.....##.##...####.##.......######..
.##....##..##.....##.##.....##.##....##..##.......##......
.##....##..##.....##.##.....##.##....##..##.......##......
..######....#######...#######...######...########.########
*/
Config.google = <IGoogleConfig> {
    speakerTimeoutMs: 5000,
    randomizeVoice: false,
    randomizeVoiceLanguageFilter: 'en-',
    defaultVoice: '',
    speakingRateOverride: undefined,
    skipSaid: false,
    cleanTextConfig: {
        removeBitEmotes: false,
        keepCase: false,
        replaceUserTags: true,
        removeParantheses: true,
        reduceRepeatedCharacters: true,
        replaceBigNumbers: true,
        replaceBigNumbersWith: '"big number"',
        replaceBigNumbersWithDigits: 7,
        replaceLinks: true,
        replaceLinksWith: '"link"',
        removeUnicodeEmojis: true
    },
    dictionaryConfig: {
        skipForAnnouncements: true,
        replaceWordsWithAudio: true,
        wordToAudioConfig: {
            // 'word|otherword|morewords': { src: 'https://yourhost.com/audiofiles/youraudio.wav' }
        }
    }
}

/*
..######..########.########....###....##.....##
.##....##....##....##.........##.##...###...###
.##..........##....##........##...##..####.####
..######.....##....######...##.....##.##.###.##
.......##....##....##.......#########.##.....##
.##....##....##....##.......##.....##.##.....##
..######.....##....########.##.....##.##.....##
*/
Config.steam = <ISteamConfig> {
    playerSummaryIntervalMs: 0,
    achievementsIntervalMs: 0,
    ignoreAchievementsOlderThanHours: 24,
    ignoredAppIds: [],
    achievementSettings: {
        discordFooter: 'Progress: %progress, global rate: %rate',
        twitchChatMessage: 'Achievement %progress unlocked: %name (%text, %rate)'
    }
}

/*
..#######..########...######.
.##.....##.##.....##.##....##
.##.....##.##.....##.##......
.##.....##.########...######.
.##.....##.##.....##.......##
.##.....##.##.....##.##....##
..#######..########...######.
*/
Config.obs = <IObsConfig> { // Toggle sources in OBS on and off with the obs-websocket plugin.
    port: 4445,
    sourceGroups: [],
    filterGroups: [],
    filterOnScenes: [''], // WIP
    sourceScreenshotConfig: {
        embedPictureFormat: 'png',
        saveToFilePath: 'C:\\A file path\\on your\\disk\\',
		discordDescription: 'OBS Screenshot',
        discordGameTitle: 'Your Game',
        signTitle: 'Screenshot',
        signDurationMs: 10000
    }
}

/*
.########..####.########..########
.##.....##..##..##.....##.##......
.##.....##..##..##.....##.##......
.########...##..########..######..
.##.........##..##........##......
.##.........##..##........##......
.##........####.##........########
*/
Config.pipe = <IPipeConfig> {
    port: 8077,
    showRewardsWithKeys: [
        KeysTemplate.REWARD_TTSSPEAK
    ],
    useCustomChatNotification: false,
    customChatMessageConfig: {
        width: 500,
        top: 120,
        margin: 0,
        cornerRadius: 0,
        textMaxHeight: 240,
        font: { size: 32, family: 'Arial', color: '#ddd', lineSpacing: 1.05 }
    },
    customChatNameConfig: {
        rect: { x: 100, y: 100, w: 400, h: 100 },
        font: { size: 32, family: 'Arial Black', outlines: [
            { color: 'white', width: 8 },
            { color: 'black', width: 4 }
        ] }
    },
    customChatAvatarConfig: {
        cornerRadius: 0,
        rect: { x: 0, y: 0, w: 100, h: 100 }
    },
    cleanTextConfig: {
        removeBitEmotes: false,
        keepCase: true,
        replaceUserTags: false,
        removeParantheses: true,
        reduceRepeatedCharacters: true,
        replaceBigNumbers: false,
        replaceLinks: true,
        replaceLinksWith: 'link',
        removeUnicodeEmojis: false
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
        pipeEnabledForRewards: <string[]> [
            // KeysTemplate.YOUR_SCREENSHOT_REWARD_KEY
        ],
        pipeMessagePreset: undefined,
        soundEffectForOBSScreenshots: {
            // src: '_assets/yoursound.wav',
        }
    }
}

/*
.########..####..######...######...#######..########..########.
.##.....##..##..##....##.##....##.##.....##.##.....##.##.....##
.##.....##..##..##.......##.......##.....##.##.....##.##.....##
.##.....##..##...######..##.......##.....##.########..##.....##
.##.....##..##........##.##.......##.....##.##...##...##.....##
.##.....##..##..##....##.##....##.##.....##.##....##..##.....##
.########..####..######...######...#######..##.....##.########.
*/
Config.discord = <IDiscordConfig> {
    remoteScreenshotEmbedColor: '#000000',
    manualScreenshotEmbedColor: '#FFFFFF',
    prefixCheer: '*Cheer*: ',
    prefixReward: '*Reward*: '
}

/*
.########..##.....##.####.##.......####.########...######..##.....##.##.....##.########
.##.....##.##.....##..##..##........##..##.....##.##....##.##.....##.##.....##.##......
.##.....##.##.....##..##..##........##..##.....##.##.......##.....##.##.....##.##......
.########..#########..##..##........##..########...######..#########.##.....##.######..
.##........##.....##..##..##........##..##..............##.##.....##.##.....##.##......
.##........##.....##..##..##........##..##........##....##.##.....##.##.....##.##......
.##........##.....##.####.########.####.##.........######..##.....##..#######..########
*/
Config.philipshue = <IPhilipsHueConfig> { // Control Philips Hue lights
    serverPath: 'http://a-local-IP',
    lightsIds: [] // IDs of lights to affect with the color rewards
}

/*
..#######..########..########.##....##.##.....##.########...#######..##......##..######.
.##.....##.##.....##.##.......###...##.##.....##.##.....##.##.....##.##..##..##.##....##
.##.....##.##.....##.##.......####..##.##.....##.##.....##........##.##..##..##.##......
.##.....##.########..######...##.##.##.##.....##.########...#######..##..##..##..######.
.##.....##.##........##.......##..####..##...##..##...##...##........##..##..##.......##
.##.....##.##........##.......##...###...##.##...##....##..##........##..##..##.##....##
..#######..##........########.##....##....###....##.....##.#########..###..###...######.
*/
Config.openvr2ws = <IOpenVR2WSConfig> {
    port: 7708
}

/*
....###....##.....##.########..####..#######..########..##..........###....##....##.########.########.
...##.##...##.....##.##.....##..##..##.....##.##.....##.##.........##.##....##..##..##.......##.....##
..##...##..##.....##.##.....##..##..##.....##.##.....##.##........##...##....####...##.......##.....##
.##.....##.##.....##.##.....##..##..##.....##.########..##.......##.....##....##....######...########.
.#########.##.....##.##.....##..##..##.....##.##........##.......#########....##....##.......##...##..
.##.....##.##.....##.##.....##..##..##.....##.##........##.......##.....##....##....##.......##....##.
.##.....##..#######..########..####..#######..##........########.##.....##....##....########.##.....##
*/
Config.audioplayer = <IAudioPlayerConfig> { // Play sound effects
    configs: {
        /*
        [KeysTemplate.KEY_ANNOUNCE_SOUND_EFFECT_FOR_AN_EMOTE]: {
            src: '_assets/your_chat_sound.wav',
            volume: 0.5
        }
        */
    }
}

/*
..######..####..######...##....##
.##....##..##..##....##..###...##
.##........##..##........####..##
..######...##..##...####.##.##.##
.......##..##..##....##..##..####
.##....##..##..##....##..##...###
..######..####..######...##....##
*/
Config.sign = <ISignConfig> {
    enabled: true,
    width: 200,
    height: 300,
    transitionDurationMs: 500,
    fontFamily: 'sans-serif',
    fontColor: 'white',
    fontSize: '150%',
    direction: 'left'
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
        config: PipePresetsTemplate.PIPE_CHAT
    },
    audio: {
        src: '_assets/SOUND_FOR_EMPTY_CHAT_MESSAGE_NOTIFICATIONS.wav',
        volume: 0.5
    },
    speech: '%userName said: %userInput'
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
    channelName: 'ChannelName',
    chatbotName: 'ChatbotName',
    announcerNames: ['AnnouncerName'],
    announcerTriggers: ['§'],
    announceCheers: [
        {bits: 1, message: '%userTag cheered %userBits bits! (will be the default message)'},
        {bits: 100, message: 'Wow %userTag cheered %userBits bits! (for 100 or more)'}
    ],

    proxyChatBotName: 'RestreamBot',
    proxyChatFormat: /\[(\w*):\s(.+)\]\s(.+)/,

    ignoreModerators: [
        'RestreamBot'
    ],

    alwaysOnRewards: [ // Will be turned on unless they are in the other setting below to be disabled.
        KeysTemplate.REWARD_CHANNELTROPHY
    ],
    alwaysOffRewards: [],

    rewardProfileDefault: {
        // [KeysTemplate.KEY_YOURREWARD]: true,
    },
    rewardProfileDefaultVR: {
        // [KeysTemplate.KEY_YOURREWARD]: true,
    },
    rewardProfileNoGame: {
        // [KeysTemplate.KEY_YOURREWARD]: true,
    },
    rewardProfilePerGame: {
        // [GamesTemplate.A_GAME]: { [KeysTemplate.KEY_YOURREWARD]: true, [KeysTemplate.KEY_YOUROTHERREWARD]: false }
    },
    turnOnRewardForGames: {
        // [GamesTemplate.A_GAME]: [KeysTemplate.KEY_YOURREWARD, KeysTemplate.KEY_YOUROTHERREWARD]
    },
    turnOffRewardForGames: {
        // [GamesTemplate.A_GAME]: [KeysTemplate.KEY_YOURREWARD, KeysTemplate.KEY_YOUROTHERREWARD]
    },
    turnOnRewardForOverlays: {
        // [OpenVR2WS.AN_OVERLAY_KEY]: [KeysTemplate.KEY_YOURREWARD, KeysTemplate.KEY_YOUROTHERREWARD]
    }
}