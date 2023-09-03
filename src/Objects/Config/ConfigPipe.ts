import Data from '../Data.js'
import {ConfigCleanText} from './ConfigCleanText.js'
import DataMap from '../DataMap.js'
import {ConfigImageEditorFontSettings, ConfigImageEditorOutline, ConfigImageEditorRect} from './ConfigImageEditor.js'
import {EventDefault} from '../Event/EventDefault.js'

export class ConfigPipe extends Data {
    port: number = 8077
    useCustomChatNotification: boolean = false
    customChatMessageConfig = new ConfigPipeCustomMessage()
    customChatNameConfig = new ConfigPipeCustomMessageName()
    customChatAvatarConfig = new ConfigPipeCustomMessageAvatar()
    cleanTextConfig = new ConfigCleanText()

    enlist() {
        DataMap.addRootInstance(
            new ConfigPipe(),
            'In-VR-overlays and notifications with: https://github.com/BOLL7708/OpenVRNotificationPipe',
            {
                port: 'The port number set in OpenVRNotificationPipe.',
                useCustomChatNotification: 'If on uses a custom notification graphic for text pipes into VR, instead of the default SteamVR notification.',
                customChatMessageConfig: 'The text box settings for the custom chat notification text message.',
                customChatNameConfig: 'The text box settings for the custom chat notification username.\nWill not be drawn if no username was supplied.',
                customChatAvatarConfig: 'The settings for the custom chat notification avatar image.\nWill not be drawn if the image could not be loaded.',
                cleanTextConfig: 'Configuration for cleaning the text before it is piped.'
            }
        )
    }
}

export class ConfigPipeCustomMessage extends Data {
    width: number = 1024
    top: number = 128
    margin: number = 32
    cornerRadius: number = 24
    textMaxHeight: number = 256
    font = new ConfigImageEditorFontSettings()

    enlist() {
        DataMap.addSubInstance(new ConfigPipeCustomMessage())
    }
}
export class ConfigPipeCustomMessageName extends Data {
    rect = new ConfigImageEditorRect()
    font = new ConfigImageEditorFontSettings()

    enlist() {
        DataMap.addSubInstance(new ConfigPipeCustomMessageName())
    }
}
export class ConfigPipeCustomMessageAvatar extends Data {
    cornerRadius: number = 24
    rect = new ConfigImageEditorRect()
    outlines: ConfigImageEditorOutline[] = []

    enlist() {
        DataMap.addSubInstance(
            new ConfigPipeCustomMessageAvatar(),
            {
                cornerRadius: 'The corner radius of the user avatar.\n-1 = Circle.\n0 = Square.\n\>0 = Pixel radius of the rounded corner.',
                rect: 'The position and size of the box we draw the avatar in.',
                outlines: 'Optional: Outline settings for the avatar.\nIf a color is undefined it will be replaced by the user color or if not available, default to white.'
            },
            {
                outlines: ConfigImageEditorOutline.ref.build()
            }
        )
    }
}