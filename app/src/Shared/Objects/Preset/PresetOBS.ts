import DataMap from '../DataMap.js'
import Data from '../Data.js'

export class PresetOBSScene extends Data {
    sceneName: string = ''

    enlist() {
        DataMap.addRootInstance({
            instance: new PresetOBSScene(),
            description: 'An OBS scene referenced by name.',
            documentation: {
                sceneName: 'The exact name of the scene in OBS.'
            }
        })
    }
}
export class PresetOBSSource extends Data {
    sourceName: string = ''

    enlist() {
        DataMap.addRootInstance({
            instance: new PresetOBSSource(),
            description: 'An OBS source referenced by name.',
            documentation: {
                sourceName: 'The exact name of the source in OBS.'
            }
        })
    }
}
export class PresetOBSFilter extends Data {
    filterName: string = ''

    enlist() {
        DataMap.addRootInstance({
            instance: new PresetOBSFilter(),
            description: 'An OBS filter referenced by name.',
            documentation: {
                filterName: 'The exact name of the filter in OBS.'
            }
        })
    }
}