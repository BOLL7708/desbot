// Config
interface IScreenshotConfig {
    port: number
    delay: number
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
    discordManualTitle: string
    discordRewardTitle: string
    discordRewardInstantTitle: string
    signTitle: string
    signManualSubtitle: string
    signDurationMs: number
}

// Callbacks
interface IScreenshotCallback {
    (screenshotResponse: IScreenshotResponse): void
}