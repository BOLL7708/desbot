// Config
interface IOpenVR2WSConfig {
    port: number
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

// Callbacks
interface IOpenVR2WSInputCallback {
    (key:string, data: IOpenVR2WSInputData): void
}