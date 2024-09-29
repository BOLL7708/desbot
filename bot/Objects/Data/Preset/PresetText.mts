import AbstractData from '../AbstractData.mts'
import DataMap from '../DataMap.mts'

export default class PresetText extends AbstractData {
    // files: string[] = [] // TODO: To do this, we should have a way to list all files in the data folder so they can be picked in the editor. It needs to be uncached so it always loads the existing files.
    collection: string[] = []

    enlist() {
        DataMap.addRootInstance({
            instance: new PresetText(),
            description: 'A basic collection of text strings used in multiple places.',
            documentation: {
                collection: 'Can be one or multiple strings.'
            },
            types: {
                // files: DataUtils.getStringDataTextRef(),
                collection: 'string'
            }
        })
    }
}