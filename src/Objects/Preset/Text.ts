import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

export class PresetText extends BaseDataObject {
    collection: string[] = []
}

DataObjectMap.addRootInstance(
    new PresetText(),
    'A basic collection of text strings used in multiple places.',
    {
        collection: 'Can be one or multiple strings.'
    },
    {
        collection: 'string'
    }
)