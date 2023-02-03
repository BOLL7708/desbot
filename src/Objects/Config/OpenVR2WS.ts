import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

export class ConfigOpenVR2WS extends BaseDataObject {
    port: number = 7708
}

DataObjectMap.addMainInstance(
    new ConfigOpenVR2WS(),
    'Get things like currently played SteamVR game and change SteamVR settings with OpenVR2WS.',
    {
        port: 'The port that is set in the OpenVR2WS application.'
    }
)