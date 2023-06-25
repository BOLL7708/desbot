import Data from '../Data.js'
import DataMap from '../DataMap.js'

export class PresetText extends Data {
    collection: string[] = []

    enlist() {
        DataMap.addRootInstance(
            new PresetText(),
            'A basic collection of text strings used in multiple places.',
            {
                collection: 'Can be one or multiple strings.'
            },
            {
                collection: 'string'
            }
        )
    }
}