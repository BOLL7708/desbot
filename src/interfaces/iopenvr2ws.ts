/**
 * Get things like currently played SteamVR game and change SteamVR settings with OpenVR2WS
 */
interface IOpenVR2WSConfig {
    /**
     * The port that is set in the OpenVR2WS application.
     */
    port: number
    /**
     * The configs that automatic rewards will reference to trigger SteamVR setting changes, keyed on: `Keys.*`
     */
    configs: { [key:string]: IOpenVR2WSSetting }
}

/**
 * SteamVR setting triggered by an automatic reward.
 */
interface IOpenVR2WSSetting {
    /**
     * The type number of the setting, reference: `OpenVR2WS.TYPE_*`
     */
    type: number
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

// Data
interface IOpenVR2WSMessage {
    key: string
    data: any
}
interface IOpenVR2WSInputData {
    source: string
    input: string
    value: boolean
}
interface IOpenVRWSCommandMessage {
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
interface IOpenVR2WSStatusCallback {
    (status: boolean): void
}
interface IOpenVR2WSInputCallback {
    (key: string, data: IOpenVR2WSInputData): void
}
interface IOpenVR2WSAppIdCallback {
    (appId: string): void
}