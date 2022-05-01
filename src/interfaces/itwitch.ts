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
     * A list of rewards that will only be created, not updated using `!update`.
     * Usually references from: `Keys.*`, and it's recommended to put the channel trophy reward in here if you use it.
     */
    skipUpdatingRewards: string[]
    /**
     * These rewards will always be switched on at widget load, unless they are also listed in `disableRewards`.
     * 
     * Useful to enable specific rewards in sub-configs.
     */
    alwaysOnRewards: string[]
    /**
     * These rewards will be switched off at widget load.
     * 
     * Useful to disable specific rewards in sub-configs.
     */
    alwaysOffRewards: string[]
    
    /**
     * Reward configs, if you add new ones they will be automatically created the next
     * time you run the widget. If you want to update an existing reward config, save your changes, reload
     * the widget and then run `!update` in chat, this will apply the current configs to existing rewards.
     * 
     * Rewards should have the minimum of `title` and `cost`, and the title needs to be unique among all 
     * custom rewards on your channel.
     * 
     * Default rewards that control system features, you can set `is_enabled` to `false` or
     * remove the configs before running it the first time if you don't want a specific feature.
     */
    defaultRewardConfigs: { [key: string]: ITwitchRewardConfig }
    
    /**
     * Automatic reward configs can also include all the various functions and properties that are
     * dynamically assigned.
     * 
     * As a reference, the following functions can be triggered by an automatic rewards:
     * - Toggle OBS sources or filters
     * - Toggle and change color of Philips Hue lights
     * - Toggle Philips Hue plugs
     * - Play back audio effects
     * - Speak using TTS
     * - Send overlays into VR
     * - Change SteamVR settings
     * - Press keys in a specific desktop window
     * - Load a web URL in the background
     * - Take screenshots via SSSVR or OBS
     */
    rewardConfigs: { [key: string]: ITwitchRewardConfig }

    /**
     * Automatic rewards that are specific for a game, they are dynamically updated depending on 
     * the current Steam title. Will be disabled if no config is available.
     */
    gameSpecificRewardDefaultConfigs: { [key: string]: ITwitchRewardConfig }
    
    /**
     * Configuration for rewards that will be updated per game. This literally changes what the reward
     * looks like and what it does, basically resusing the same reward for different games.
     */
    gameSpecificRewardConfigsPerGame: { [key: string]: { [key: string]: ITwitchRewardConfig } }

    /**
     * Default for turning rewards on or off depending on Steam game.
     * Applied when no specific profile is found
     */
    rewardConfigProfileDefault: ITwitchRewardProfileConfig

    /**
     * Default for turning rewards on or off depending on SteamVR game.
     * Applied when no specific profile is found
     */
    rewardConfigProfileDefaultVR: ITwitchRewardProfileConfig

    /**
     * Turn rewards on or off if there is no game,
     * will be applied on top of the default profile, the configs are merged.
     */
    rewardConfigProfileNoGame: { [key: string]: boolean }

    /**
     * Turn rewards on or off depending on which SteamVR game is detected,
     * will be applied on top of the default profile, the configs are merged.
     */
    rewardConfigProfilePerGame: { [key: string]: ITwitchRewardProfileConfig }

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
    
    /**
     * Numbers that overrides/complements defined patterns for the Channel Trophy reward.
     */
    channelTrophyUniqueNumbers: IChannelTrophyFunnyNumberTexts
}
interface ITwitchReward {
    id?: string
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

interface ITwitchSlashCommand {
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
    callback?: ITwitchSlashCommandCallback
    /**
     * Optional: The number of seconds before the `cooldownCallback` can be run again.
     */
    cooldown?: number
    /**
     * Optional: A callback that can only be run once in every `cooldown` seconds.
     * 
     * Note: The broadcaster and moderators are exempt from cooldowns.
     */
    cooldownCallback?: ITwitchSlashCommandCallback
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
    (user: ITwitchActionUser, messageData: ITwitchMessageData): void
}
interface ITwitchActionCallback {
    (user: ITwitchActionUser, index?: number, redemptionMessage?: ITwitchRedemptionMessage): void
}
interface ITwitchChatMessageCallback {
    (message: ITwitchMessageCmd): void
}
interface ITwitchSlashCommandCallback {
    (user: ITwitchActionUser): void
}
interface ITwitchAnnouncementCallback {
    (user: ITwitchActionUser, messageData: ITwitchMessageData, firstWord: string): void
}
interface ITwitchChatCheerCallback {
    (user: ITwitchActionUser, messageData: ITwitchMessageData): void
}
interface ITwitchRewardRedemptionCallback {
    (message: ITwitchRedemptionMessage): void
}

// Callback data
interface ITwitchMessageData {
    text: string
    bits: number
    isAction: boolean
    emotes: ITwitchEmote[]
}

/**
 * Main config object for a reward.
 */
interface ITwitchRewardConfig {
    // TODO: Add array support to everything? Random/Shuffle functionality?

    // Twitch Reward Settings
    reward: ITwitchHelixRewardConfig|ITwitchHelixRewardConfig[]
    
    // Automatic Reward Settings
    openVR2WS?: IOpenVR2WSSetting|IOpenVR2WSSetting[]
    obs?: IObsSourceConfig
    pipe?: IPipeMessagePreset|IPipeMessagePreset[]
    screenshots?: IScreenshot
    lights?: IPhilipsHueColorConfig|IPhilipsHueColorConfig[]
    plugs?: IPhilipsHuePlugConfig
    audio?: IAudio
    speech?: string|string[]
    sign?: ISignShowConfig
    exec?: IExecConfig
    web?: string
}

/**
 * Combined Reward and Command result object for shared actions.
 */
interface ITwitchActionUser {
    id: string
    login: string
    name: string
    input: string
    color: string
    isBroadcaster: boolean
    isModerator: boolean
    isVIP: boolean
    isSubscriber: boolean
}