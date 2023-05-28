import DataObjectMap from '../DataObjectMap.js'
import BaseDataObject from '../BaseDataObject.js'
import {EventDefault} from '../Event/EventDefault.js'
import {EnumScreenshotFileType} from '../../Enums/EnumScreenshotFileType.js'
import {ActionAudio} from '../Action/ActionAudio.js'
import {PresetDiscordWebhook} from '../Preset/DiscordWebhook.js'

export default class ConfigOBS extends BaseDataObject {
    port: number = 4455
    password: string = ''
    saveScreenshotsToFilePath: string = ''
    sourceEventGroups: { [key: string]: ConfigOBSEventGroups } = {}
    filterEventGroups: { [key: string]: ConfigOBSEventGroups } = {}
}
export class ConfigOBSEventGroups extends BaseDataObject {
    members: (number|string)[] = []
}

DataObjectMap.addRootInstance(
    new ConfigOBS(),
    'Enables a secure connection to OBS Studio for remote functions through the OBS WebSockets plugin.',
    {
        port: 'The port set for the OBS WebSockets plugin.',
        password: 'The password used for the OBS WebSockets plugin.',
        saveScreenshotsToFilePath: 'Absolute path to folder to save the screenshot in.',
        sourceEventGroups: 'When part of a group, turning one source on turns all the others off.',
        filterEventGroups: 'When part of a group, turning one filter on turns all the others off.'
    },
    {
        password: 'string|secret',
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