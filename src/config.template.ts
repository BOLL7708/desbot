class ConfigTemplate { // Refactor this class to just 'Config' to use this as the live config.
    // Command references
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
    static readonly COMMAND_LOG_ON: string = 'logon'
    static readonly COMMAND_LOG_OFF: string = 'logoff'
    static readonly COMMAND_CAMERA_ON: string = 'camon'
    static readonly COMMAND_CAMERA_OFF: string = 'camoff'

    // Static rewards
    static readonly KEY_TTSSPEAK: string = 'TtsSpeak'
    static readonly KEY_TTSSPEAKTIME: string = 'TtsSpeakTime'
    static readonly KEY_TTSSETVOICE: string = 'TtsSetVoice'
    static readonly KEY_TTSSWITCHVOICEGENDER: string = "TtsSwitchVoiceGender"
    static readonly KEY_SCREENSHOT: string = 'Screenshot'
    static readonly KEY_INSTANTSCREENSHOT: string = "InstantScreenshot"
    static readonly KEY_DISCORD_SSSVR: string = 'DiscordSSSRV'
    static readonly KEY_DISCORD_CHAT: string = 'DiscordChat'
    static readonly KEY_FAVORITEVIEWER: string = 'FavoriteViewer'
    
    // Automatically loaded rewards
    static readonly KEY_OBS_EXAMPLE1: string = 'replace_with_twitch_reward_id'
    static readonly KEY_OBS_EXAMPLE2: string = 'replace_with_twitch_reward_id'
    static readonly KEY_COLOR_EXAMPLE1: string = 'replace_with_twitch_reward_id'
    static readonly KEY_COLOR_EXAMPLE2: string = 'replace_with_twitch_reward_id'
    static readonly KEY_SOUND_EXAMPLE1: string = "replace_with_twitch_reward_id"
    static readonly KEY_SOUND_EXAMPLE2: string = "replace_with_twitch_reward_id"
    
    static instance: IConfig = {
        controller: {
            pipeForAllDefault: true,
            ttsForAllDefault: true,
            logChatToDiscordDefault: true,
            commandReferences: {
                [Config.COMMAND_CAMERA_ON]: Config.KEY_ROOMPEEK,
                [Config.COMMAND_CAMERA_OFF]: Config.KEY_ROOMPEEK
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
            ]
        },
        obs: {
            password: '',
            port: 4445,
            configs: {
                [ConfigTemplate.KEY_OBS_EXAMPLE1]: {
                    sceneNames: ["scene1"],
                    sourceName: "some source",
                    duration: 10000,
                    notificationImage: 'assets/image.png'
                },
                [ConfigTemplate.KEY_OBS_EXAMPLE2]: {
                    sceneNames: ["scene1", "scene2"],
                    sourceName: "some other source",
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
            channelName: '',
            botName: '',
            announcerName: '',
            announcerTrigger: '',
            rewards: {
                [ConfigTemplate.KEY_TTSSPEAK]: '',
                [ConfigTemplate.KEY_TTSSPEAKTIME]: '',
                [ConfigTemplate.KEY_TTSSETVOICE]: '',
                [ConfigTemplate.KEY_TTSSWITCHVOICEGENDER]: '',
                
                [ConfigTemplate.KEY_SCREENSHOT]: '',
                [ConfigTemplate.KEY_INSTANTSCREENSHOT]: '',

                [ConfigTemplate.KEY_FAVORITEVIEWER]: ''
            },
            autoRewards: [
                ConfigTemplate.KEY_OBS_EXAMPLE1,
                ConfigTemplate.KEY_OBS_EXAMPLE2,
                ConfigTemplate.KEY_COLOR_EXAMPLE1,
                ConfigTemplate.KEY_COLOR_EXAMPLE2,
                ConfigTemplate.KEY_SOUND_EXAMPLE1,
                ConfigTemplate.KEY_SOUND_EXAMPLE2
            ]
        },
        screenshots: {
            port: 8807,
            delay: 5
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
            port: 7708
        },
        audioplayer: {
            configs: {
                [ConfigTemplate.KEY_SOUND_EXAMPLE1]: {
                    src: 'assets/subfolder/sounds1.wav', // A single value and this is all you get
                    nonce: 'a-key' // A value returned in an audio-played callback if provided.
                },
                [ConfigTemplate.KEY_SOUND_EXAMPLE2]: {
                    src: ['assets/sounds1.wav', 'assets/sounds2.wav', 'assets/sounds3.wav'], // An array and it's random
                    volume: 1.0 // 100%, which is also the default if not included.
                }
            }
        }
    }
}