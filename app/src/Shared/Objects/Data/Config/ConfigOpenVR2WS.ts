import AbstractData from '../AbstractData.js'
import DataMap from '../DataMap.js'

export default class ConfigOpenVR2WS extends AbstractData {
    port: number = 7708
    password: string = ''

    enlist() {
        DataMap.addRootInstance({
            instance: new ConfigOpenVR2WS(),
            description: 'Get things like currently played SteamVR game and change SteamVR settings with OpenVR2WS: https://github.com/BOLL7708/OpenVR2WS',
            documentation: {
                port: 'The port that is set in the OpenVR2WS application.',
                password: 'The password for OpenVR2WS.\nUsed to change SteamVR settings remotely and receive SteamVR App IDs.'
            },
            types: {
                password: 'string|secret'
            }
        })
    }
}