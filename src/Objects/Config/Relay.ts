import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

export class ConfigRelay extends BaseDataObject {
    port: number = 7788
    streamDeckChannel: string = 'streaming_widget'
}

DataObjectMap.addRootInstance(
    new ConfigRelay(),
    'Settings to connect to the WSRelay accessory application.',
    {
        port: 'The port that is set in the WSRelay application.',
        streamDeckChannel: 'The channel to use for the Stream Deck plugin. (WIP)'
    }
)