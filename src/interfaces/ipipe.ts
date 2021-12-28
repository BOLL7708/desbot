// Config
interface IPipeConfig {
    port: number
    doNotShow: string[]
    showRewardsWithKeys: string[]
    configs: { [key:string]: IPipeMessagePreset }
}
interface IPipeMessagePreset {
    imagePath: string|string[]
    durationMs: number
    type: number
    top?: boolean
    left?: boolean
    override?: IPipeCustomMessage
}

// Data
interface IPipeCustomMessage {
    image: string
    custom: boolean
    properties: IPipeCustomProperties
    transitions: IPipeCustomTransition[]
    textAreas: IPipeCustomTextArea[]
}
interface IPipeCustomProperties {
    headset: boolean
    horizontal: boolean
    level: boolean
    channel: number
    hz: number
    duration: number
    width: number
    distance: number
    pitch: number
    yaw: number
}
interface IPipeCustomTransition {
    scale: number
    opacity: number
    vertical: number
    distance: number
    horizontal: number
    spin: number
    tween: number
    duration: number
}
interface IPipeCustomTextArea {
    posx: number
    posy: number
    width: number
    height: number
    size: number
    text: string
    font: string
    color: string
    gravity: number
    alignment: number
}