/*
 ██████  ██████  ███    ██ ████████ ██████   ██████  ██      ██      ███████ ██████  
██      ██    ██ ████   ██    ██    ██   ██ ██    ██ ██      ██      ██      ██   ██ 
██      ██    ██ ██ ██  ██    ██    ██████  ██    ██ ██      ██      █████   ██████  
██      ██    ██ ██  ██ ██    ██    ██   ██ ██    ██ ██      ██      ██      ██   ██ 
 ██████  ██████  ██   ████    ██    ██   ██  ██████  ███████ ███████ ███████ ██   ██ 
*/
// Copy this file and rename it to config.base.ts
// You can add other config files named config.[something].ts and load one of these using a URL param:
// index.php?config=[something] and it will be overriding things in your main config.
Config.controller = { // Set defaults for the widget
    defaults: {
        pipeAllChat: true,
        ttsForAll: true,
        pingForChat: true,
        logChatToDiscord: true,
        useGameSpecificRewards: true,
        updateTwitchGame: true
    },
    gameDefaults: { // Profiles for games that changes the defaults above
        'steam.app.450390': {
            pipeAllChat: false
        }
    }, 
    websocketsUsed: {
        twitchChat: true,
        twitchPubsub: true,
        openvr2ws: true,
        pipe: true,
        obs: true,
        screenshots: true
    },
    commandReferences: { // A reference so a command can trigger things that would be in an automatic reward.
        [KeysTemplate.COMMAND_CAMERA_ON]: KeysTemplate.KEY_OBS_EXAMPLE1,
        [KeysTemplate.COMMAND_CAMERA_OFF]: KeysTemplate.KEY_COLOR_EXAMPLE2
    },
    commandPermissionsDefault: { // The default permissions for all commands, see overrides below.
        streamer: true,
        moderators: true,
        VIPs: false,
        subscribers: false,
        everyone: false
    },
    commandPermissionsReferences: { // This is where you can have deviating permissions per command so you steer access individually.
        [KeysTemplate.COMMAND_LOG_ON]: {moderators: false},
        [KeysTemplate.COMMAND_LOG_OFF]: {moderators: false},
        [KeysTemplate.COMMAND_TTS_NICK]: {VIPs: true},
        [KeysTemplate.COMMAND_BRIGHTNESS]: {moderators: false},
        [KeysTemplate.COMMAND_REFRESHRATE]: {moderators: false},
        [KeysTemplate.COMMAND_VRVIEWEYE]: {moderators: false},
        [KeysTemplate.COMMAND_GAME]: {everyone: true}
    },
    speechReferences: { 
        // %s is a templated value, those gets replaced by parameters like names and numbers.
        // For pre-existing entries, make sure to keep the same number of entires if it is an array.
        [KeysTemplate.KEY_SCREENSHOT]: 'Photograph %s',
        [KeysTemplate.KEY_INSTANTSCREENSHOT]: 'Instant shot!',
        [KeysTemplate.COMMAND_TTS_ON]: [
            'Global TTS activated', 
            'Global TTS already on'
        ],
        [KeysTemplate.COMMAND_TTS_OFF]: [
            'Global TTS terminated', 
            'Global TTS already off'
        ],
        [KeysTemplate.COMMAND_TTS_NICK]: '%s is now called %s',
        [KeysTemplate.COMMAND_TTS_MUTE]: '%s has lost their voice',
        [KeysTemplate.COMMAND_TTS_UNMUTE]: [
            '%s has regained their voice', 
            '%s is not muted'
        ],
        [KeysTemplate.COMMAND_CHAT_ON]: 'Chat enabled',
        [KeysTemplate.COMMAND_CHAT_OFF]: 'Chat disabled',
        [KeysTemplate.COMMAND_PING_ON]: 'Chat ping enabled',
        [KeysTemplate.COMMAND_PING_OFF]: 'Chat ping disabled',
        [KeysTemplate.COMMAND_LOG_ON]: 'Logging enabled',
        [KeysTemplate.COMMAND_LOG_OFF]: 'Logging disabled',
        [KeysTemplate.COMMAND_CAMERA_ON]: 'Camera enabled',
        [KeysTemplate.COMMAND_CAMERA_OFF]: 'Camera disabled',
        [KeysTemplate.COMMAND_SCALE]: [
            'World scale set to %s%',
            'World scale will change from %s to %s% over %s minutes',
            'World scale sequence finished',
            'World scale sequence not set',
            'World scale sequence terminated'
        ],
        [KeysTemplate.COMMAND_BRIGHTNESS]: 'Headset brightness set to %s%',
        [KeysTemplate.COMMAND_REFRESHRATE]: 'Headset refresh rate set to %s hertz',
        [KeysTemplate.COMMAND_VRVIEWEYE]: 'Output eye mode changed to %s',
        [KeysTemplate.COMMAND_DICTIONARY]: ['%s is now said as %s', '%s messed up a dictionary entry'],
        [KeysTemplate.COMMAND_GAMEREWARDS_ON]: 'Game specific rewards enabled',
        [KeysTemplate.COMMAND_GAMEREWARDS_OFF]: 'Game specific rewards disabled',
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
        ]
    },
    rewardReferences: { // References between static and automatic rewards.
        [KeysTemplate.KEY_UNLOCKREWARDTIMER]: KeysTemplate.KEY_SETTING_EXAMPLE1
    },
    phpPassword: Secure.PHPPassword
}

