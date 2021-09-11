// Config
interface IOpenVR2WSConfig {
    port: number
    password: string
    configs: IOpenVR2WSConfigs
}
interface IOpenVR2WSConfigs {
    [key:string]: IOpenVR2WSSetting
}
interface IOpenVR2WSSetting {
    type: number
    value: boolean|number|string
    duration?: number
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
interface IOpenVR2WSInputCallback {
    (key:string, data: IOpenVR2WSInputData): void
}