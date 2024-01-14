import Data from '../Data.js'
import DataMap from '../DataMap.js'

export class PresetText extends Data {
    collection: string[] = []

    enlist() {
        DataMap.addRootInstance({
            instance: new PresetText(),
            description: 'A basic collection of text strings used in multiple places.',
            documentation: {
                collection: 'Can be one or multiple strings.'
            },
            types: {
                collection: 'string'
            }
        })
    }
}