/*
 ██████   ██████   ██████   ██████  ██      ███████ 
██       ██    ██ ██    ██ ██       ██      ██      
██   ███ ██    ██ ██    ██ ██   ███ ██      █████   
██    ██ ██    ██ ██    ██ ██    ██ ██      ██      
 ██████   ██████   ██████   ██████  ███████ ███████
*/
Config.google = { // TTS
    apiKey: Secure.GoogleTTS,
    speakerTimeoutMs: 5000,
    randomizeVoice: false,
    randomizeVoiceLanguageFilter: 'en-', // Matches from the first character and onward, can be extended with regional setting.
    defaultVoice: '', // This will be used if randomization is turned off.
    doNotSpeak: ['!'],
    symbolsToIgnoreForDictionary: ['.', ',', ':', '!', '?', '#', '(', ')']
},

/*
██████  ██ ██████  ███████ 
██   ██ ██ ██   ██ ██      
██████  ██ ██████  █████   
██      ██ ██      ██      
██      ██ ██      ███████
*/
Config.pipe = { // In-VR-overlays and notifications with OpenVRNotificationPipe
    port: 8077,
    doNotShow: [],
    showRewardsWithKeys: [
        KeysTemplate.KEY_TTSSPEAK,
        KeysTemplate.KEY_SCREENSHOT
    ],
    configs: {
        [KeysTemplate.KEY_PIPE_EXAMPLE1]: {
            imagePath: 'assets/dot_red.png',
            durationMs: 3000,
            type: Pipe.TYPE_NOTIFICATION
        },
        [KeysTemplate.KEY_PIPE_EXAMPLE2]: {
            imagePath: 'assets/whatever_image.png',
            durationMs: 5000,
            type: Pipe.TYPE_ALERT
        }
    }
}

/*
 ██████  ██████  ███████ 
██    ██ ██   ██ ██      
██    ██ ██████  ███████ 
██    ██ ██   ██      ██ 
 ██████  ██████  ███████ 
*/
Config.obs = { // Toggle sources in OBS on and off with the obs-websocket plugin.
    password: Secure.OBS,
    port: 4445,
    configs: {
        [KeysTemplate.KEY_OBS_EXAMPLE1]: {
            sceneNames: ['scene1'],
            sourceName: 'some source',
            durationMs: 10000,
            notificationImage: 'assets/image.png'
        },
        [KeysTemplate.KEY_OBS_EXAMPLE2]: {
            sceneNames: ['scene1', 'scene2'],
            sourceName: 'some other source',
            durationMs: 20000,
            notificationImage: 'assets/other_image.png'
        },
        [KeysTemplate.KEY_OBS_EXAMPLE3]: {
            sourceName: 'some source with a filter',
            durationMs: 5000,
            filterName: 'a filter name'
        }
    },
    filterOnScenes: [''], // WIP
    sourceScreenshotConfig: {
        sourceName: 'A source name in OBS',
        embedPictureFormat: 'png',
        saveToFilePath: 'C:\\A file path\\on your\\disk\\',
		discordDescription: 'OBS Screenshot',
        discordGameTitle: 'Your current game or platform depending on how often you want to change this',
        signTitle: 'Screenshot',
        signDurationMs: 10000 // ms
    }
}

