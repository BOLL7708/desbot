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
    rewards: string[]
    autoRewards: string[]
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
    mods: boolean
    everyone: boolean
    callback: ITwitchSlashCommandCallback
}
interface ITwitchAnnouncement {
    userName: string
    triggers: string[]
    callback: ITwitchAnnouncementCallback
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
    isMod: boolean
    isBroadcaster: boolean
}
interface ITwitchMessageData {
    text: string
    bits: number
    isAction: boolean
    emotes: ITwitchEmote[]
}