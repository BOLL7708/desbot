import Data from '../Data.js'
import DataMap from '../DataMap.js'
import {DataUtils} from '../DataUtils.js'

export class PresetPhilipsHueBulbState extends Data {
    brightness: number = 254
    hue: number = 0
    saturation: number = 254

    enlist() {
        DataMap.addRootInstance(
            new PresetPhilipsHueBulbState(),
            'The values used to set the state for a Philips Hue bulb.',
            {
                brightness: 'Brightness of the bulb.',
                hue: 'Hue of the bulb.',
                saturation: 'Saturation of the bulb, set to 0 for white.'
            }, {
                brightness: DataUtils.getNumberRangeRef(0,254),
                hue: DataUtils.getNumberRangeRef(0,65535),
                saturation: DataUtils.getNumberRangeRef(0,254)
            }
        )
    }
}
export class PresetPhilipsHueBulb extends Data {
    name: string = ''

    enlist() {
        DataMap.addRootInstance(
            new PresetPhilipsHueBulb(),
            'A Philips Hue bulb to be controlled.',
            {
                name: 'The name set for the bulb.'
            },
            {},
            'name'
        )
    }
}
export class PresetPhilipsHuePlug extends Data {
    name: string = ''

    enlist() {
        DataMap.addRootInstance(
            new PresetPhilipsHuePlug(),
            'A Philips Hue plug to be controlled.',
            {
                name: 'The name set for the plug.'
            },
            {},
            'name'
        )
    }
}