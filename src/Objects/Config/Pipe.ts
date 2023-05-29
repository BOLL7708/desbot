import BaseDataObject from '../BaseDataObject.js'
import {ConfigCleanText} from './CleanText.js'
import {TKeys} from '../../_data/!keys.js'
import DataObjectMap from '../DataObjectMap.js'
import {ConfigImageEditorFontSettings, ConfigImageEditorOutline, ConfigImageEditorRect} from './ImageEditor.js'

export class ConfigPipe extends BaseDataObject {
    port: number = 8077
    showRewardsWithKeys: TKeys[] = [] // TODO: Switch to IDs later.
    useCustomChatNotification: boolean = false
    customChatMessageConfig = new ConfigPipeCustomMessage()
    customChatNameConfig = new ConfigPipeCustomMessageName()
    customChatAvatarConfig = new ConfigPipeCustomMessageAvatar()
    cleanTextConfig = new ConfigCleanText()
}

export class ConfigPipeCustomMessage extends BaseDataObject {
    width: number = 1024
    top: number = 128
    margin: number = 32
    cornerRadius: number = 24
    textMaxHeight: number = 256
    font = new ConfigImageEditorFontSettings()
}
export class ConfigPipeCustomMessageName extends BaseDataObject {
    rect = new ConfigImageEditorRect()
    font = new ConfigImageEditorFontSettings()
}
export class ConfigPipeCustomMessageAvatar extends BaseDataObject {
    cornerRadius: number = 24
    rect = new ConfigImageEditorRect()
    outlines: ConfigImageEditorOutline[] = []
}

DataObjectMap.addRootInstance(
    new ConfigPipe(),
    'In-VR-overlays and notifications with: https://github.com/BOLL7708/OpenVRNotificationPipe',
    {
        port: 'The port number set in OpenVRNotificationPipe.',
        showRewardsWithKeys: 'Pipe the input text for these rewards into VR.',
        useCustomChatNotification: 'If on uses a custom notification graphic for text pipes into VR, instead of the default SteamVR notification.',
        customChatMessageConfig: 'The text box settings for the custom chat notification text message.',
        customChatNameConfig: 'The text box settings for the custom chat notification username.\nWill not be drawn if no username was supplied.',
        customChatAvatarConfig: 'The settings for the custom chat notification avatar image.\nWill not be drawn if the image could not be loaded.',
        cleanTextConfig: 'Configuration for cleaning the text before it is piped.'
    },
    {
        showRewardsWithKeys: 'string'
    }
)
DataObjectMap.addSubInstance(new ConfigPipeCustomMessage())
DataObjectMap.addSubInstance(new ConfigPipeCustomMessageName())
DataObjectMap.addSubInstance(
    new ConfigPipeCustomMessageAvatar(),
    {
        cornerRadius: 'The corner radius of the user avatar.\n-1 = Circle.\n0 = Square.\n\>0 = Pixel radius of the rounded corner.',
        rect: 'The position and size of the box we draw the avatar in.',
        outlines: 'Optional: Outline settings for the avatar.\nIf a color is undefined it will be replaced by the user color or if not available, default to white.'
    },
    {
        outlines: ConfigImageEditorOutline.ref()
    }
)