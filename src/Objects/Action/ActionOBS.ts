import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'
import {PresetOBSFilter, PresetOBSScene, PresetOBSSource} from '../Preset/OBS.js'
import {EnumEntryUsage} from '../../Enums/EntryType.js'

export class ActionOBS extends BaseDataObject {
    sceneEntries: number[]|PresetOBSScene[] = []
    sceneEntries_use = EnumEntryUsage.All
    sourceEntries: ActionOBSSource[] = []
    sourceEntries_use = EnumEntryUsage.All
    filterEntries: ActionOBSFilter[] = []
    filterEntries_use = EnumEntryUsage.All
    durationMs: number = 0
    state: boolean = true
}
export class ActionOBSSource extends BaseDataObject {
    scenePreset: number|PresetOBSScene = 0
    sourcePreset: number|PresetOBSSource = 0
}
export class ActionOBSFilter extends BaseDataObject {
    sourcePreset: number|PresetOBSSource = 0
    filterPreset: number|PresetOBSFilter = 0
}

DataObjectMap.addRootInstance(
    new ActionOBS(),
    'Used to toggle OBS sources or filters.',
    {
        sceneEntries: 'The scenes to affect.',
        sourceEntries: 'The sources to affect.',
        filterEntries: 'The filters to affect.',
        durationMs: 'The elements will switch state again after this amount of milliseconds if more than 0.',
        state: 'Define a specific state, true is on/visible.'
    },
    {
        sceneEntries: PresetOBSScene.refId(),
        sceneEntries_use: EnumEntryUsage.ref(),
        sourceEntries: ActionOBSSource.ref(),
        sourceEntries_use: EnumEntryUsage.ref(),
        filterEntries: ActionOBSFilter.ref(),
        filterEntries_use: EnumEntryUsage.ref()
    }
)
DataObjectMap.addSubInstance(
    new ActionOBSSource(),
    {
        scenePreset: 'The scene the source is in.'
    },{
        scenePreset: PresetOBSScene.refId(),
        sourcePreset: PresetOBSSource.refId()
    }
)
DataObjectMap.addSubInstance(
    new ActionOBSFilter(),
    {
        sourcePreset: 'The source the filter attached to.'
    },{
        sourcePreset: PresetOBSSource.refId(),
        filterPreset: PresetOBSFilter.refId()
    }
)
