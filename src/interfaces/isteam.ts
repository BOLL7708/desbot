/**
 * Loading player and game data from the Steam Web API requires API keys, see {@link: ICredentialsConfig}
 */
export interface ISteamConfig {
    /**
     * Interval in milliseconds inbetween loads of the player summary, which will provide the current running app ID for non-VR users.
     * 
     * Set this to 0 to disable.
     */
    playerSummaryIntervalMs: number
    /**
     * Interval in milliseconds inbetween loads of achievements for the currently running game.
     * 
     * Set this to 0 to disable.
     */
    achievementsIntervalMs: number
    /**
     * How old an achievement can be and still get announced.
     */
    ignoreAchievementsOlderThanHours: number
    /**
     * These app IDs will be ignored for all app ID dependent features.
     */
    ignoredAppIds: string[]

    achievementSettings: {
        /**
         * The information in the footer of achievement posting to Discord.
         * 
         * Text replacements:
         * - current/total achievements unlocked
         * - achievement global rate
         */
        discordFooter: string
        /**
         * The message written in chat when a new achievement is unlocked.
         * 
         * Text replacements:
         * - current/total achievements unlocked
         * - achievement name
         * - achievement description
         * - achievement global rate
         */
        twitchChatMessage: string
    }
}