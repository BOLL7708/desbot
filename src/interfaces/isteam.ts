/**
 * Loading player and game data from the Steam Web API requires API keys, see {@link: ICredentialsConfig}
 */
interface ISteamConfig {
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
}