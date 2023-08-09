import DataMap from '../DataMap.js'
import Data from '../Data.js'
import {EventDefault} from '../Event/EventDefault.js'

export default class ConfigOBS extends Data {
    port: number = 4455
    password: string = ''
    saveScreenshotsToFilePath: string = ''
    sourceEventGroups: { [key: string]: ConfigOBSEventGroups } = {}
    filterEventGroups: { [key: string]: ConfigOBSEventGroups } = {}

    enlist() {
        DataMap.addRootInstance(
            new ConfigOBS(),
            'Enables a secure connection to OBS Studio for remote functions through the OBS WebSockets plugin: https://obsproject.com',
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
    }
}
export class ConfigOBSEventGroups extends Data {
    members: (number|string)[] = []

    enlist() {
        DataMap.addSubInstance(
            new ConfigOBSEventGroups(),
            {},
            {
                members: EventDefault.refIdKey()
            }
        )
    }
}