import {TKeys} from '../_data/!keys.js'
import {IScreenshotRequestData} from './iscreenshots.js'

/**
 * Enables a secure connection to OBS Studio for remote functions through the OBS WebSockets plugin.
 */
export interface IObsConfig {
    /**
     * The port set for the OBS WebSockets plugin.
     */
    port:number
    /**
     * When part of a group, turning one source on turns all the others off.
     */
    sourceGroups: TKeys[][]
    /**
     * When part of a group, turning one filter on turns all the others off.
     */
    filterGroups: TKeys[][]
    /**
     * WIP: This appears buggy but would filter certain features to work in certain scenes. 
     * It changed even when messing around in the studio mode though, so for now it's disabled.
     */
    filterOnScenes: string[]
    /**
     * Configuration for taking OBS Source screenshots. 
     * 
     * This is going to be moved into automatic rewards so it can be used for multiple things.
     */
    sourceScreenshotConfig: IObsSourceScreenshotConfig
}
export interface IObsSourceScreenshotConfig {
    /**
     * Image format of the screenshot file.
     */
    embedPictureFormat: string
    /**
     * Folder to save the screenshot in.
     */
    saveToFilePath: string
    /**
     * Description for the screenshot when posted to Discord.
     */
	discordDescription: string
    /**
     * Backup game title in the footer when posting to Discord, only used if there is no game registered as running.
     */
    discordGameTitle: string
    /**
     * Title for the screenshot when shown as a Sign.
     */
    signTitle: string
    /**
     * Display duration in milliseconds for the screenshot Sign.
     */
    signDurationMs: number
}

export interface IEvent {
    eventType: string
    /**
     * eventIntent is the original intent required to be subscribed to in order to receive the event.
     */
    eventIntent: number
    eventData?: any
}
export interface IRequestResponse {
    /**
     * The requestType is a mirror of what was sent by the client.
     */
    requestType: string
    /**
     * The requestId is a mirror of what was sent by the client.
     */
    requestId: string
    requestStatus: IRequestStatus
    responseData?: any
}
export interface IRequestStatus {
    /**
     * result is true if the request resulted in RequestStatus::Success. False if otherwise.
     */
    result: boolean
    /**
     * code is a RequestStatus code.
     */
    code: number
    /**
     * comment may be provided by the server on errors to offer further details on why a request failed.
     */
    comment?: string
}
export interface IHelloResponse {
    obsWebSocketVersion: string
    rpcVersion: number
    authentication?: IAuthentication
}
export interface IAuthentication {
    challenge: string
    salt: string
}

// Callbacks
export interface ISceneChangeCallback {
    (sceneName: string): void
}
export interface ISourceScreenshotCallback {
    (img: string, data: IScreenshotRequestData, nonce: string): void
}