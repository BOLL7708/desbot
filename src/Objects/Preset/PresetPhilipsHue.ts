import Data from '../Data.js'
import DataMap from '../DataMap.js'

export class PresetPhilipsHueBulbState extends Data {
    brightness: number = 255
    hue: number = 0
    saturation: number = 255

    enlist() {
        DataMap.addRootInstance(
            new PresetPhilipsHueBulbState(),
            'The values used to set the state for a Philips Hue bulb.',
            {
                brightness: '0-255',
                hue: '0-65535',
                saturation: '0-255'
            }, {
                brightness: 'number' // TODO: Add back in some way to supply values so we can add sliders to these clamped values?
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