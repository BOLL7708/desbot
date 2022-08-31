import {IScreenshotRequestData} from './iscreenshots.js'

// SuperScreenShotterVR
export interface ISSSVRRequest {
    nonce: string
    tag: string
    delay: number
}
export interface ISSSVRResponse {
    nonce: string
    image: string
    width: number
    height: number
}

// Callbacks
export interface ISSSVRCallback {
    (screenshotRequest: IScreenshotRequestData|undefined, screenshotResponse: ISSSVRResponse): void
}