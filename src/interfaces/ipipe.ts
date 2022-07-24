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
     * If on uses a custom notification graphic for text pipes into VR, instead of the default SteamVR notification.
     * 
     * Make sure you have also set the Pipe config for this:
     * ```
     * Config.twitchChat.pipe: { 
     *         durationMs: 5000, config: PipePresets.YOUR_PRESET
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
    customChatNameConfig: IPipeCustomMessageNameConfig

    /**
     * The settings for the custom chat notification avatar image.
     * 
     * Will not be drawn if the image could not be loaded.
     */
    customChatAvatarConfig: IPipeCustomMessageAvatarConfig

    /**
     * Configuration for cleaning the text before it is piped.
     */
     cleanTextConfig: ICleanTextConfig
}

interface IPipeCustomMessageConfig {
    width: number
    top: number
    margin: number
    cornerRadius: number
    textMaxHeight: number
    font: IImageEditorFontSettings
}
interface IPipeCustomMessageNameConfig {
    rect: IImageEditorRect
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

interface IPipeBasicMessage {
    imageData?: string
    basicTitle?: string
    basicMessage?: string
}

/**
 * This is what is sent to the Pipe application
 */
interface IPipeCustomMessage {
    /**
     * Optional: In this solution we set the image from the preset so this is not needed in the payload.
     * 
     * See more in {@link IPipeCustomProperties}
     */
    imageData?: string

    /**
     * Optional: Absolute path to an image, not used in this solution except for when doing tests.
     */
    imagePath?: string

    /**
     * Properties for the custom notification.
     */
    customProperties?: IPipeCustomProperties
}

/**
 * Properties for the general state of the notification
 */
interface IPipeCustomProperties {
    /**
     * Set to true to show a custom notification instead of a basic one.
     */
    enabled?: boolean

    /**
     * Value that will be returned in callback if provided.
     */
    nonce?: string

    /**
     * What to anchor the notification to:
     * 0: World
     * 1: Headset
     * 2: Left Hand
     * 3: Right Hand
     */
    anchorType?: number

    /**
     * Fix the notification to the anchor
     */
    attachToAnchor?: boolean

    /**
     * Ignore anchor device yaw angle for the notification
     */
    ignoreAnchorYaw?: boolean

    /**
     * Ignore anchor device pitch angle for the notification
     */
    ignoreAnchorPitch?: boolean 
    
    /**
     * Ignore anchor device roll angle for the notification
     */
    ignoreAnchorRoll?: boolean

    /**
     * The channel for this notification. 
     * Each channel has a separate queue and can be shown simultaneously.
     */
    overlayChannel?: number

    /**
     * Animation Hz, is set to -1 to run at headset Hz
     */
    animationHz?: number

    /**
     * Duration in milliseconds, is set by preset so should be left out.
     */
    durationMs?: number

    /**
     * Opacity of the notification, 1 = 100%
     */
    opacityPer?: number

    /**
     * Physical width of the notification in meters
     */
    widthM?: number
    
    /**
     * Physical distance to the notification in meters
     */
    zDistanceM?: number
    
    /**
     * Offsets vertically in meters
     */
    yDistanceM?: number

    /**
     * Offsets horizontally in meters
     */
    xDistanceM?: number

    /**
     * Angle left or right in degrees
     */
    yawDeg?: number

    /**
     * Angle up or down in degrees
     */
    pitchDeg?: number
    
    /**
     * Spin angle in degrees
     */
    rollDeg?: number

    /**
     * Follow settings
     */
    follow?: IPipeCustomFollow

    animations?: IPipeCustomAnimation[]

    /**
     * Include one transition object for same in/out, two for different in/out.
     * 
     * See more in {@link IPipeCustomTransition}
     */
     transitions?: IPipeCustomTransition[]

     /**
      * Define any number of text areas to be displayed on the image.
      */
     textAreas?: IPipeCustomTextArea[]
}

/**
 * Follow 
 */
interface IPipeCustomFollow {
    enabled?: boolean
    triggerAngle?: number
    durationMs?: number
    tweenType?: number
}

interface IPipeCustomAnimation {
    property?: number
    amplitude?: number
    frequency?: number
    phase?: number
    waveform?: number
    flipWaveform?: boolean
}

/**
 * Transition properties for the in/out animations
 * A value is transitioned from, then we display the image, then to
 */
interface IPipeCustomTransition {
    scalePer?: number
    opacityPer?: number
    zDistanceM?: number
    yDistanceM?: number
    xDistanceM?: number
    yawDeg?: number
    pitchDeg?: number
    rollDeg?: number
    durationMs?: number
    tweenType?: number
}

/**
 * Layout properties for text areas
 */
interface IPipeCustomTextArea {
    text?: string
    xPositionPx?: number
    yPositionPx?: number
    widthPx?: number
    heightPx?: number
    fontSizePt?: number
    fontFamily?: string
    fontColor?: string
    horizontalAlignment?: number
    verticalAlignment?: number
}