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
    static readonly COMMAND_QUOTE: string = 'quote'
    static readonly COMMAND_REFUND_REDEMPTION: string = 'refund'
    static readonly COMMAND_CLEAR_REDEMPTIONS: string = 'clearqueue'
    static readonly COMMAND_RAID: string = 'raid'
    static readonly COMMAND_UNRAID: string = 'unraid'
    static readonly COMMAND_RESET_INCREWARD: string = 'resetincrew'
    static readonly COMMAND_RESET_ACCREWARD: string = 'resetaccrew'
    
    // Dangerous WIP SteamVR settings commands
    static readonly COMMAND_REFRESHRATE: string = 'hz'
    static readonly COMMAND_BRIGHTNESS: string = 'lux'
    static readonly COMMAND_VRVIEWEYE: string = 'eye'

    // Template example commands
    static readonly COMMAND_SAY: string = 'say'
    static readonly COMMAND_LABEL: string = 'label'
    static readonly COMMAND_TODO: string = 'todo'
    static readonly COMMAND_END_STREAM: string = 'endstream'
   
    /*
    .#####...######..##...##...####...#####...#####....####..
    .##..##..##......##...##..##..##..##..##..##..##..##.....
    .#####...####....##.#.##..######..#####...##..##...####..
    .##..##..##......#######..##..##..##..##..##..##......##.
    .##..##..######...##.##...##..##..##..##..#####....####..
    */
    static readonly REWARD_TTSSPEAK: string = 'Speak'
    static readonly REWARD_TTSSETVOICE: string = 'SetVoice'
    static readonly REWARD_TTSSWITCHVOICEGENDER: string = 'SwitchVoiceGender'
    static readonly REWARD_CHANNELTROPHY: string = 'ChannelTrophy'

    /*
    ..####...######..##..##..######..#####..
    .##..##....##....##..##..##......##..##.
    .##..##....##....######..####....#####..
    .##..##....##....##..##..##......##..##.
    ..####.....##....##..##..######..##..##.
    */
    
    // Discord
    static readonly DISCORD_CHAT: string = 'DiscordChat'
    static readonly DISCORD_VRSCREENSHOT: string = 'DiscordVRScreenshot'
    static readonly DISCORD_OBSSCREENSHOT: string = 'DiscordOBSScreenshot'

    // Chat (sound, pipe, text, more?)
    static readonly CHAT: string = 'EverythingChat'

    // Callback keys
    static readonly CALLBACK_APPID: string = 'CallbackAppID'
    static readonly CALLBACK_ACHIEVEMENT: string = 'CallbackAchievement'

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
