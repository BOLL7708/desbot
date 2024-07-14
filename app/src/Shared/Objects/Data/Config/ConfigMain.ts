import AbstractData from '../AbstractData.js'
import DataMap from '../DataMap.js'

export default class ConfigMain extends AbstractData {
    logo = new ConfigMainLogo()

    enlist() {
        DataMap.addRootInstance({
            instance: new ConfigMain(),
            description: 'These are the settings for the main application.',
            documentation: {
                logo: 'Settings for the logo displayed in the editor and as favicon for the pages.'
            }
        })
    }
}
export class ConfigMainLogo extends AbstractData {
    foregroundColor: string = '#DBA507'
    backgroundColor: string = '#6441A5'

    enlist() {
        DataMap.addSubInstance({
            instance: new ConfigMainLogo(),
            documentation: {
                foregroundColor: 'Color of the logo foreground, hex or rgb().',
                backgroundColor: 'Color of the logo background, hex or rgb().'
            }
        })
    }
}