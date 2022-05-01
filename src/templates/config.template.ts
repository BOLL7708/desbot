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
    commandReferences: {
        // [KeysTemplate.YOUR_COMMAND]: KeysTemplate.KEY_YOURREWARD
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
        [KeysTemplate.COMMAND_GAME]: {everyone: true},
        [KeysTemplate.COMMAND_AUDIOURL]: {moderators: false}
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
            '%s has lost their voice',
            '%s is already muted'
        ],
        [KeysTemplate.COMMAND_TTS_UNMUTE]: [
            '%s has regained their voice', 
            '%s is not muted'
        ],
        [KeysTemplate.COMMAND_SCALE]: [
            'World scale set to %s%',
            'World scale will change from %s to %s% over %s minutes',
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
            'There are %s old clips, %s new clips.',
            'Finished posting %s new clips.'
        ],
        [KeysTemplate.COMMAND_DICTIONARY]: [
            '%s is now said as %s', 
            '%s messed up a dictionary entry'
        ],
        [KeysTemplate.CALLBACK_APPID]: [
            'Twitch game updated: %s',
            'Twitch game not matched: %s'
        ],

        /*
        .#####...##..##..##..##...####...##...##..######...####..
        .##..##...####...###.##..##..##..###.###....##....##..##.
        .##..##....##....##.###..######..##.#.##....##....##.....
        .##..##....##....##..##..##..##..##...##....##....##..##.
        .#####.....##....##..##..##..##..##...##..######...####..
        */
        [KeysTemplate.COMMAND_TTS_NICK]: '%s is now called %s',
        [KeysTemplate.COMMAND_CHAT_ON]: 'Chat enabled',
        [KeysTemplate.COMMAND_CHAT_OFF]: 'Chat disabled',
        [KeysTemplate.COMMAND_PING_ON]: 'Chat ping enabled',
        [KeysTemplate.COMMAND_PING_OFF]: 'Chat ping disabled',
        [KeysTemplate.COMMAND_LOG_ON]: 'Logging enabled',
        [KeysTemplate.COMMAND_LOG_OFF]: 'Logging disabled',
        [KeysTemplate.COMMAND_CAMERA_ON]: 'Camera enabled',
        [KeysTemplate.COMMAND_CAMERA_OFF]: 'Camera disabled',
        [KeysTemplate.COMMAND_BRIGHTNESS]: 'Headset brightness set to %s%',
        [KeysTemplate.COMMAND_REFRESHRATE]: 'Headset refresh rate set to %s hertz',
        [KeysTemplate.COMMAND_VRVIEWEYE]: 'Output eye mode changed to %s',
        [KeysTemplate.COMMAND_GAMEREWARDS_ON]: 'Game specific rewards enabled',
        [KeysTemplate.COMMAND_GAMEREWARDS_OFF]: 'Game specific rewards disabled',
    },
    chatReferences: {
        [KeysTemplate.COMMAND_DICTIONARY]: [
            'There is no entry for "%s" in the dictionary.',
            '"%s" is set to "%s" in the dictionary.'
        ]
    },
    rewardReferences: {
        // [KeysTemplate.KEY_AREWARD]: KeysTemplate.KEY_YOURREWARD
    },
    defaultTwitchGameCategory: 'Games + Demos',
    resetIncrementingRewardsOnLoad: [
        // KeysTemplate.KEY_YOURREWARD
    ],
    saveConsoleOutputToSettings: false,
    secretChatSymbols: ['!'],
    channelTrophySettings: {
        label: '🏆 Channel Trophy #%s\n%s',
        rewardTitle: '🏆 Held by %s!',
        rewardPrompt: 'Currently held by %s! %s Now costs %s points!',
        rewardCooldownMultiplier: 30,
        ttsOn: true,
        ttsName: '@%s grabbed',
        ttsTrophy: 'trophy'
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
            // 'word': 'https://yourhost.com/audiofiles/youraudio.wav'
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
        discordFooter: 'Progress: %s, global rate: %s',
        twitchChatMessage: '🔓 Achievement %s unlocked: %s (%s) 🌍 %s'
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
        sourceName: 'Your Source Name',
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
    delayOnDescription: 5,
    callback: {
        discordManualTitle: 'Manual Screenshot',
        discordRewardTitle: 'Photograph: %s', // Template value is the reward description
        discordRewardInstantTitle: 'Instant shot! 📸',
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
    prefixCheer: '🙌 ',
    prefixReward: '🏆 '
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
        config: PipePresets.PIPE_CHAT
    },
    audio: {
        src: '_assets/SOUND_FOR_EMPTY_CHAT_MESSAGE_NOTIFICATIONS.wav',
        volume: 0.5
    },
    speech: '%s said: %s'
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
    announcerTriggers: ['❗'],

    proxyChatBotName: 'RestreamBot',
    proxyChatFormat: /\[(\w*):\s(.+)\]\s(.+)/,

    ignoreModerators: [
        'RestreamBot'
    ],
    commandConfigs: {
        /*
        [Keys.COMMAND_YOURCUSTOMCOMMAND]: {
            command: {
                permissions: {moderators: false}
            },
            audio: {
                src: '_assets/some_audio_file.wav'
            }}
        }
        */
    },

    skipUpdatingRewards: [
        KeysTemplate.REWARD_CHANNELTROPHY
    ],
    alwaysOnRewards: [ // Will be turned on unless they are in the other setting below to be disabled.
        KeysTemplate.REWARD_CHANNELTROPHY
    ],
    alwaysOffRewards: [],

    defaultRewardConfigs: {   
        /*
        .#####...######..######...####...##..##..##......######.
        .##..##..##......##......##..##..##..##..##........##...
        .##..##..####....####....######..##..##..##........##...
        .##..##..##......##......##..##..##..##..##........##...
        .#####...######..##......##..##...####...######....##...
        */
        [KeysTemplate.REWARD_TTSSPEAK]: {
            reward: {
                title: 'TTS',
                cost: 10,
                prompt: 'Read message aloud',
                background_color: '#808080',
                is_user_input_required: true
            }
        },
        [KeysTemplate.REWARD_TTSSETVOICE]: {
            reward: {
                title: 'Set TTS voice',
                cost: 10,
                prompt: 'Change TTS voice',
                background_color: '#808080',
                is_user_input_required: true
            }
        },
        [KeysTemplate.REWARD_TTSSWITCHVOICEGENDER]: {
            reward: {
                title: 'TTS Gender Flip',
                cost: 10,
                prompt: "Switch your TTS voice gender",
                background_color: '#808080'
            }
        },
        [Keys.REWARD_CHANNELTROPHY]: {
            reward: {
                title: '🏆 Held by nobody!',
                cost: 1,
                prompt: 'Become the Channel Trophy holder! You hold 🏆 until someone else pays the ever increasing (+1) price!',
                background_color: '#000000',
                is_max_per_stream_enabled: true,
                max_per_stream: 10000,
                is_global_cooldown_enabled: true,
                global_cooldown_seconds: 15
            },
            audio: {
                src: '_assets/YOUR_SOUND_EFFECT.wav'
            },
            sign: {
                durationMs: 10000,
                title: 'The 🏆 was grabbed!'
            }
        }
    },

    /**
     * Add your own custom rewards to trigger actions here.
     */
    rewardConfigs: {
        // [KeysTemplate.KEY_YOURGAMEREWARD]: { title: "Update title", cost: "Update cost" }
    },

    /**
     * These are game specific rewards, first default setup and then game specific setup.
     */
    gameRewardDefaultConfigs: {
        // [KeysTemplate.KEY_YOURGAMEREWARD]: { title: "Update title", cost: "Update cost" }
    },
    gameRewardConfigs: {
        // [GamesTemplate.A_GAME]: {[KeysTemplate.KEY_YOURGAMEREWARD]: { title: "Update title", cost: "Update cost" }}
    },

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
    },
    channelTrophyUniqueNumbers: {
        // 1234: { speech: "", label: "" }
    }
}