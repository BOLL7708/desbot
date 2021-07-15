class Config {
    static readonly KEY_ROOMPEEK: string = 'RoomPeek'
    static readonly KEY_HEADPEEK: string = 'HeadPeek'
    static readonly KEY_TTSSPEAK: string = 'TtsSpeak'
    static readonly KEY_TTSSPEAKTIME: string = 'TtsSpeakTime'
    static readonly KEY_TTSSETVOICE: string = 'TtsSetVoice'
    static readonly KEY_TTSSWITCHVOICEGENDER: string = "TtsSwitchVoiceGender"
    static readonly KEY_SCREENSHOT: string = 'Screenshot'
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

    static instance: IConfig ={
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
            doNotShow: []
        },
        obs: {
            password: '',
            port: 4445,
            sources: [
                {
                    key: Config.KEY_ROOMPEEK,
                    sceneNames: [''],
                    sourceName: '',
                    duration: 11000
                },
                {
                    key: Config.KEY_HEADPEEK,
                    sceneNames: [''],
                    sourceName: '',
                    duration: 11000
                }
            ],
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
            rewards: [
                {
                    key: Config.KEY_ROOMPEEK,
                    id: ''
                },{
                    key: Config.KEY_HEADPEEK,
                    id: ''
                }
                ,
                {
                    key: Config.KEY_TTSSPEAK,
                    id: ''
                },{
                    key: Config.KEY_TTSSPEAKTIME,
                    id: ''
                },{
                    key: Config.KEY_TTSSETVOICE,
                    id: ''
                },{
                    key: Config.KEY_TTSSWITCHVOICEGENDER,
                    id: ''
                }
                ,
                {
                    key: Config.KEY_SCREENSHOT,
                    id: ''
                }
                ,
                {
                    key: Config.KEY_FAVORITEVIEWER,
                    id: ''
                }
                ,
                {
                    key: Config.KEY_COLOR_NEUTRAL,
                    id: ''
                },{
                    key: Config.KEY_COLOR_RED,
                    id: ''
                },{
                    key: Config.KEY_COLOR_ORANGE,
                    id: ''
                },{
                    key: Config.KEY_COLOR_BUTTERCUP,
                    id: ''
                },{
                    key: Config.KEY_COLOR_YELLOW,
                    id: ''
                },{
                    key: Config.KEY_COLOR_GREEN,
                    id: ''
                },{
                    key: Config.KEY_COLOR_CYAN,
                    id: ''
                },{
                    key: Config.KEY_COLOR_SKY,
                    id: ''
                },{
                    key: Config.KEY_COLOR_BLUE,
                    id: ''
                },{
                    key: Config.KEY_COLOR_PURPLE,
                    id: ''
                },{
                    key: Config.KEY_COLOR_PINK,
                    id: ''
                }
            ]
        },
        screenshots: {
            port: 8807,
            delay: 5
        },
        discord: {
            remoteScreenshotEmbedColor: '#000000',
            manualScreenshotEmbedColor: '#FFFFFF',
            webhooks: [{
                key: Config.KEY_DISCORD_SSSVR,
                id: '',
                token: ''
            },{
                key: Config.KEY_DISCORD_CHAT,
                id: '',
                token: ''
            }]
        },
        philipshue: {
            serverPath: '',
            userName: '',
            lightsToControl: []
        },
        openvr2ws: {
            port: 7708
        }
    }
}