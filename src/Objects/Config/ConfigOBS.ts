import DataMap from '../DataMap.js'
import Data from '../Data.js'

export default class ConfigOBS extends Data {
    port: number = 4455
    password: string = ''
    saveScreenshotsToFilePath: string = ''

    enlist() {
        DataMap.addRootInstance(
            new ConfigOBS(),
            'Enables a secure connection to OBS Studio for remote functions through the OBS WebSockets plugin: https://obsproject.com',
            {
                port: 'The port set for the OBS WebSockets plugin.',
                password: 'The password used for the OBS WebSockets plugin.',
                saveScreenshotsToFilePath: 'Absolute path to folder to save the screenshot in.'
            },
            {
                password: 'string|secret'
            }
        )
    }
}