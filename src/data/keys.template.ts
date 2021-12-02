// Rename this file to keys.ts, refactor the class to Keys.
// Apply your changes, reference these in your config and elsewhere.
class KeysTemplate {
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
    static readonly COMMAND_UPDATEREWARDS: string = 'update'
    static readonly COMMAND_RELOADWIDGET: string = 'reload'
    static readonly COMMAND_GAMEREWARDS_ON: string = 'rewardson'
    static readonly COMMAND_GAMEREWARDS_OFF: string = 'rewardsoff'
    static readonly COMMAND_SOURCESCREENSHOT: string = 'screenshot'
    static readonly COMMAND_CHANNELTROPHY_STATS: string = 'trophy'
    static readonly COMMAND_CLIPS: string = 'clips'
    static readonly COMMAND_GAME: string = 'game'
    
    // Dangerous WIP SteamVR settings commands
    static readonly COMMAND_REFRESHRATE: string = 'hz'
    static readonly COMMAND_BRIGHTNESS: string = 'lux'
    static readonly COMMAND_VRVIEWEYE: string = 'eye'
    
    // Discord
    static readonly KEY_DISCORD_SSSVR: string = 'DiscordSSSRV'
    static readonly KEY_DISCORD_CHAT: string = 'DiscordChat'

    // Static audio
    static readonly KEY_SOUND_CHAT: string = 'ChatSound'

    // Static rewards
    static readonly KEY_TTSSPEAK: string = 'Speak'
    static readonly KEY_TTSSPEAKTIME: string = 'SpeakTime'
    static readonly KEY_TTSSETVOICE: string = 'SetVoice'
    static readonly KEY_TTSSWITCHVOICEGENDER: string = 'SwitchVoiceGender'
    static readonly KEY_SCREENSHOT: string = 'Screenshot'
    static readonly KEY_INSTANTSCREENSHOT: string = 'InstantScreenshot'
    static readonly KEY_CHANNELTROPHY: string = 'ChannelTrophy'
    static readonly KEY_UNLOCKREWARDTIMER: string = 'UnlockRewardTimer'

    // Automatically loaded rewards
    static readonly KEY_OBS_EXAMPLE1: string = 'ObsExample1'
    static readonly KEY_OBS_EXAMPLE2: string = 'ObsExample2'
    static readonly KEY_OBS_EXAMPLE3: string = 'ObsExample3'
    static readonly KEY_COLOR_EXAMPLE1: string = 'ColorExample1'
    static readonly KEY_COLOR_EXAMPLE2: string = 'ColorExample2'
    static readonly KEY_SOUND_EXAMPLE1: string = 'SoundExample1'
    static readonly KEY_SOUND_EXAMPLE2: string = 'SoundExample2'
    static readonly KEY_PIPE_EXAMPLE1: string = 'PipeExample1'
    static readonly KEY_PIPE_EXAMPLE2: string = 'PipeExample2'
    static readonly KEY_SETTING_EXAMPLE1: string = 'SettingExample1'
    static readonly KEY_SETTING_EXAMPLE2: string = 'SettingExample2'
    static readonly KEY_GAME_EXAMPLE1: string = 'GameExample1'
    static readonly KEY_GAME_EXAMPLE2: string = 'GameExample2'
    static readonly KEY_WEB_EXAMPLE1: string = 'WebExample1'

    // Message triggers used for TTS and audio referencing
    static readonly KEY_ANNOUNCE_EXAMPLE: string = '❓' // Any character, word or emote you want to match
}