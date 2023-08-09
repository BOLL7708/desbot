import Data from '../Data.js'
import DataMap from '../DataMap.js'

export class ConfigOpenVR2WS extends Data {
    port: number = 7708
    password: string = ''

    enlist() {
        DataMap.addRootInstance(
            new ConfigOpenVR2WS(),
            'Get things like currently played SteamVR game and change SteamVR settings with OpenVR2WS: https://github.com/BOLL7708/OpenVR2WS',
            {
                port: 'The port that is set in the OpenVR2WS application.',
                password: 'The password for OpenVR2WS.\nUsed to change SteamVR settings remotely and receive SteamVR App IDs.'
            },{
                password: 'string|secret'
            }
        )
    }
}