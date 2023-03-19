import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

export class PresetPhilipsHueColor extends BaseDataObject {
    x: number = 0
    y: number = 0
}

DataObjectMap.addRootInstance(
    new PresetPhilipsHueColor(),
    'The color value used for a Philips Hue bulb.',
    {
        x: 'X value for Philips Hue color space.',
        y: 'Y value for Philips Hue color space.'
    }
)