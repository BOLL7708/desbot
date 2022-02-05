/**
 * In-VR-overlays and notifications with [OpenVRNotificationPipe](https://github.com/BOLL7708/OpenVRNotificationPipe)
 */
interface IPipeConfig {
    /**
     * The port number set in OpenVRNotificationPipe.
     */
    port: number
    /**
     * Pipe the input text for these rewards into VR.
     */
    showRewardsWithKeys: string[]
    /**
     * Configs used by automatic rewards, add something here using a `Keys.*` to automatically trigger a notification.
     */
    configs: { [key:string]: (IPipeMessagePreset|IPipeMessagePreset[]) }
    /**
     * If on uses a custom notification graphic for text pipes into VR, instead of the default SteamVR notification.
     * 
     * Make sure you have also set the Pipe config for this:
     * ```
     * Config.pipe.configs: { 
     *     [Keys.KEY_MIXED_CHAT]: {
     *         imagePath: '', durationMs: '', config: PipePresets.YOUR_PRESET
     *     }
     * }
     * ```
     * // TODO: Possibly change this if we change how this works.
     */
    useCustomChatNotification: boolean
    /**
     * The text box settings for the custom chat notification text message.
     */
    customChatMessageConfig: IPipeCustomMessageConfig
    /**
     * The text box settings for the custom chat notification username.
     * 
     * Will not be drawn if no username was supplied.
     */
    customChatNameConfig: IPipeCustomMessageConfig
    /**
     * The settings for the custom chat notification avatar image.
     * 
     * Will not be drawn if the image could not be loaded.
     */
    customChatAvatarConfig: IPipeCustomMessageAvatarConfig
}
interface IPipeMessagePreset {
    imagePath?: string|string[]
    imageData?: string
    durationMs: number
    config: IPipeCustomMessage
    texts?: string[]
}
interface IPipeCustomMessageConfig {
    /**
     * The position and size of the box we draw text in.
     */
    rect: IImageEditorRect
    /**
     * The font settings for the text.
     */
    font: IImageEditorFontSettings
}
interface IPipeCustomMessageAvatarConfig {
    /**
     * The corner radius of the user avatar.
     * - -1 = Circle.
     * - 0 = Square.
     * - \>0 = Pixel radius of the rounded corner.
     */
    cornerRadius: number
    /**
     * The position and size of the box we draw the avatar in.
     */
    rect: IImageEditorRect
    /**
     * Optional: Outline settings for the avatar. 
     * 
     * If a color is undefined it will be replaced by the user color or if not available, default to white.
     */
    outlines?: IImageEditorOutline[]
}
// Data

/**
 * This is what is sent to the Pipe application
 */
interface IPipeCustomMessage {
    /**
     * Optional: In this solution we set the image from the preset so this is not needed in the payload.
     * 
     * See more in {@link IPipeCustomProperties}
     */
    image?: string
    custom: boolean
    properties: IPipeCustomProperties
    /**
     * Include one transition object for same in/out, two for different in/out.
     * 
     * See more in {@link IPipeCustomTransition}
     */
    transitions: IPipeCustomTransition[]
    /**
     * Define any number of text areas to be displayed on the image.
     */
    textAreas: IPipeCustomTextArea[]
}

/**
 * Properties for the general state of the notification
 */
interface IPipeCustomProperties {
    /**
     * What to anchor the notification to:
     * 0: World
     * 1: Headset
     * 2: Left Hand
     * 3: Right Hand
     */
    anchor: number

    /**
     * Align the notification to the horizontal plane of the world
     */
    horizontal: boolean 
    
    /**
     * Ignore headset pitch when spawning notification
     */
    level: boolean

    /**
     * The channel for this notification. 
     * Each channel has a separate queue and can be shown simultaneously.
     */
    channel: number

    /**
     * Animation Hz, is set to -1 to run at headset Hz
     */
    hz?: number

    /**
     * Duration in milliseconds, is set by preset so should be left out.
     */
    duration?: number

    /**
     * Physical width of the notification in meters
     */
    width: number
    
    /**
     * Physical distance to the notification in meters
     */
    distance: number
    
    /**
     * Angle up or down in degrees
     */
    pitch: number
    
    /**
     * Angle left or right in degrees
     */
    yaw: number
    
    /**
     * Offsets horizontally in meters
     */
    offsetx: number
    
    /**
     * Offsets vertically in meters
     */
    offsety: number
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