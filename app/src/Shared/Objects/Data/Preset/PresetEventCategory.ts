import AbstractData from '../AbstractData.js'
import DataMap from '../DataMap.js'

export default class PresetEventCategory extends AbstractData {
    description: string = ''

    enlist() {
        DataMap.addRootInstance({
            instance: new PresetEventCategory(),
            description: 'A category for events, this is used to group events together in the UI.',
            documentation: {
                description: 'A description of the category.'
            }
        })
    }
}