import Data from '../Data.js'
import DataMap from '../DataMap.js'
import {DataUtils} from '../DataUtils.js'

export class PresetPhilipsHueBulbState extends Data {
    brightness: number = 254
    hue: number = 0
    saturation: number = 254

    enlist() {
        DataMap.addRootInstance({
            instance: new PresetPhilipsHueBulbState(),
            description: 'The values used to set the state for a Philips Hue bulb.',
            documentation: {
                brightness: 'Brightness of the bulb.',
                hue: 'Hue of the bulb.',
                saturation: 'Saturation of the bulb, set to 0 for white.'
            },
            types: {
                brightness: DataUtils.getNumberRangeRef(0,254),
                hue: DataUtils.getNumberRangeRef(0,65535),
                saturation: DataUtils.getNumberRangeRef(0,254)
            }
        })
    }
}
export class PresetPhilipsHueBulb extends Data {
    name: string = ''

    enlist() {
        DataMap.addRootInstance({
            instance: new PresetPhilipsHueBulb(),
            description: 'A Philips Hue bulb to be controlled.',
            documentation: {
                name: 'The name set for the bulb.'
            },
            label: 'name'
        })
    }
}
export class PresetPhilipsHuePlug extends Data {
    name: string = ''

    enlist() {
        DataMap.addRootInstance({
            instance: new PresetPhilipsHuePlug(),
            description: 'A Philips Hue plug to be controlled.',
            documentation: {
                name: 'The name set for the plug.'
            },
            label: 'name'
        })
    }
}