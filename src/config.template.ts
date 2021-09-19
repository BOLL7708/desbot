class ConfigTemplate { // Refactor this class to just 'Config' to use this as the live config.
    
	// Command references, to disable a command just set it to an empty string: ''
    static readonly COMMAND_TTS_ON: string = 'ttson'
    static readonly COMMAND_TTS_OFF: string = 'ttsoff'
    static readonly COMMAND_TTS_SILENCE: string = 'silence'
    static readonly COMMAND_TTS_DIE: string = 'ttsdie'
    static readonly COMMAND_TTS_SAY: string = 'say'
    static readonly COMMAND_TTS_NICK: string = 'nick'
    static readonly COMMAND_TTS_MUTE: string = 'mute'
    static readonly COMMAND_TTS_UNMUTE: string = 'unmute'   
    static readonly COMMAND_CHAT: string = 'chat'
    static readonly COMMAND_CHAT_ON: string = 'chaton'
    static readonly COMMAND_CHAT_OFF: string = 'chatoff'
    static readonly COMMAND_PING_ON: string = 'pingon'
    static readonly COMMAND_PING_OFF: string = 'pingoff'
    static readonly COMMAND_LOG_ON: string = 'logon'
    static readonly COMMAND_LOG_OFF: string = 'logoff'
    static readonly COMMAND_CAMERA_ON: string = 'camon'
    static readonly COMMAND_CAMERA_OFF: string = 'camoff'
    static readonly COMMAND_SCALE: string = 'scale'
	static readonly COMMAND_DICTIONARY: string = 'word'

    // Discord
    static readonly KEY_DISCORD_SSSVR: string = 'DiscordSSSRV'
    static readonly KEY_DISCORD_CHAT: string = 'DiscordChat'

    // Static audio
    static readonly KEY_SOUND_CHAT: string = 'ChatSound'

    // Static rewards
    static readonly KEY_TTSSPEAK: string = 'replace_with_twitch_reward_id'
    static readonly KEY_TTSSPEAKTIME: string = 'replace_with_twitch_reward_id'
    static readonly KEY_TTSSETVOICE: string = 'replace_with_twitch_reward_id'
    static readonly KEY_TTSSWITCHVOICEGENDER: string = 'replace_with_twitch_reward_id'
    static readonly KEY_SCREENSHOT: string = 'replace_with_twitch_reward_id'
    static readonly KEY_INSTANTSCREENSHOT: string = 'replace_with_twitch_reward_id'
    static readonly KEY_FAVORITEVIEWER: string = 'replace_with_twitch_reward_id'
    
    // Automatically loaded rewards
    static readonly KEY_OBS_EXAMPLE1: string = 'replace_with_twitch_reward_id'
    static readonly KEY_OBS_EXAMPLE2: string = 'replace_with_twitch_reward_id'
    static readonly KEY_COLOR_EXAMPLE1: string = 'replace_with_twitch_reward_id'
    static readonly KEY_COLOR_EXAMPLE2: string = 'replace_with_twitch_reward_id'
    static readonly KEY_SOUND_EXAMPLE1: string = 'replace_with_twitch_reward_id'
    static readonly KEY_SOUND_EXAMPLE2: string = 'replace_with_twitch_reward_id'
    static readonly KEY_PIPE_EXAMPLE1: string = 'replace_with_twitch_reward_id'
    static readonly KEY_PIPE_EXAMPLE2: string = 'replace_with_twitch_reward_id'
    static readonly KEY_SETTING_EXAMPLE1: string = 'replace_with_twitch_reward_id'
    static readonly KEY_SETTING_EXAMPLE2: string = 'replace_with_twitch_reward_id'
	
	// Message triggers used for TTS and audio referencing
	static readonly KEY_ANNOUNCE_EXAMPLE: string = '❓' // Any character, word or emote you want to match
	
    
    static instance: IConfig = {
        controller: {
            pipeForAllDefault: true,
            ttsForAllDefault: true,
            pingForChat: true,
            logChatToDiscordDefault: true,
            commandReferences: {
                [ConfigTemplate.COMMAND_CAMERA_ON]: ConfigTemplate.KEY_OBS_EXAMPLE1,
                [ConfigTemplate.COMMAND_CAMERA_OFF]: ConfigTemplate.KEY_COLOR_EXAMPLE2
            },
            speechReferences: { // %s is a templated value, gets replaced.
                [ConfigTemplate.KEY_SCREENSHOT]: 'Photograph %s',
                [ConfigTemplate.KEY_INSTANTSCREENSHOT]: 'Instant shot!',
                [ConfigTemplate.KEY_FAVORITEVIEWER]: '%s is the new favorite viewer',
                [ConfigTemplate.COMMAND_TTS_ON]: ['Global TTS activated', 'Global TTS already on'],
                [ConfigTemplate.COMMAND_TTS_OFF]: ['Global TTS terminated', 'Global TTS already off'],
                [ConfigTemplate.COMMAND_TTS_NICK]: '%s is now called %s',
                [ConfigTemplate.COMMAND_TTS_MUTE]: '%s has lost their voice',
                [ConfigTemplate.COMMAND_TTS_UNMUTE]: ['%s has regained their voice', '%s is not muted'],
                [ConfigTemplate.COMMAND_CHAT_ON]: 'Chat enabled',
                [ConfigTemplate.COMMAND_CHAT_OFF]: 'Chat disabled',
                [ConfigTemplate.COMMAND_PING_ON]: 'Chat ping enabled',
                [ConfigTemplate.COMMAND_PING_OFF]: 'Chat ping disabled',
                [ConfigTemplate.COMMAND_LOG_ON]: 'Logging enabled',
                [ConfigTemplate.COMMAND_LOG_OFF]: 'Logging disabled',
                [ConfigTemplate.COMMAND_CAMERA_ON]: 'Camera enabled',
                [ConfigTemplate.COMMAND_CAMERA_OFF]: 'Camera disabled',
                [ConfigTemplate.COMMAND_SCALE]: 'World scale set to %s%',
                [ConfigTemplate.COMMAND_DICTIONARY]: ['%s is now said as %s', '%s messed up a dictionary entry']
            }
        },
        google: {
            apiKey: '',
            speakerTimeoutMs: 5000,
            randomizeVoice: false,
            randomizeVoiceLanguageFilter: 'en-', // Matches from the first character and onward, can be extended with regional setting.
            defaultVoice: '', // This will be used if randomization is turned off.
            doNotSpeak: []
        },
        pipe: {
            port: 8077,
            doNotShow: [],
            showRewardsWithKeys: [
                ConfigTemplate.KEY_TTSSPEAK,
                ConfigTemplate.KEY_SCREENSHOT
            ],
            configs: {
                [ConfigTemplate.KEY_PIPE_EXAMPLE1]: {
                    imagePath: 'assets/dot_red.png',
                    duration: 3000,
                    type: Pipe.TYPE_NOTIFICATION
                },
                [ConfigTemplate.KEY_PIPE_EXAMPLE2]: {
                    imagePath: 'assets/whatever_image.png',
                    duration: 5000,
                    type: Pipe.TYPE_ALERT
                }
            }
        },
        obs: {
            password: '',
            port: 4445,
            configs: {
                [ConfigTemplate.KEY_OBS_EXAMPLE1]: {
                    sceneNames: ['scene1'],
                    sourceName: 'some source',
                    duration: 10000,
                    notificationImage: 'assets/image.png'
                },
                [ConfigTemplate.KEY_OBS_EXAMPLE2]: {
                    sceneNames: ['scene1', 'scene2'],
                    sourceName: 'some other source',
                    duration: 20000,
                    notificationImage: 'assets/other_image.png'
                }
            },
            filterOnScenes: [''] // WIP
        },
        twitch: {
            userId: 0,
            clientId: '',
            clientSecret: '',
            channelName: 'Name of the channel to connect to',
            botName: 'Name of the bot listening to chat', // Pretty sure this has to be the name the tokens are associated with. 
            announcerName: 'Name of the bot you are listening to',
            announcerTriggers: ['❗', ConfigTemplate.KEY_ANNOUNCE_EXAMPLE],
            chatNotificationSound: ConfigTemplate.KEY_SOUND_CHAT,
            rewards: [
                ConfigTemplate.KEY_TTSSPEAK,
                ConfigTemplate.KEY_TTSSPEAKTIME,
                ConfigTemplate.KEY_TTSSETVOICE,
                ConfigTemplate.KEY_TTSSWITCHVOICEGENDER,
                ConfigTemplate.KEY_SCREENSHOT,
                ConfigTemplate.KEY_INSTANTSCREENSHOT,
                ConfigTemplate.KEY_FAVORITEVIEWER
            ],
            autoRewards: [
                ConfigTemplate.KEY_OBS_EXAMPLE1,
                ConfigTemplate.KEY_OBS_EXAMPLE2,
                ConfigTemplate.KEY_COLOR_EXAMPLE1,
                ConfigTemplate.KEY_COLOR_EXAMPLE2,
                ConfigTemplate.KEY_SOUND_EXAMPLE1,
                ConfigTemplate.KEY_SOUND_EXAMPLE2,
                ConfigTemplate.KEY_SETTING_EXAMPLE1,
                ConfigTemplate.KEY_SETTING_EXAMPLE2
            ]
        },
        screenshots: {
            port: 8807,
            delay: 5,
            callback: {
                discordManualTitle: 'Manual Screenshot',
                discordRewardTitle: 'Photograph: %s', // Template value is the reward description
                discordRewardInstantTitle: 'Instant shot! 📸',
                signTitle: 'Screenshot',
                signManualSubtitle: 'Manual shot!',
                signDuration: 5000
            }
        },
        discord: {
            remoteScreenshotEmbedColor: '#000000',
            manualScreenshotEmbedColor: '#FFFFFF',
            webhooks: {
                [ConfigTemplate.KEY_DISCORD_SSSVR]: {
                    id: '',
                    token: ''
                },
                [ConfigTemplate.KEY_DISCORD_CHAT]: {
                    id: '',
                    token: ''
                }
            },
            prefixCheer: '🙌 ',
            prefixReward: '🏆 '
        },
        philipshue: {
            serverPath: '',
            userName: '',
            lightsToControl: [],
            configs: {
                [ConfigTemplate.KEY_COLOR_EXAMPLE1]: { x: 0.5, y: 0.5 },
                [ConfigTemplate.KEY_COLOR_EXAMPLE2]: { x: 0.5, y: 0.5 }
            }
        },
        openvr2ws: {
            port: 7708,
            password: 'for remote settings',
            configs: {
                [ConfigTemplate.KEY_SETTING_EXAMPLE1]: {
                    type: OpenVR2WS.TYPE_WORLDSCALE,
                    value: 0.5
                },
                [ConfigTemplate.KEY_SETTING_EXAMPLE1]: {
                    type: OpenVR2WS.TYPE_WORLDSCALE,
                    value: 2.0,
                    duration: 10 // Seconds
                }
            }
        },
        audioplayer: {
            configs: {
                [ConfigTemplate.KEY_SOUND_CHAT]: {
                    src: 'assets/add_chat_sound.wav',
                    volume: 0.5
                },
                [ConfigTemplate.KEY_SOUND_EXAMPLE1]: {
                    src: 'assets/subfolder/sounds1.wav', // A single value and this is all you get
                    nonce: 'a-key' // A value returned in a callback on finished playing, if provided.
                },
                [ConfigTemplate.KEY_SOUND_EXAMPLE2]: {
                    src: ['assets/sounds1.wav', 'assets/sounds2.wav', 'assets/sounds3.wav'], // An array and it's random
                    volume: 1.0 // 100%, which is also the default if not included.
                },
				[ConfigTemplate.KEY_ANNOUNCE_EXAMPLE]: {
					src: 'sound file that will be played before TTS for an announcement'
				}
            }
        },
        sign: {
            enabled: false,
            width: 200,
            height: 300,
            transitionDuration: 500,
            fontFamily: 'sans-serif',
            fontColor: 'white',
            fontSize: '150%',
            direction: 'left' // left, right, top, bottom
        }
    }
}