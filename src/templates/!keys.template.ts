/**
 * !Keys
 * 
 * This file exists to provide static references for commands and rewards that
 * are used throughout the system for triggering things.
 * 
 * It's important to _NOT_ remove any keys from the Default section, but you can
 * edit them or in the case of commands put in an empty string to disable them.
 */
class KeysTemplate {
    /*
    .########..########.########....###....##.....##.##.......########
    .##.....##.##.......##.........##.##...##.....##.##..........##...
    .##.....##.##.......##........##...##..##.....##.##..........##...
    .##.....##.######...######...##.....##.##.....##.##..........##...
    .##.....##.##.......##.......#########.##.....##.##..........##...
    .##.....##.##.......##.......##.....##.##.....##.##..........##...
    .########..########.##.......##.....##..#######..########....##...
    */

    /*
    ..####....####...##...##..##...##...####...##..##..#####....####..
    .##..##..##..##..###.###..###.###..##..##..###.##..##..##..##.....
    .##......##..##..##.#.##..##.#.##..######..##.###..##..##...####..
    .##..##..##..##..##...##..##...##..##..##..##..##..##..##......##.
    ..####....####...##...##..##...##..##..##..##..##..#####....####..
    */
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
    static readonly COMMAND_CHANNELTROPHY_STATS: string = 'trophy'
    static readonly COMMAND_CLIPS: string = 'clips'
    static readonly COMMAND_GAME: string = 'game'
    static readonly COMMAND_GAMERESET: string = 'nogame'
    
    // Dangerous WIP SteamVR settings commands
    static readonly COMMAND_REFRESHRATE: string = 'hz'
    static readonly COMMAND_BRIGHTNESS: string = 'lux'
    static readonly COMMAND_VRVIEWEYE: string = 'eye'
   
    /*
    .#####...######..##...##...####...#####...#####....####..
    .##..##..##......##...##..##..##..##..##..##..##..##.....
    .#####...####....##.#.##..######..#####...##..##...####..
    .##..##..##......#######..##..##..##..##..##..##......##.
    .##..##..######...##.##...##..##..##..##..#####....####..
    */
    static readonly KEY_TTSSPEAK: string = 'Speak'
    static readonly KEY_TTSSETVOICE: string = 'SetVoice'
    static readonly KEY_TTSSWITCHVOICEGENDER: string = 'SwitchVoiceGender'
    static readonly KEY_SCREENSHOT: string = 'Screenshot'
    static readonly KEY_INSTANTSCREENSHOT: string = 'InstantScreenshot'
    static readonly KEY_CHANNELTROPHY: string = 'ChannelTrophy'

    /*
    ..####...######..##..##..######..#####..
    .##..##....##....##..##..##......##..##.
    .##..##....##....######..####....#####..
    .##..##....##....##..##..##......##..##.
    ..####.....##....##..##..######..##..##.
    */
    
    // Discord
    static readonly KEY_DISCORD_CHAT: string = 'DiscordChat'
    static readonly KEY_DISCORD_VRSCREENSHOT: string = 'DiscordVRScreenshot'
    static readonly KEY_DISCORD_OBSSCREENSHOT: string = 'DiscordOBSScreenshot'

    // Chat (sound, pipe, text, more?)
    static readonly KEY_MIXED_CHAT: string = 'EverythingChat'

    // Callback keys
    static readonly KEY_CALLBACK_APPID: string = 'CallbackAppID'
    static readonly KEY_CALLBACK_ACHIEVEMENT: string = 'CallbackAchievement'

    /*
    ..######..##.....##..######..########..#######..##.....##
    .##....##.##.....##.##....##....##....##.....##.###...###
    .##.......##.....##.##..........##....##.....##.####.####
    .##.......##.....##..######.....##....##.....##.##.###.##
    .##.......##.....##.......##....##....##.....##.##.....##
    .##....##.##.....##.##....##....##....##.....##.##.....##
    ..######...#######...######.....##.....#######..##.....##
    */

    /*
     * Use this area to add your own keys for rewards you want.
     * The same key is used to set various configs to be used.
     * Mimic what you see above in the Rewards section.
     */
    
    // static readonly KEY_YOURREWARD: string = 'YourRewardUniqueIdentifier'
}