
// SuperScreenShotterVR
interface ISSSVRRequest {
    nonce: string
    tag: string
    delay: number
}
interface ISSSVRResponse {
    nonce: string
    image: string
    width: number
    height: number
}

// Callbacks
interface ISSSVRCallback {
    (screenshotRequest: IScreenshotRequestData|undefined, screenshotResponse: ISSSVRResponse): void
}