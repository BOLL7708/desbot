import Data from '../Data.js'
import DataMap from '../DataMap.js'

export class PresetPhilipsHueColor extends Data {
    x: number = 0
    y: number = 0

    enlist() {
        DataMap.addRootInstance(
            new PresetPhilipsHueColor(),
            'The color value used for a Philips Hue bulb.',
            {
                x: 'X value for Philips Hue color space.',
                y: 'Y value for Philips Hue color space.'
            }
        )
    }
}