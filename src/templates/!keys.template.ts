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
    static readonly EVENT_TTSSETVOICE = 'voice|setvoice'

    /*
    ..####....####...##...##..##...##...####...##..##..#####....####..
    .##..##..##..##..###.###..###.###..##..##..###.##..##..##..##.....
    .##......##..##..##.#.##..##.#.##..######..##.###..##..##...####..
    .##..##..##..##..##...##..##...##..##..##..##..##..##..##......##.
    ..####....####...##...##..##...##..##..##..##..##..#####....####..
    */
    static readonly COMMAND_TTS_ON = 'ttson'
    static readonly COMMAND_TTS_OFF = 'ttsoff'
    static readonly COMMAND_TTS_SILENCE = 'silence'
    static readonly COMMAND_TTS_DIE = 'ttsdie'
    static readonly COMMAND_TTS_NICK = 'nick|setnick'
    static readonly COMMAND_TTS_GETNICK = 'getnick'
    static readonly COMMAND_TTS_CLEARNICK = 'clearnick'
    static readonly COMMAND_TTS_MUTE = 'mute'
    static readonly COMMAND_TTS_UNMUTE = 'unmute'
    static readonly COMMAND_TTS_VOICES = 'tts|voices'
    static readonly COMMAND_TTS_GETVOICE = 'getvoice'
    static readonly COMMAND_TTS_GENDER = 'gender'
    static readonly COMMAND_CHAT = 'chat'
    static readonly COMMAND_CHAT_ON = 'chaton'
    static readonly COMMAND_CHAT_OFF = 'chatoff'
    static readonly COMMAND_PING_ON = 'pingon'
    static readonly COMMAND_PING_OFF = 'pingoff'
    static readonly COMMAND_LOG_ON = 'logon'
    static readonly COMMAND_LOG_OFF = 'logoff'
    static readonly COMMAND_SCALE = 'scale'
    static readonly COMMAND_DICTIONARY_SET = 'word|setword'
    static readonly COMMAND_DICTIONARY_GET = 'getword'
    static readonly COMMAND_DICTIONARY_CLEAR = 'clearword'
    static readonly COMMAND_UPDATEREWARDS = 'update'
    static readonly COMMAND_RELOADWIDGET = 'reload'
    static readonly COMMAND_GAMEREWARDS_ON = 'rewardson'
    static readonly COMMAND_GAMEREWARDS_OFF = 'rewardsoff'
    static readonly COMMAND_CHANNELTROPHY_STATS = 'trophy'
    static readonly COMMAND_CLIPS = 'clips'
    static readonly COMMAND_GAME = 'game'
    static readonly COMMAND_GAMERESET = 'nogame'
    static readonly COMMAND_QUOTE = 'quote'
    static readonly COMMAND_REFUND_REDEMPTION = 'refund'
    static readonly COMMAND_CLEAR_REDEMPTIONS = 'clearqueue'
    static readonly COMMAND_RAID = 'raid'
    static readonly COMMAND_UNRAID = 'unraid'
    static readonly COMMAND_RESET_INCREWARD = 'resetincrew'
    static readonly COMMAND_REMOTE_ON = 'remoteon'
    static readonly COMMAND_REMOTE_OFF = 'remoteoff'
    
    // Dangerous WIP SteamVR settings commands
    static readonly COMMAND_REFRESHRATE = 'hz'
    static readonly COMMAND_BRIGHTNESS = 'lux'
    static readonly COMMAND_VRVIEWEYE = 'eye'

    // Template example commands
    static readonly COMMAND_SAY = 'say'
    static readonly COMMAND_LABEL = 'label'
    static readonly COMMAND_TODO = 'todo'
    static readonly COMMAND_END_STREAM = 'endstream'
    static readonly COMMAND_SHOUTOUT = 'so'
    static readonly COMMAND_LURK = 'lurk'
    static readonly COMMAND_WIDGET = 'widget'
    static readonly COMMAND_WIKI = 'wiki'
   
    /*
    .#####...######..##...##...####...#####...#####....####..
    .##..##..##......##...##..##..##..##..##..##..##..##.....
    .#####...####....##.#.##..######..#####...##..##...####..
    .##..##..##......#######..##..##..##..##..##..##......##.
    .##..##..######...##.##...##..##..##..##..#####....####..
    */
    static readonly REWARD_TTSSPEAK = 'Speak'
    static readonly REWARD_CHANNELTROPHY = 'ChannelTrophy'

    /*
    ..####...######..##..##..######..#####..
    .##..##....##....##..##..##......##..##.
    .##..##....##....######..####....#####..
    .##..##....##....##..##..##......##..##.
    ..####.....##....##..##..######..##..##.
    */
    
    // Discord
    static readonly DISCORD_CHAT = 'DiscordChat'
    static readonly DISCORD_VRSCREENSHOT = 'DiscordVRScreenshot'
    static readonly DISCORD_OBSSCREENSHOT = 'DiscordOBSScreenshot'

    // Chat (sound, pipe, text, more?)
    static readonly CHAT = 'EverythingChat'

    // Callback keys
    static readonly CALLBACK_APPID = 'CallbackAppID'
    static readonly CALLBACK_ACHIEVEMENT = 'CallbackAchievement'

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
    
    // static readonly KEY_YOURREWARD = 'YourRewardUniqueIdentifier'
}