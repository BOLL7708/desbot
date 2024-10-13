import {AbstractData} from '../AbstractData.mts'
import {DataMap} from '../DataMap.mts'

export class PresetEventCategory extends AbstractData {
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