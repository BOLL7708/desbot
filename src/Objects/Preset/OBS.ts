import DataObjectMap from '../DataObjectMap.js'
import BaseDataObject from '../BaseDataObject.js'

export class PresetOBSScene extends BaseDataObject {
    sceneName: string = ''
}
export class PresetOBSSource extends BaseDataObject {
    sourceName: string = ''
}
export class PresetOBSFilter extends BaseDataObject {
    filterName: string = ''
}

DataObjectMap.addRootInstance(
    new PresetOBSScene(),
    'An OBS scene referenced by name.',
    {
        sceneName: 'The exact name of the scene in OBS.'
    }
)
DataObjectMap.addRootInstance(
    new PresetOBSScene(),
    'An OBS source referenced by name.',
    {
        sceneName: 'The exact name of the source in OBS.'
    }
)
DataObjectMap.addRootInstance(
    new PresetOBSScene(),
    'An OBS filter referenced by name.',
    {
        sceneName: 'The exact name of the filter in OBS.'
    }
)