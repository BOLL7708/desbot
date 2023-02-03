import {IImageEditorFontSettings, IImageEditorOutline, IImageEditorRect} from './iimage_editor.js'
import {TKeys} from '../_data/!keys.js'
import {ConfigCleanText} from '../Objects/Config/CleanText.js'

/**
 * In-VR-overlays and notifications with [OpenVRNotificationPipe](https://github.com/BOLL7708/OpenVRNotificationPipe)
 */
export interface IPipeConfig {
    /**
     * The port number set in OpenVRNotificationPipe.
     */
    port: number

    /**
     * Pipe the input text for these rewards into VR.
     */
    showRewardsWithKeys: TKeys[]

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
     cleanTextConfig: ConfigCleanText
}

export interface IPipeCustomMessageConfig {
    width: number
    top: number
    margin: number
    cornerRadius: number
    textMaxHeight: number
    font: IImageEditorFontSettings
}
export interface IPipeCustomMessageNameConfig {
    rect: IImageEditorRect
    font: IImageEditorFontSettings
}
export interface IPipeCustomMessageAvatarConfig {
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