/*
███████  ██████ ██████  ███████ ███████ ███    ██ ███████ ██   ██  ██████  ████████ 
██      ██      ██   ██ ██      ██      ████   ██ ██      ██   ██ ██    ██    ██    
███████ ██      ██████  █████   █████   ██ ██  ██ ███████ ███████ ██    ██    ██    
     ██ ██      ██   ██ ██      ██      ██  ██ ██      ██ ██   ██ ██    ██    ██    
███████  ██████ ██   ██ ███████ ███████ ██   ████ ███████ ██   ██  ██████     ██
*/
Config.screenshots = { // Trigger and transmit screenshots with SuperScreenShotterVR.
    port: 8807,
    delay: 5,
    callback: {
        discordManualTitle: 'Manual Screenshot',
        discordRewardTitle: 'Photograph: %s', // Template value is the reward description
        discordRewardInstantTitle: 'Instant shot! 📸',
        signTitle: 'Screenshot',
        signManualSubtitle: 'Manual shot!',
        signDurationMs: 5000
    }
}

/*
██████  ██ ███████  ██████  ██████  ██████  ██████  
██   ██ ██ ██      ██      ██    ██ ██   ██ ██   ██ 
██   ██ ██ ███████ ██      ██    ██ ██████  ██   ██ 
██   ██ ██      ██ ██      ██    ██ ██   ██ ██   ██ 
██████  ██ ███████  ██████  ██████  ██   ██ ██████  
*/
Config.discord = { // Send things to Discord
    remoteScreenshotEmbedColor: '#000000',
    manualScreenshotEmbedColor: '#FFFFFF',
    webhooks: Secure.DiscordWebhooks,
    prefixCheer: '🙌 ',
    prefixReward: '🏆 '
}

/*
██████  ██   ██ ██ ██      ██ ██████  ███████ ██   ██ ██    ██ ███████ 
██   ██ ██   ██ ██ ██      ██ ██   ██ ██      ██   ██ ██    ██ ██      
██████  ███████ ██ ██      ██ ██████  ███████ ███████ ██    ██ █████   
██      ██   ██ ██ ██      ██ ██           ██ ██   ██ ██    ██ ██      
██      ██   ██ ██ ███████ ██ ██      ███████ ██   ██  ██████  ███████ 
*/
Config.philipshue = { // Control Philips Hue lights
    serverPath: 'http://a-local-IP',
    userName: Secure.PhilipsHue,
    lightsToControl: [], // IDs of lights to affect with the color rewards
    configs: {
        [KeysTemplate.KEY_COLOR_EXAMPLE1]: { x: 0.5, y: 0.5 },
        [KeysTemplate.KEY_COLOR_EXAMPLE2]: { x: 0.5, y: 0.5 }
    }
}

/*
 ██████  ██████  ███████ ███    ██ ██    ██ ██████  ██████  ██     ██ ███████ 
██    ██ ██   ██ ██      ████   ██ ██    ██ ██   ██      ██ ██     ██ ██      
██    ██ ██████  █████   ██ ██  ██ ██    ██ ██████   █████  ██  █  ██ ███████ 
██    ██ ██      ██      ██  ██ ██  ██  ██  ██   ██ ██      ██ ███ ██      ██ 
 ██████  ██      ███████ ██   ████   ████   ██   ██ ███████  ███ ███  ███████ 
*/
Config.openvr2ws = { // Get things like currently played SteamVR game and change SteamVR settings with OpenVR2WS
    port: 7708,
    password: Secure.OpenVR2WS,
    configs: {
        [KeysTemplate.KEY_SETTING_EXAMPLE1]: {
            type: OpenVR2WS.TYPE_WORLDSCALE,
            value: 0.5
        },
        [KeysTemplate.KEY_SETTING_EXAMPLE1]: {
            type: OpenVR2WS.TYPE_WORLDSCALE,
            value: 2.0,
            duration: 10 // Seconds
        }
    }
}

/*
 █████  ██    ██ ██████  ██  ██████  ██████  ██       █████  ██    ██ ███████ ██████  
██   ██ ██    ██ ██   ██ ██ ██    ██ ██   ██ ██      ██   ██  ██  ██  ██      ██   ██ 
███████ ██    ██ ██   ██ ██ ██    ██ ██████  ██      ███████   ████   █████   ██████  
██   ██ ██    ██ ██   ██ ██ ██    ██ ██      ██      ██   ██    ██    ██      ██   ██ 
██   ██  ██████  ██████  ██  ██████  ██      ███████ ██   ██    ██    ███████ ██   ██ 
*/
Config.audioplayer = { // Play sound effects
    configs: {
        [KeysTemplate.KEY_SOUND_CHAT]: {
            src: 'assets/add_chat_sound.wav',
            volume: 0.5
        },
        [KeysTemplate.KEY_SOUND_EXAMPLE1]: {
            src: 'assets/subfolder/sounds1.wav', // A single value and this is all you get
            nonce: 'a-key' // A value returned in a callback on finished playing, if provided.
        },
        [KeysTemplate.KEY_SOUND_EXAMPLE2]: {
            src: ['assets/sounds1.wav', 'assets/sounds2.wav', 'assets/sounds3.wav'], // An array and it's random
            volume: 1.0 // 100%, which is also the default if not included.
        },
        [KeysTemplate.KEY_ANNOUNCE_EXAMPLE]: {
            src: 'sound file that will be played before TTS for an announcement'
        },
        [KeysTemplate.COMMAND_SOURCESCREENSHOT]: {
            src: 'assets/some sound that is not in the repo.wav'
        }
    }
}

