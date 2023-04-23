import DataObjectMap from '../DataObjectMap.js'
import BaseDataObject from '../BaseDataObject.js'
import {EventDefault} from '../Event/EventDefault.js'
import {EnumScreenshotFileType} from '../../Enums/EnumScreenshotFileType.js'

export default class ConfigOBS extends BaseDataObject {
    port: number = 4455
    sourceEventGroups: { [key: string]: ConfigOBSEventGroups } = {}
    filterEventGroups: { [key: string]: ConfigOBSEventGroups } = {}
    sourceScreenshotConfig = new ConfigOBSSourceScreenshot()
}
export class ConfigOBSEventGroups extends BaseDataObject {
    members: (number|string)[] = []
}
export class ConfigOBSSourceScreenshot extends BaseDataObject {
    embedPictureFormat: string = EnumScreenshotFileType.PNG
    saveToFilePath: string = ''
    discordDescription: string = 'OBS Screenshot 🤳'
    discordGameTitle: string = 'N/A'
    signTitle: string = 'Screenshot'
    signDurationMs: number = 5000
}

DataObjectMap.addRootInstance(
    new ConfigOBS(),
    'Enables a secure connection to OBS Studio for remote functions through the OBS WebSockets plugin.',
    {
        port: 'The port set for the OBS WebSockets plugin.',
        sourceEventGroups: 'When part of a group, turning one source on turns all the others off.',
        filterEventGroups: 'When part of a group, turning one filter on turns all the others off.',
        sourceScreenshotConfig: 'Configuration for taking OBS Source screenshots.'
    },
    {
        sourceEventGroups: ConfigOBSEventGroups.ref(),
        filterEventGroups: ConfigOBSEventGroups.ref()
    }
)
DataObjectMap.addSubInstance(
    new ConfigOBSEventGroups(),
    {},
    {
        members: EventDefault.refIdKey()
    }
)
DataObjectMap.addSubInstance(
    new ConfigOBSSourceScreenshot(),
    {
        embedPictureFormat: 'Image format of the screenshot file.',
        saveToFilePath: 'Absolute path to folder to save the screenshot in.',
        discordDescription: 'Description for the screenshot when posted to Discord.',
        discordGameTitle: 'Backup game title in the footer when posting to Discord, only used if there is no game registered as running.',
        signTitle: 'Title for the screenshot when shown as a Sign.',
        signDurationMs: 'Display duration in milliseconds for the screenshot Sign.'
    },
    {
        embedPictureFormat: EnumScreenshotFileType.ref()
    }
)