// Config
interface IPipeConfig {
    port: number
    doNotShow: string[]
    showRewardsWithKeys: string[]
    configs: { [key:string]: IPipeMessagePreset }
    useCustomChatNotification: boolean
    customChatMessageConfig: IPipeCustomMessageConfig
    customChatNameConfig: IPipeCustomMessageConfig
    customChatAvatarConfig: IImageEditorRect // TODO: Update with more formatting later
}
interface IPipeMessagePreset {
    imagePath?: string|string[]
    imageData?: string
    durationMs: number
    config: IPipeCustomMessage
    texts?: string[]
}
interface IPipeCustomMessageConfig {
    rect: IImageEditorRect
    font: IImageEditorFontSettings
}

// Data

/**
 * This is what is sent to the Pipe application
 */
interface IPipeCustomMessage {
    image?: string // In this solution we set the image from the preset
    custom: boolean
    properties: IPipeCustomProperties
    transitions: IPipeCustomTransition[] // Include one transition object for same in/out, two for different in/out
    textAreas: IPipeCustomTextArea[] // Define any number of text areas to be displayed
}

/**
 * Properties for the general state of the notification
 */
interface IPipeCustomProperties {
    headset: boolean // Attach to headset
    horizontal: boolean // Align to the horizontal plane
    level: boolean // Ignore headset pitch
    channel: number // Each channel has an individual queue
    hz?: number // Animation Hz, is set to -1 to run at headset Hz
    duration?: number // Duration, is set by preset
    width: number // Physical width in meters
    distance: number // Physical distance in meters
    pitch: number // Angle up or down in degrees
    yaw: number // Angle left or right in degrees
    offsetx: number // Offsets horizontally in meters
    offsety: number // Offsets vertically in meters
}

/**
 * Transition properties for the in/out animations
 * A value is transitioned from, then we display the image, then to
 */
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

/**
 * Layout properties for text areas
 */
interface IPipeCustomTextArea {
    posx: number
    posy: number
    width: number
    height: number
    size: number
    text?: string
    font: string
    color: string
    gravity: number
    alignment: number
}