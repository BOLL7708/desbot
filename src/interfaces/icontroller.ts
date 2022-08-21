/**
 * These are the settings for `MainController`, the main class that connects all the different modules together.
 */
interface IControllerConfig {
    /**
     * Default settings for controller functions.
     */
    defaults: IControllerDefaults

    /**
     * Overrides settings for the controller functions based on the current game.
     */
    gameDefaults: { [key: string]: IControllerDefaults }

    /**
     * Turn WebSockets intergrations entirely on or off
     */
    websocketsUsed: {
        /**
         * Twitch Chat connection, for chat messages.
         */
        twitchChat: boolean
        /**
         * Twitch PubSub connection, for reward redemptions and other channel events.
         */
        twitchPubsub: boolean
        /**
         * OBS Studio connection, to toggle sources and filters.
         */
        obs: boolean
        /**
         * OpenVR2WS connection, to change SteamVR settings and get SteamVR running app ID.
         */
        openvr2ws: boolean
        /**
         * OpenVRNotificationPipe connection, to display messages and graphics as SteamVR overlays.
         */
        pipe: boolean
        /**
         * SuperScreenShotterVR connection, to take and receive SteamVR screenshots.
         */
        sssvr: boolean
    }
    
    /**
     * The default permissions for all commands, see overrides below.
     */
    commandPermissionsDefault: ICommandPermissions
    
    /**
     * These are texts spoken by the TTS for various commands and other events.
     * - The fixed section contains arrays that _needs_ a specific number of items in each.
     * - The dynamic section contains single strings that can be replaced with arrays for random selection or for incrementing rewards.
     * - %[label] is a templated value, those gets replaced by parameters that match their names.
     */
    speechReferences: Partial<Record<TKeys, string|string[]>>

    /**
     * References to texts written in chat by the bot.
     */
    chatReferences: Partial<Record<TKeys, string|string[]>>

    /**
     * As Twitch category can be automatically matched, this is the one used when there is no match.
     */
    defaultTwitchGameCategory: string

    /**
     * Console output will also be written to a file in the _settings folder.
     * It buffers the output and writes it every 10 seconds.
     */
    saveConsoleOutputToSettings: boolean

    /**
     * Messages that start with any of these symbols will not be spoken or piped into VR.
     */
    secretChatSymbols: string[] 

    /**
     * This is the settings for the Channel Trophy, a reward that a viewer can claim until someone else grabs it.
     * 
     * The reward will get the name of the previous redeemer, both in the title and in the prompt.
     * 
     * Note: The key for the channel trophy, {@link Keys}.CHANNEL_TROPHY, is also used for the
     * reward config in {@link Config.twitch.defaultRewardConfigs} which can include more settings.
     * These can be left out which means they just won't be used.
     */
    channelTrophySettings: {
        /**
         * The label that is written to disk.
         * 
         * The tag `%number` is the trophy number, and `%name` is the name of the redeemer.
         */
        label: string
        /**
         * The reward title that is used for the reward after it has been redeemed.
         * 
         * The tag `%name` is the name of the redeemer.
         */
        rewardTitle: string
        /**
         * The reward prompt that is used for the reward after it has been redeemed.
         * 
         * The tag `%name` is the name of the redeemer, `%prompt` is the existing reward prompt in the reward config, `%number` is the new reward price.
         */
        rewardPrompt: string
        /**
         * The reward gets a longer cooldown with time, this is a multiplier that can be used to change it.
         * 
         * Formula: `[REWARD_COOLDOWN] + Math.round( Math.log( NEW_REWARD_COST ) * [THIS_VALUE] )`
         */
        rewardCooldownMultiplier: number
        /**
         * Mention pattern matched rewards when they are redeemed.
         */
        ttsOn: boolean
        /**
         * This is the name string used when mentioning it using TTS.
         * 
         * The tag `%name` is the name of the redeemer, prefix an `@` to trigger name replacement.
         */
        ttsName: string
        /**
         * If your trophy is not really a trophy, give it a name here and that is what will be spoken on special numbers.
         */
        ttsTrophy: string

        /**
         * Numbers that overrides/complements defined patterns for the Channel Trophy reward.
         */
        uniqueNumbers: IChannelTrophyFunnyNumberTexts
    }
}

interface IControllerDefaults {
    /**
     * Turn this on to get chat messages as notifications in SteamVR.
     */
    pipeAllChat?: boolean

    /**
     * Turn this on to get messages from chat read out loud.
     */
    ttsForAll?: boolean

    /**
     * Turn this on to play an audio notification for chat messages if TTS is also off or the message otherwise silent.
     * 
     * For this to work an audio config is necessary: `Config.audioplayer.configs[Keys.KEY_SOUND_CHAT]`
     */
    pingForChat?: boolean

    /**
     * This pipes chat messages to a Discord webhook for logging purposes.
     * 
     * For this to work a Discord webhook address is required in: `Config.credentials.DiscordWebHooks[Keys.KEY_DISCORD_CHAT]`
     */
    logChatToDiscord?: boolean

    /**
     * Turns on game specific dynamic rewards if they are available, otherwise those will always be disabled.
     */
    useGameSpecificRewards?: boolean

    /**
     * This will attempt to match the game title from Steam with one on Twitch and set the Twich game category on game change.
     */
    updateTwitchGameCategory?: boolean

    /**
     * This will allow for remote command execution through the remote command channel if provided.
     */
    runRemoteCommands?: boolean
}