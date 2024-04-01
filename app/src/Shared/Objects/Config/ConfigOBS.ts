import Data from '../Data.js'
import DataMap from '../DataMap.js'

export default class ConfigOBS extends Data {
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