/*
███████ ██  ██████  ███    ██ 
██      ██ ██       ████   ██ 
███████ ██ ██   ███ ██ ██  ██ 
     ██ ██ ██    ██ ██  ██ ██ 
███████ ██  ██████  ██   ████ 
*/
Config.sign = { // Show on-screen notification with title+image+subtitle
    enabled: false,
    width: 200,
    height: 300,
    transitionDuration: 500,
    fontFamily: 'sans-serif',
    fontColor: 'white',
    fontSize: '150%',
    direction: 'left', // left, right, top, bottom
    configs: {
        [KeysTemplate.KEY_SETTING_EXAMPLE1]: {durationMs: 5000, title: 'Setting Example 1'},
        [KeysTemplate.KEY_OBS_EXAMPLE2]: {durationMs: 5000, title: 'OBS Example 2!'}
    }
}

/*
██████  ██    ██ ███    ██ 
██   ██ ██    ██ ████   ██ 
██████  ██    ██ ██ ██  ██ 
██   ██ ██    ██ ██  ██ ██ 
██   ██  ██████  ██   ████ 
*/
Config.run = {
    configs: {},
    gameSpecificConfigs: {}
}

/*
████████ ██     ██ ██ ████████  ██████ ██   ██ 
   ██    ██     ██ ██    ██    ██      ██   ██ 
   ██    ██  █  ██ ██    ██    ██      ███████ 
   ██    ██ ███ ██ ██    ██    ██      ██   ██ 
   ██     ███ ███  ██    ██     ██████ ██   ██ 
*/
Config.twitch = { // Various Twitch services, like chat and rewards.
    clientId: Secure.TwitchClientID,
    clientSecret: Secure.TwitchClientSecret,
    channelName: 'ChannelName', // Name of the channel to connect to and the username that will be used to register and manage rewards
    chatbotName: 'ChatbotName', // Name of the user that listens to and post chat and whispers
    announcerName: 'AnnouncterName', // Name of a bot you are listening to for announcement
    announcerTriggers: ['❗', KeysTemplate.KEY_ANNOUNCE_EXAMPLE],
    chatNotificationSound: KeysTemplate.KEY_SOUND_CHAT,

    proxyChatBotName: 'RestreamBot', // Name of a chat mirroring bot that you want to read as user messages
    proxyChatFormat: /\[(\w*):\s(.+)\]\s(.+)/, // Match three groups: Source, User and Message.

    ignoreModerators: [ // Will ignore someone's moderator status for commands, useful for bots.
        'RestreamBot' // This can't reference things set in this config as they are not set yet.
    ],

    skipUpdatingRewards: [
        KeysTemplate.KEY_CHANNELTROPHY
    ],
    defaultRewards: [ // Will be turned on unless they are in the other setting below to be disabled.
        KeysTemplate.KEY_SCREENSHOT,
        KeysTemplate.KEY_INSTANTSCREENSHOT
    ], // These will be turned on by default
    disableRewards: [], // Used to disable certain rewards in override configs.
    autoRewards: [
        KeysTemplate.KEY_OBS_EXAMPLE1,
        KeysTemplate.KEY_OBS_EXAMPLE2,
        KeysTemplate.KEY_COLOR_EXAMPLE1,
        KeysTemplate.KEY_COLOR_EXAMPLE2,
        KeysTemplate.KEY_SOUND_EXAMPLE1,
        KeysTemplate.KEY_SOUND_EXAMPLE2,
        KeysTemplate.KEY_SETTING_EXAMPLE1,
        KeysTemplate.KEY_SETTING_EXAMPLE2,
        KeysTemplate.KEY_WEB_EXAMPLE1
    ],
    disableAutoRewardAfterUse: [
        KeysTemplate.KEY_UNLOCKREWARDTIMER
    ], // Rewards listed here will be disabled as soon as they have been used, meaning they will vanish.
    rewardConfigs: { // A list of configurations for the rewards, which is used for initial setup and/or manual updates (!update)
        // You should fill this out with at least the minimum for each reward, the title has to be unique.
        
        // Default rewards, you can remove the ones you don't want or set them to not be enabled with is_enabled=false.
        [KeysTemplate.KEY_TTSSPEAK]: {
            title: 'TTS',
            cost: 10,
            prompt: 'Your message is read aloud.',
            background_color: '#808080',
            is_user_input_required: true
        },
        [KeysTemplate.KEY_TTSSPEAKTIME]: {
            title: 'TTS for 10m',
            cost: 100,
            prompt: 'Your messages are read aloud for 10 minutes.',
            background_color: '#808080'
        },
        [KeysTemplate.KEY_TTSSETVOICE]: {
            title: 'Set TTS voice',
            cost: 10,
            prompt: 'Change the settings for your TTS voice.',
            background_color: '#808080',
            is_user_input_required: true
        },
        [KeysTemplate.KEY_TTSSWITCHVOICEGENDER]: {
            title: 'TTS Gender Flip',
            cost: 10,
            prompt: "Switch your TTS voice gender.",
            background_color: '#808080'
        },
        [KeysTemplate.KEY_SCREENSHOT]: {
            title: 'Take a Screenshot with description',
            cost: 15,
            prompt: 'Your description will be read aloud before triggering a screenshot.',
            background_color: '#808080',
            is_user_input_required: true
        },
        [KeysTemplate.KEY_INSTANTSCREENSHOT]: {
            title: 'Take a screenshot',
            cost: 10,
            prompt: 'Immediately trigger a screenshot.',
            background_color: '#808080'
        },
        
        // Examples of auto rewards, all are minimum input except the last which shows off all properties possible for a reward.
        [KeysTemplate.KEY_OBS_EXAMPLE1]: { title: 'OBS Example 1', cost: 100 },
        [KeysTemplate.KEY_OBS_EXAMPLE2]: { title: 'OBS Example 2', cost: 100 },
        [KeysTemplate.KEY_COLOR_EXAMPLE1]: { title: 'Color Example 1', cost: 100 },
        [KeysTemplate.KEY_COLOR_EXAMPLE2]: { title: 'Color Example 2', cost: 100 },
        [KeysTemplate.KEY_SOUND_EXAMPLE1]: { title: 'Sound Example 1', cost: 100 },
        [KeysTemplate.KEY_SOUND_EXAMPLE2]: { title: 'Sound Example 2', cost: 100 },
        [KeysTemplate.KEY_PIPE_EXAMPLE1]: { title: 'Pipe Example 1', cost: 100 },
        [KeysTemplate.KEY_PIPE_EXAMPLE2]: { title: 'Pipe Example 2', cost: 100 },
        [KeysTemplate.KEY_SETTING_EXAMPLE1]: { title: 'Setting Example 1', cost: 100 },
        [KeysTemplate.KEY_SETTING_EXAMPLE2]: {
            title: 'A unique title',
            cost: 100,
            prompt: 'The description',
            is_enabled: true,
            background_color: "#FFFFFF",
            is_user_input_required: true,
            is_max_per_stream_enabled: true,
            max_per_stream: 10,
            is_max_per_user_per_stream_enabled: true,
            max_per_user_per_stream: 2,
            is_global_cooldown_enabled: true,
            global_cooldown_seconds: 45,
            should_redemptions_skip_request_queue: true
        }
    },
    rewardConfigProfileDefault: { // These will be applied if a game does not have a profile
        [KeysTemplate.KEY_SETTING_EXAMPLE1]: true,
        [KeysTemplate.KEY_SETTING_EXAMPLE1]: false,
    },
    rewardConfigProfilePerGame: { // These are applied if an app ID is matched
        'steam.app.450390': { // The Lab
            [KeysTemplate.KEY_SETTING_EXAMPLE1]: false,
            [KeysTemplate.KEY_SETTING_EXAMPLE1]: true,
        }
    },
    gameSpecificRewards: [ // Rewards deemed to be game specific, will be disabled if no config is available.
        KeysTemplate.KEY_GAME_EXAMPLE1,
        KeysTemplate.KEY_GAME_EXAMPLE2
    ],
    gameSpecificRewardsPerGame: {
        'steam.app.450390': {
            
        }
    },
    channelTrophyUniqueNumbers: {
        
    }
}

/*
██     ██ ███████ ██████  
██     ██ ██      ██   ██ 
██  █  ██ █████   ██████  
██ ███ ██ ██      ██   ██ 
 ███ ███  ███████ ██████  
*/
Config.web = {
    configs: {
        [KeysTemplate.KEY_WEB_EXAMPLE1]: {
            url: 'https://the.web-URL-you-want-to.load'
        }
    }
}