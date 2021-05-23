// Config
interface IScreenshotConfig {
    port: number
    delay: number
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

// Callbacks
interface IScreenshotCallback {
    (screenshotResponse: IScreenshotResponse): void
}