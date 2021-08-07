class ConfigTemplate { // Rename class to just 'Config' to use as the live config.
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
    
    static readonly KEY_COLOR_NEUTRAL: string = 'ColorNeutral'
    static readonly KEY_COLOR_RED: string = 'ColorRed'
    static readonly KEY_COLOR_ORANGE: string = 'ColorOrange'
    static readonly KEY_COLOR_BUTTERCUP: string = 'ColorButtercup'
    static readonly KEY_COLOR_YELLOW: string = 'ColorYellow'
    static readonly KEY_COLOR_GREEN: string = 'ColorGreen'
    static readonly KEY_COLOR_CYAN: string = 'ColorCyan'
    static readonly KEY_COLOR_SKY: string = 'ColorSky'
    static readonly KEY_COLOR_BLUE: string = 'ColorBlue'
    static readonly KEY_COLOR_PURPLE: string = 'ColorPurple'
    static readonly KEY_COLOR_PINK: string = 'ColorPink'

    static readonly KEY_SOUND_APPLAUSE: string = "SoundApplause"
    static readonly KEY_SOUND_LAUGHTER: string = "SoundLaughter"
    static readonly KEY_SOUND_TEST1: string = "SoundTest1"
    static readonly KEY_SOUND_TEST2: string = "SoundTest2"
    static readonly KEY_SOUND_TEST3: string = "SoundTest3"

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
                Config.KEY_TTSSPEAK,
                Config.KEY_SCREENSHOT
            ],
            rewardNotificationImages: {
                [Config.KEY_ROOMPEEK]: 'assets/dot_yellow.png',
                [Config.KEY_HEADPEEK]: 'assets/dot_pink.png'
            }
        },
        obs: {
            password: '',
            port: 4445,
            sources: {
                [Config.KEY_ROOMPEEK]: {
                    sceneNames: [""],
                    sourceName: "",
                    duration: 10000
                },
                [Config.KEY_HEADPEEK]: {
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
                [Config.KEY_ROOMPEEK]: '',
                [Config.KEY_HEADPEEK]: '',

                [Config.KEY_TTSSPEAK]: '',
                [Config.KEY_TTSSPEAKTIME]: '',
                [Config.KEY_TTSSETVOICE]: '',
                [Config.KEY_TTSSWITCHVOICEGENDER]: '',
                
                [Config.KEY_SCREENSHOT]: '',
                [Config.KEY_INSTANTSCREENSHOT]: '',

                [Config.KEY_FAVORITEVIEWER]: '',
                
                [Config.KEY_COLOR_NEUTRAL]: '',
                [Config.KEY_COLOR_RED]: '',
                [Config.KEY_COLOR_ORANGE]: '',
                [Config.KEY_COLOR_BUTTERCUP]: '',
                [Config.KEY_COLOR_YELLOW]: '',
                [Config.KEY_COLOR_GREEN]: '',
                [Config.KEY_COLOR_CYAN]: '',
                [Config.KEY_COLOR_SKY]: '',
                [Config.KEY_COLOR_BLUE]: '',
                [Config.KEY_COLOR_PURPLE]: '',
                [Config.KEY_COLOR_PINK]: '',

                [Config.KEY_SOUND_TEST1]: '',
                [Config.KEY_SOUND_TEST2]: '',
                [Config.KEY_SOUND_TEST3]: '',
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
                [Config.KEY_DISCORD_SSSVR]: {
                    id: '',
                    token: ''
                },
                [Config.KEY_DISCORD_CHAT]: {
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
            lightsToControl: []
        },
        openvr2ws: {
            port: 7708
        },
        audioplayer: {
            [Config.KEY_SOUND_TEST1]: {
                src: 'assets/audience_cheers_13.wav'
            },
            [Config.KEY_SOUND_TEST2]: {
                src: 'assets/'
            },
            [Config.KEY_SOUND_TEST3]: {
                src: ['assets/', 'assets/', 'assets/']
            }
        }
    }
}