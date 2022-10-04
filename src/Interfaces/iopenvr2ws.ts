import {TKeys} from '../_data/!keys.js'
import {ActionHandler} from '../Widget/Actions.js'

/**
 * Get things like currently played SteamVR game and change SteamVR settings with OpenVR2WS
 */
export interface IOpenVR2WSConfig {
    /**
     * The port that is set in the OpenVR2WS application.
     */
    port: number
}

/**
 * Change SteamVR setting.
 */
export interface IOpenVR2WSSetting {
    /**
     * The setting, reference: `OpenVR2WS.SETTING_*` for a few predefined ones.
     * 
     * The format is [category]|[setting]|[default], where an empty category will use the app ID for game specific settings.
     */
    setting: string
    /**
     * The value to set the setting to, takes various formats.
     */
    value: boolean|number|string
    /**
     * Optional: The value to reset to after the duration has expired, will fall back on hard coded value if missing.
     */
    resetToValue?: boolean|number|string
    /**
     * Optional: The amount of time to wait before resetting the setting to default.
     */
    duration?: number // Seconds
}

/**
 * Move SteamVR Play Space.
 */
export interface IOpenVR2WSMoveSpace {
    /**
     * Optional: Sideways position offset
     */
    x?: number
    /**
     * Optional: Height position offset
     */
    y?: number
    /**
     * Optional: Forward position offset
     */
    z?: number
    /**
     * Optional: Move the Chaperone bounds in the opposite direction to keep them in the right place, defaults to true.
     */
    moveChaperone?: boolean
    /**
     * Optional: The amount of time to wait before moving back.
     */
    duration?: number // Seconds
}

// Data
export interface IOpenVR2WSMessage {
    key: string
    data: any
}
export interface IOpenVR2WSInputData {
    source: string
    input: string
    value: boolean
}
export interface IOpenVR2WSFindOverlayData {
    key: string
    handle: number
}
export interface IOpenVR2WSRelayData {
    password: string
    user: string
    key: TKeys
    data: string
}
export interface IOpenVR2WSGenericResponseData {
    message: string
    success: boolean
}
export interface IOpenVR2WSRelay {
    key: TKeys
    handler?: ActionHandler
}
export interface IOpenVRWSCommandMessage {
    key: string
    value: string
    value2?: string
    value3?: string
    value4?: string
    value5?: string
    value6?: string
    device?: number
}

// Callbacks
export interface IOpenVR2WSStatusCallback {
    (status: boolean): void
}
export interface IOpenVR2WSInputCallback {
    (key: string, data: IOpenVR2WSInputData): void
}
export interface IOpenVR2WSAppIdCallback {
    (appId: string): void
}
export interface IOpenVR2WSFindOverlayCallback {
    (overlayKey: string, overlayHandle: number): void
}
export interface IOpenVR2WSRelayCallback {
    (user: string, key: TKeys, data: string): void
}