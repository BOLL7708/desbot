/**
 * Settings for various Twitch functions, like chat and rewards.
 */
interface ITwitchConfig {
    /**
     * The name of the channel to connect to as well as the username that will be used when registering and managing rewards.
     * 
     * Make sure to also provide an initial refresh token in: `Config.credentials.TwitchChannelRefreshToken`
     */
    channelName: string
    /**
     * The username of the chatbot used when reading and speaking in chat as well as sending whispers, this can be the same as `channelName`.
     * 
     * Note: New users might not be able to send whispers to random users, due to Twitch spambot prevention.
     * 
     * Make sure to also provide an initial refresh token in: `Config.credentials.TwitchChatbotRefreshToken`
     */
    chatbotName: string
    /**
     * Prefix for triggering chat commands.
     */
    commandPrefix: string
    /**
     * Prefix for triggering remote chat commands.
     */
    remoteCommandPrefix: string
    /**
     * Set this to a Twitch channel name if you want to allow remote commands from a different channel.
     */
    remoteCommandChannel: string
        /**
     * Optional: Only allow this command for these specific users.
     */
    remoteCommandAllowedUsers: string[]
    /**
     * If you are using any bots that writes in chat, you can allow them to announce things using the TTS, provide their names here.
     * 
     * It will only announce things that are using the triggers in `anouncerTriggers`.
     */
    announcerNames: string[]
    /**
     * The triggers that the announcer will use to announce things. 
     * 
     * These could be referenced in `Keys.*` and also used to trigger sound effects, as with automatic rewards.
     */
    announcerTriggers: string[]
    /**
     * Subscription types to announce in chat.
     */
    announceSubs: IAnnounceSubConfig[],
    /**
     * Cheer levels to announce in chat.
     */
    announceCheers: IAnnounceCheerConfig[],

    /**
     * When using a chat proxy service, like Restream, you can use this to read the messges coming in from that bot as if it were the original user.
     */
    proxyChatBotName: string
    /**
     * A regular expression to extraxt the username and message from the proxy chat message.
     * There should be three capture groups, in order: `botname, username, message`
     * 
     * Example meant to be used with Restream: `/\[(\w*):\s(.+)\]\s(.+)/`
     */
    proxyChatFormat: RegExp
    
    /**
     * List of moderators that should not be able to execute commands, useful for bots.
     */
    ignoreModerators: string[]

    /**
     * These rewards will be switched on at widget load as well as on game change.
     * 
     * The only override is if they are also listed in {@link ITwitch.alwaysOffRewards}.
     */
    alwaysOnRewards: string[]
    /**
     * These rewards will always be switched off at widget load as well as on game change.
     */
    alwaysOffRewards: string[]
    
    /**
     * Default for turning rewards on or off depending on Steam game.
     * Applied when no specific profile is found
     */
    rewardProfileDefault: ITwitchRewardProfileConfig

    /**
     * Default for turning rewards on or off depending on SteamVR game.
     * Applied when no specific profile is found
     */
    rewardProfileDefaultVR: ITwitchRewardProfileConfig

    /**
     * Turn rewards on or off if there is no game,
     * will be applied on top of the default profile, the configs are merged.
     */
    rewardProfileNoGame: { [key: string]: boolean }

    /**
     * Turn rewards on or off depending on which SteamVR game is detected,
     * will be applied on top of the default profile, the configs are merged.
     */
    rewardProfilePerGame: { [key: string]: ITwitchRewardProfileConfig }

    /**
     * Turn on rewards depending on if a game is running, else off.
     */
    turnOnRewardForGames: { [key: string]: string[] }
    
    /**
     * Turn off rewards depending on if a game is running, else on
     */
    turnOffRewardForGames: { [key: string]: string[] }

    /**
     * Turn on rewards for specific overlays, can be used to toggle rewards on 
     * things like LIV running as it has an overlay that is always enabled.
     */
    turnOnRewardForOverlays: { [key: string]: string[] }  
}
interface ITwitchReward {
    id?: string
    callback?: ITwitchActionCallback
}
interface ITwitchCheer {
    bits: number
    callback?: ITwitchActionCallback
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

interface ITwitchActionCommandConfig {
    /**
     * The command that is matched from the chat.
     * 
     * Note: This is overwritten by the key value at registration as it needs to be in the config later on.
     */
    trigger?: string
    /**
     * Permission for who can execute this command.
     */
    permissions?: ICommandPermissions
    /**
     * Optional: The number of seconds before this can be used again, by anyone.
     */
    cooldown?: number
    /**
     * Optional: Require this command to include a user tag to actually get triggered.
     */
    requireUserTag?: boolean
}

interface ITwitchActionRemoteCommandConfig {
    /**
     * The command that is matched from the chat.
     * 
     * Note: This is overwritten by the key value at registration as it needs to be in the config later on.
     */
    trigger?: string
    /**
     * Optional: The number of seconds before this can be used again, by anyone.
     */
    cooldown?: number
}

interface ITwitchCommandConfig {
    /**
     * The command that is matched from the chat.
     */
    trigger: string
    /**
     * Permission for who can execute this command.
     * 
     * Note: Filled in at registration, loaded from config.
     */
    permissions?: ICommandPermissions
    /**
     * Optional: The callback the command executes.
     */
    callback?: ITwitchCommandCallback
    /**
     * Optional: The number of seconds before the `cooldownCallback` can be run again.
     */
    cooldown?: number
    /**
     * Optional: A callback that can only be run once in every `cooldown` seconds.
     * 
     * Note: The broadcaster and moderators are exempt from cooldowns.
     */
    cooldownCallback?: ITwitchCommandCallback
    /**
     * Optional: Only allow this command for these specific users.
     */
    allowedUsers?: string[]
}

/**
 * Permission regarding who can trigger this command in the chat.
 */
interface ICommandPermissions {
    /**
     * The channel owner/streamer.
     */
    streamer?: boolean
    /**
     * Moderators for the channel.
     */
    moderators?: boolean
    /**
     * People set to VIP in the channel.
     */
    VIPs?: boolean
    /**
     * People subscribed to the channel.
     */
    subscribers?: boolean
    /**
     * Absolutely anyone at all.
     */
    everyone?: boolean
}
interface ITwitchAnnouncement {
    userNames: string[]
    triggers: string[]
    callback: ITwitchAnnouncementCallback
}

interface ITwitchRewardProfileConfig {
    [key: string]: boolean
}
// Callbacks
interface ITwitchChatCallback { // In Twitch
    (user: IActionUser, messageData: ITwitchMessageData): void
}
interface ITwitchActionCallback {
    (user: IActionUser, index?: number, redemptionMessage?: ITwitchPubsubRewardMessage): void
}
interface ITwitchChatMessageCallback {
    (message: ITwitchMessageCmd): void
}
interface ITwitchCommandCallback {
    (user: IActionUser): void
}
interface ITwitchAnnouncementCallback {
    (user: IActionUser, messageData: ITwitchMessageData, firstWord: string): void
}
interface ITwitchChatCheerCallback {
    (user: IActionUser, messageData: ITwitchMessageData): void
}
interface ITwitchRewardRedemptionCallback {
    (message: ITwitchPubsubRewardMessage): void
}

// Callback data
interface ITwitchMessageData {
    text: string
    bits: number
    isAction: boolean
    emotes: ITwitchEmote[]
}
interface IAnnounceCheerConfig {
    bits: number
    message: string
}