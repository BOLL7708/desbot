import {IScreenshotRequestData} from './iscreenshots.js'

// Callbacks
export interface ISceneChangeCallback {
    (sceneName: string): void
}
export interface ISourceScreenshotCallback {
    (img: string, data: IScreenshotRequestData, nonce: string): void
}