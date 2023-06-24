import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

export class ConfigPhilipsHue extends BaseDataObject {
    serverPath: string = 'http://'
    username: string = ''

    register() {
        DataObjectMap.addRootInstance(
            new ConfigPhilipsHue(),
            'Control Philips Hue lights or sockets.',
            {
                serverPath: 'Local IP address of the Philips Hue bridge, start with the protocol: http://',
                username: 'Username for your local Philips Hue hub to control lights and plugs'
            },{
                username: 'string|secret'
            }
        )
    }
}