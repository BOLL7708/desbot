import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'
import {PresetOBSFilter, PresetOBSScene, PresetOBSSource} from '../Preset/OBS.js'
import {EnumEntryType} from '../../Enums/EntryType.js'

export class ActionOBS extends BaseDataObject {
    sceneEntries: PresetOBSScene[] = []
    sceneEntriesType = EnumEntryType.All
    sourceEntries: ActionOBSSource[] = []
    sourceEntriesType = EnumEntryType.All
    filterEntries: ActionOBSFilter[] = []
    filterEntriesType = EnumEntryType.All
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
        sceneEntriesType: EnumEntryType.ref(),
        sourceEntries: ActionOBSSource.ref(),
        sourceEntriesType: EnumEntryType.ref(),
        filterEntries: ActionOBSFilter.ref(),
        filterEntriesType: EnumEntryType.ref()
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
