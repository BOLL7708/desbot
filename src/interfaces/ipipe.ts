// Config
interface IPipeConfig {
    port: number
    doNotShow: string[]
    showRewardsWithKeys: string[]
    configs: IPipeConfigs
}
interface IPipeConfigs {
    [key:string]: IPipeMessagePreset
}
interface IPipeMessagePreset {
    imagePath: string
    duration: number
    type: number
    top?: boolean
    left?: boolean
}

// Data
interface IPipeCustomMessage {
    image: string
    custom: boolean
    properties: IPipeCustomProperties
    transition: IPipeCustomTransition
    transition2: IPipeCustomTransition
}
interface IPipeCustomProperties {
    headset: boolean
    horizontal: boolean
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
