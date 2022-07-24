/**
 * Trigger and transmit screenshots from [SuperScreenShotterVR](https://github.com/BOLL7708/SuperScreenShotterVR) or [OBS Studio](https://obsproject.com/) sources.
 */
interface IScreenshotConfig {
    /**
     * Port set in SuperScreenShotterVR.
     */
    SSSVRPort: number
      
    /**
     * Values used when posting things coming in from SSSVR & OBS to Discord and the {@link Sign}.
     */
    callback: {
        /**
         * Title for the Discord post for manually taken screenshots.
         */
        discordManualTitle: string
        /**
         * Title for the Discord post for redeemed screenshots with a description.
         * 
         * `%text` will be replaced with the description.
         */
        discordRewardTitle: string
        /**
         * Title for the Discord post for redeemed screenshots without a description.
         */
        discordRewardInstantTitle: string
        
        /**
         * Title of the Sign pop-in, goes above the image.
         */
        signTitle: string
        /**
         * Sub-title of the Sign pop-in for manual shots, goes beneath the image.
         * 
         * Redeemed shots will have the subtitle be the redeemers username.
         */
        signManualSubtitle: string
        /**
         * Amount of time the Sign is visible in milliseconds.
         */
        signDurationMs: number
        /**
         * Enable manual screenshots to be output to VR through the Pipe.
         */
        pipeEnabledForManual: boolean,
        /**
         * Keys for screenshot rewards that should be output to VR through the Pipe.
         */
        pipeEnabledForRewards: string[]
        /**
         * The Pipe preset for screenshots. This is located here instead of the list for automatic rewards due to it also being used for manual screenshots.
         */
        pipeMessagePreset: IPipeAction|undefined,
        /**
         * As there is not built in audio effect for OBS screenshots an option for that is provided here.
         * Why this is not relegated to the audio reward is due to the delay and burst options for screenshots which are not compatible with that feature.
         */
        soundEffectForOBSScreenshots: IAudioAction
    }
}

/**
 * Reference data about a screenshot that is cached from triggering it until it is completed.
 */
 interface IScreenshotRequestData {
    /**
     * Key for the reward that triggered the screenshot.
     */
    rewardKey: string
    /**
     * Twitch user ID for the redeemer.
     */
    userId: number
    /**
     * Twitch username for the redeemer.
     */
    userName: string
    /**
     * Input from the Twitch reward redemption.
     */
    userInput: string
}
