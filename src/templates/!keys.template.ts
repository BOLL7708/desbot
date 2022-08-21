/**
 * !Keys
 * 
 * This file exists to string references for commands and rewards that
 * are used throughout the system for triggering and referencing things.
 */
type TKeysTemplate =
    'Unknown'

    // Default
    | 'SetVoice'

    // Commands
    | 'TtsOn'
    | 'TtsOff'
    | 'Silence'
    | 'TtsDie'
    | 'TtsNick'
    | 'TtsGetNick'
    | 'TtsClearNick'
    | 'TtsMute'
    | 'TtsUnmute'
    | 'TtsVoices'
    | 'TtsGetVoice'
    | 'TtsGender'
    | 'Chat'
    | 'ChatOn'
    | 'ChatOff'
    | 'PingOn'
    | 'PingOff'
    | 'LogOn'
    | 'LogOff'
    | 'Scale'
    | 'DictionarySetWord'
    | 'DictionaryGetWord'
    | 'DictionaryClearWord'
    | 'UpdateRewards'
    | 'ReloadWidget'
    | 'GameRewardOn'
    | 'GameRewardsOff'
    | 'ChannelTrophyStats'
    | 'Clips'
    | 'Game'
    | 'GameReset'
    | 'Quote'
    | 'RefundRedemption'
    | 'ClearRedemptions'
    | 'Raid'
    | 'Unraid'
    | 'ResetIncrementingEvents'
    | 'ResetAccumulatingEvents'
    | 'RemoteOn'
    | 'RemoteOff'
    
    // Dangerous WIP SteamVR settings commands
    | 'RefreshRate'
    | 'Brightness'
    | 'VrViewEye'

    // Template example commands
    | 'Say'
    | 'Label'
    | 'Todo'
    | 'EndStream'
    | 'ShoutOut'
    | 'Lurk'
    | 'Widget'
    | 'Wiki'

    // Rewards

    | 'Speak'
    | 'ChannelTrophy'

    // Other
    
    // Discord
    | 'DiscordChat'
    | 'DiscordVRScreenshot'
    | 'DiscordOBSScreenshot'

    // Chat (sound, pipe, text, more?)
    | 'EverythingChat'

    // Callback keys
    | 'CallbackAppID'
    | 'CallbackAchievement'

    /*
     * Use this area to add your own keys for rewards you want.
     * The same key is used to set various configs to be used.
     * Mimic what you see above in the Rewards section.
     */
    
    // | 'YourEventUniqueIdentifier'