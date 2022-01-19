// Config
interface ITwitchConfig {
    channelName: string
    chatbotName: string
    announcerName: string
    chatNotificationSound: string
    announcerTriggers: string[]

    proxyChatBotName: string
    proxyChatFormat: RegExp
    
    ignoreModerators: string[]

    skipUpdatingRewards: string[]
    defaultRewards: string[]
    disableRewards: string[]
    autoRewards: string[]
    disableAutoRewardAfterUse: string[]
    rewardConfigProfileDefault: ITwitchRewardProfileConfig
    rewardConfigs: { [key: string]: ITwitchHelixRewardConfig|ITwitchHelixRewardConfig[] }
    rewardConfigProfilePerGame: { [key: string]: ITwitchRewardProfileConfig }
    rewardConfigProfileNoGame: { [key: string]: boolean }
    turnOnRewardForGames: { [key: string]: string[] } // Turn on awards depending on if a game is running, else off
    turnOffRewardForGames: { [key: string]: string[] } // Turn off awards depending on if a game is running, else on
    gameSpecificRewards: string[]
    gameSpecificRewardsPerGame: { [key: string]: { [key: string]: ITwitchHelixRewardUpdate } }
    channelTrophyUniqueNumbers: IChannelTrophyFunnyNumberTexts
}
interface ITwitchReward {
    id: string
    callback: ITwitchRedemptionCallback
}

// Settings
interface ITwitchTokens {
    username: string
    access_token: string
    refresh_token: string
    updated: string
}
interface ITwitchRewardCounter {
    key: string
    count: number
}

interface ITwitchSlashCommand {
    trigger: string
    permissions?: ICommandPermissions // Filled in at registration, loaded from config.
    callback: ITwitchSlashCommandCallback
    cooldown?: number
    cooldownCallback?: ITwitchSlashCommandCallback
}
interface ICommandPermissions {
    streamer?: boolean
    moderators?: boolean
    VIPs?: boolean
    subscribers?: boolean
    everyone?: boolean
}
interface ITwitchAnnouncement {
    userName: string
    triggers: string[]
    callback: ITwitchAnnouncementCallback
}

interface ITwitchRewardProfileConfig {
    [key: string]: boolean
}
// Callbacks
interface ITwitchChatCallback { // In Twitch
    (userName: ITwitchUserData, messageData:ITwitchMessageData): void
}
interface ITwitchRedemptionCallback {
    (message: ITwitchRedemptionMessage, index?: number): void
}
interface ITwitchChatMessageCallback {
    (message: ITwitchMessageCmd): void
}
interface ITwitchSlashCommandCallback {
    (userData: ITwitchUserData, input: string): void
}
interface ITwitchAnnouncementCallback {
    (userData: ITwitchUserData, messageData:ITwitchMessageData, firstWord:string): void
}
interface ITwitchChatCheerCallback {
    (userData: ITwitchUserData, messageData:ITwitchMessageData): void
}
interface ITwitchRewardRedemptionCallback {
    (message: ITwitchRedemptionMessage): void
}

// Callback data
interface ITwitchUserData {
    userId: string
    userName: string
    displayName: string
    color: string
    isModerator: boolean
    isVIP: boolean
    isSubscriber: boolean
    isBroadcaster: boolean
}
interface ITwitchMessageData {
    text: string
    bits: number
    isAction: boolean
    emotes: ITwitchEmote[]
}