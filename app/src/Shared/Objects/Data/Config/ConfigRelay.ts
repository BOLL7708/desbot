import AbstractData from '../AbstractData.js'
import DataMap from '../DataMap.js'

export default class ConfigRelay extends AbstractData {
    port: number = 7788
    // streamDeckChannel: string = 'desbot_streamdeck
    overlayImagesChannel: string = 'overlay_images'

    enlist() {
        DataMap.addRootInstance({
            instance: new ConfigRelay(),
            description: 'Settings to connect to the WSRelay accessory application: https://github.com/BOLL7708/WSRelay',
            documentation: {
                port: 'The port that is set in the WSRelay application.',
                // streamDeckChannel: 'The channel to use for the Stream Deck plugin. (WIP)',
                overlayImagesChannel: 'A channel where we distribute image URLs or data for display.'
            }
        })
    }
}