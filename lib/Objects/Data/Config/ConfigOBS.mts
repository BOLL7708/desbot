import {AbstractData} from '../AbstractData.mts'
import {DataMap} from '../DataMap.mts'

export class ConfigOBS extends AbstractData {
    port: number = 4455
    password: string = ''
    saveScreenshotsToFilePath: string = ''

    enlist() {
        DataMap.addRootInstance({
            instance: new ConfigOBS(),
            description: 'Enables a secure connection to OBS Studio for remote functions through the OBS WebSockets plugin: https://obsproject.com',
            documentation: {
                port: 'The port set for the OBS WebSockets plugin.',
                password: 'The password used for the OBS WebSockets plugin.',
                saveScreenshotsToFilePath: 'Absolute path to folder to save the screenshots in.'
            },
            types: {
                password: 'string|secret'
            }
        })
    }
}