class ConfigTemplate { // Refactor this class to just 'Config' to use this as the live config.
    // Static rewards
    static readonly KEY_ROOMPEEK: string = 'RoomPeek'
    static readonly KEY_HEADPEEK: string = 'HeadPeek'
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
    static readonly KEY_COLOR_EXAMPLE1: string = 'twitch_reward_id'
    static readonly KEY_COLOR_EXAMPLE2: string = 'twitch_reward_id'
    
    static readonly KEY_SOUND_EXAMPLE1: string = "twitch_reward_id"
    static readonly KEY_SOUND_EXAMPLE2: string = "twitch_reward_id"

    static instance: IConfig = {
        controller: {
            pipeForAllDefault: true,
            ttsForAllDefault: true,
            logChatToDiscordDefault: true
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
            rewardNotificationImages: {
                [ConfigTemplate.KEY_ROOMPEEK]: 'assets/dot_yellow.png',
                [ConfigTemplate.KEY_HEADPEEK]: 'assets/dot_pink.png'
            }
        },
        obs: {
            password: '',
            port: 4445,
            sources: {
                [ConfigTemplate.KEY_ROOMPEEK]: {
                    sceneNames: [""],
                    sourceName: "",
                    duration: 10000
                },
                [ConfigTemplate.KEY_HEADPEEK]: {
                    sceneNames: [""],
                    sourceName: "",
                    duration: 10000
                }
            },
            filterOnScenes: ['']
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
                [ConfigTemplate.KEY_ROOMPEEK]: '',
                [ConfigTemplate.KEY_HEADPEEK]: '',

                [ConfigTemplate.KEY_TTSSPEAK]: '',
                [ConfigTemplate.KEY_TTSSPEAKTIME]: '',
                [ConfigTemplate.KEY_TTSSETVOICE]: '',
                [ConfigTemplate.KEY_TTSSWITCHVOICEGENDER]: '',
                
                [ConfigTemplate.KEY_SCREENSHOT]: '',
                [ConfigTemplate.KEY_INSTANTSCREENSHOT]: '',

                [ConfigTemplate.KEY_FAVORITEVIEWER]: ''
            }
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
            rewards: {
                [ConfigTemplate.KEY_COLOR_EXAMPLE1]: { x: 0.5, y: 0.5 },
                [ConfigTemplate.KEY_COLOR_EXAMPLE2]: { x: 0.5, y: 0.5 }
            }
        },
        openvr2ws: {
            port: 7708
        },
        audioplayer: {
            rewards: {
                [ConfigTemplate.KEY_SOUND_EXAMPLE1]: {
                    src: 'assets/subfolder/sounds1.wav'
                },
                [ConfigTemplate.KEY_SOUND_EXAMPLE2]: {
                    src: ['assets/sounds1.wav', 'assets/sounds2.wav', 'assets/sounds3.wav']
                }
            }
        }
    }
}