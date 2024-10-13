import {AbstractData} from '../AbstractData.mts'
import {DataMap} from '../DataMap.mts'

export class ConfigPhilipsHue extends AbstractData {
    serverPath: string = 'http://'
    username: string = ''

    enlist() {
        DataMap.addRootInstance({
            instance: new ConfigPhilipsHue(),
            description: 'Control Philips Hue lights or sockets.\n\nYou can connect to the bridge and import devices in the Tools section.',
            documentation: {
                serverPath: 'Local IP address of the Philips Hue bridge, start with the protocol: http://',
                username: 'Username for your local Philips Hue Bridge to control lights and plugs'
            },
            types: {
                username: 'string|secret'
            }
        })
    }
}