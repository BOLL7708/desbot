/**
 * Trigger and transmit screenshots from [SuperScreenShotterVR](https://github.com/BOLL7708/SuperScreenShotterVR) or [OBS Studio](https://obsproject.com/) sources.
 */
interface IScreenshotConfig {
    /**
     * Port set in SuperScreenShotterVR.
     */
    SSSVRPort: number
    
    /**
     * The delay between finishing reading the screenshot request description and triggering the screenshot.
     */
    delayOnDescription: number
    
    /**
     * Values used when posting things coming in from SSSVR & OBS to Discord and the {@link Sign}.
     */
    callback: IScreenshotCallbackConfig
}
interface IScreenshotRequest {
    nonce: string
    tag: string
    delay: number
}
interface IScreenshotResponse {
    nonce: string
    image: string
}

interface IScreenshotCallbackConfig {
    /**
     * Title for the Discord post for manually taken screenshots.
     */
    discordManualTitle: string
    /**
     * Title for the Discord post for redeemed screenshots with a description.
     * 
     * `%s` will be replaced with the description.
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
}

// Callbacks
interface IScreenshotCallback {
    (screenshotResponse: IScreenshotResponse): void
}