// Config
interface ITwitchConfig {
    userId: number
    clientId: string
    clientSecret: string
    channelName: string

    botName: string
    announcerName: string
    chatNotificationSound: string
    announcerTriggers: string[]

    proxyChatBotName: string
    proxyChatFormat: RegExp

    skipUpdatingRewards: string[]
    defaultRewards: string[]
    disableRewards: string[]
    autoRewards: string[]
    disableAutoRewardAfterUse: string[]
    rewardConfigs: ITwitchRewards
    rewardConfigProfileDefault: ITwitchRewardProfileConfig
    rewardConfigProfilePerGame: ITwitchRewardProfilePerGame
    gameSpecificRewards: string[]
    gameSpecificRewardsPerGame: ITwitchRewardsForSpecificGames
}
interface ITwitchReward {
    id: string
    callback: ITwitchRedemptionCallback
}
interface ITwitchTokens {
    access_token: string
    refresh_token: string
    updated: string
}
interface ITwitchSlashCommand {
    trigger: string
    permissions?: ICommandPermissions
    callback: ITwitchSlashCommandCallback
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

interface ITwitchRewards {
    [key: string]: ITwitchHelixRewardConfig
}
interface ITwitchRewardProfileConfig {
    [key: string]: boolean
}
interface ITwitchRewardProfilePerGame {
    [key: string]: ITwitchRewardProfileConfig
}
interface ITwitchRewardsForSpecificGames {
    [key: string]: {[key: string]: ITwitchHelixRewardUpdate}
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