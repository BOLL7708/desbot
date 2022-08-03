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
    static readonly EVENT_TTSSETVOICE = 'SetVoice'

    /*
    ..####....####...##...##..##...##...####...##..##..#####....####..
    .##..##..##..##..###.###..###.###..##..##..###.##..##..##..##.....
    .##......##..##..##.#.##..##.#.##..######..##.###..##..##...####..
    .##..##..##..##..##...##..##...##..##..##..##..##..##..##......##.
    ..####....####...##...##..##...##..##..##..##..##..#####....####..
    */
    static readonly COMMAND_TTS_ON = 'TtsOn'
    static readonly COMMAND_TTS_OFF = 'TtsOff'
    static readonly COMMAND_TTS_SILENCE = 'Silence'
    static readonly COMMAND_TTS_DIE = 'TtsDie'
    static readonly COMMAND_TTS_NICK = 'TtsNick'
    static readonly COMMAND_TTS_GETNICK = 'TtsGetNick'
    static readonly COMMAND_TTS_CLEARNICK = 'TtsClearNick'
    static readonly COMMAND_TTS_MUTE = 'TtsMute'
    static readonly COMMAND_TTS_UNMUTE = 'TtsUnmute'
    static readonly COMMAND_TTS_VOICES = 'TtsVoices'
    static readonly COMMAND_TTS_GETVOICE = 'TtsGetVoice'
    static readonly COMMAND_TTS_GENDER = 'TtsGender'
    static readonly COMMAND_CHAT = 'Chat'
    static readonly COMMAND_CHAT_ON = 'ChatOn'
    static readonly COMMAND_CHAT_OFF = 'ChatOff'
    static readonly COMMAND_PING_ON = 'PingOn'
    static readonly COMMAND_PING_OFF = 'PingOff'
    static readonly COMMAND_LOG_ON = 'LogOn'
    static readonly COMMAND_LOG_OFF = 'LogOff'
    static readonly COMMAND_SCALE = 'Scale'
    static readonly COMMAND_DICTIONARY_SET = 'DictionarySetWord'
    static readonly COMMAND_DICTIONARY_GET = 'DictionaryGetWord'
    static readonly COMMAND_DICTIONARY_CLEAR = 'DictionaryClearWord'
    static readonly COMMAND_UPDATEREWARDS = 'UpdateRewards'
    static readonly COMMAND_RELOADWIDGET = 'ReloadWidget'
    static readonly COMMAND_GAMEREWARDS_ON = 'GameRewardOn'
    static readonly COMMAND_GAMEREWARDS_OFF = 'GameRewardsOff'
    static readonly COMMAND_CHANNELTROPHY_STATS = 'ChannelTrophyStats'
    static readonly COMMAND_CLIPS = 'Clips'
    static readonly COMMAND_GAME = 'Game'
    static readonly COMMAND_GAMERESET = 'GameReset'
    static readonly COMMAND_QUOTE = 'Quote'
    static readonly COMMAND_REFUND_REDEMPTION = 'RefundRedemption'
    static readonly COMMAND_CLEAR_REDEMPTIONS = 'ClearRedemptions'
    static readonly COMMAND_RAID = 'Raid'
    static readonly COMMAND_UNRAID = 'Unraid'
    static readonly COMMAND_RESET_INCREWARD = 'ResetIncrementingRewards'
    static readonly COMMAND_REMOTE_ON = 'RemoteOn'
    static readonly COMMAND_REMOTE_OFF = 'RemoteOff'
    
    // Dangerous WIP SteamVR settings commands
    static readonly COMMAND_REFRESHRATE = 'RefreshRate'
    static readonly COMMAND_BRIGHTNESS = 'Brightness'
    static readonly COMMAND_VRVIEWEYE = 'VrViewEye'

    // Template example commands
    static readonly COMMAND_SAY = 'Say'
    static readonly COMMAND_LABEL = 'Label'
    static readonly COMMAND_TODO = 'Todo'
    static readonly COMMAND_END_STREAM = 'EndStream'
    static readonly COMMAND_SHOUTOUT = 'ShoutOut'
    static readonly COMMAND_LURK = 'Lurk'
    static readonly COMMAND_WIDGET = 'Widget'
    static readonly COMMAND_WIKI = 'Wiki'
   
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