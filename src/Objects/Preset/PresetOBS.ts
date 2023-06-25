import DataObjectMap from '../DataObjectMap.js'
import BaseDataObject from '../BaseDataObject.js'

export class PresetOBSScene extends BaseDataObject {
    sceneName: string = ''

    register() {
        DataObjectMap.addRootInstance(
            new PresetOBSScene(),
            'An OBS scene referenced by name.',
            {
                sceneName: 'The exact name of the scene in OBS.'
            }
        )
    }
}
export class PresetOBSSource extends BaseDataObject {
    sourceName: string = ''

    register() {
        DataObjectMap.addRootInstance(
            new PresetOBSSource(),
            'An OBS source referenced by name.',
            {
                sourceName: 'The exact name of the source in OBS.'
            }
        )
    }
}
export class PresetOBSFilter extends BaseDataObject {
    filterName: string = ''

    register() {
        DataObjectMap.addRootInstance(
            new PresetOBSFilter(),
            'An OBS filter referenced by name.',
            {
                filterName: 'The exact name of the filter in OBS.'
            }
        )
    }
}