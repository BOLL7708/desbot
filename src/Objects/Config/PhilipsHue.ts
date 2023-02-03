import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

export class ConfigPhilipsHue extends BaseDataObject {
    serverPath: string = 'http://'
}

DataObjectMap.addMainInstance(
    new ConfigPhilipsHue(),
    'Control Philips Hue lights or sockets.',
    {
        serverPath: 'Local IP address of the Philips Hue bridge, start with the protocol: http://'
    }
)