// Config
interface ITwitchConfig {
    userId: number
    clientId: string
    clientSecret: string
    channelName: string

    botName: string
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
    rewardConfigs: { [key: string]: ITwitchHelixRewardConfig }
    rewardConfigProfilePerGame: { [key: string]: ITwitchRewardProfileConfig }
    gameSpecificRewards: string[]
    gameSpecificRewardsPerGame: { [key: string]: { [key: string]: ITwitchHelixRewardUpdate } }
    channelTrophyUniqueNumbers: IChannelTrophyFunnyNumberTexts
}
interface ITwitchReward {
    id: string
    callback: ITwitchRedemptionCallback
}
interface ITwitchTokens {
    username: string
    access_token: string
    refresh_token: string
    updated: string
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
    (message: ITwitchRedemptionMessage): void
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