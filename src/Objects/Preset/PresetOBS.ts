import DataMap from '../DataMap.js'
import Data from '../Data.js'

export class PresetOBSScene extends Data {
    sceneName: string = ''

    enlist() {
        DataMap.addRootInstance(
            new PresetOBSScene(),
            'An OBS scene referenced by name.',
            {
                sceneName: 'The exact name of the scene in OBS.'
            }
        )
    }
}
export class PresetOBSSource extends Data {
    sourceName: string = ''

    enlist() {
        DataMap.addRootInstance(
            new PresetOBSSource(),
            'An OBS source referenced by name.',
            {
                sourceName: 'The exact name of the source in OBS.'
            }
        )
    }
}
export class PresetOBSFilter extends Data {
    filterName: string = ''

    enlist() {
        DataMap.addRootInstance(
            new PresetOBSFilter(),
            'An OBS filter referenced by name.',
            {
                filterName: 'The exact name of the filter in OBS.'
            }
        )
    }
}