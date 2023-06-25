import Data from '../Data.js'
import DataMap from '../DataMap.js'
import {PresetOBSFilter, PresetOBSScene, PresetOBSSource} from '../Preset/PresetOBS.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'

export class ActionOBS extends Data {
    sceneEntries: (number|PresetOBSScene)[] = []
    sceneEntries_use = OptionEntryUsage.All
    sourceEntries: ActionOBSSource[] = []
    sourceEntries_use = OptionEntryUsage.All
    filterEntries: ActionOBSFilter[] = []
    filterEntries_use = OptionEntryUsage.All
    durationMs: number = 0
    state: boolean = true

    register() {
        DataMap.addRootInstance(
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
                sceneEntries_use: OptionEntryUsage.ref(),
                sourceEntries: ActionOBSSource.ref(),
                sourceEntries_use: OptionEntryUsage.ref(),
                filterEntries: ActionOBSFilter.ref(),
                filterEntries_use: OptionEntryUsage.ref()
            }
        )
    }
}
export class ActionOBSSource extends Data {
    scenePreset: number|PresetOBSScene = 0
    sourcePreset: number|PresetOBSSource = 0

    register() {
        DataMap.addSubInstance(
            new ActionOBSSource(),
            {
                scenePreset: 'The scene the source is in.'
            },{
                scenePreset: PresetOBSScene.refId(),
                sourcePreset: PresetOBSSource.refId()
            }
        )
    }
}
export class ActionOBSFilter extends Data {
    sourcePreset: number|PresetOBSSource = 0
    filterPreset: number|PresetOBSFilter = 0

    register() {
        DataMap.addSubInstance(
            new ActionOBSFilter(),
            {
                sourcePreset: 'The source the filter attached to.'
            },{
                sourcePreset: PresetOBSSource.refId(),
                filterPreset: PresetOBSFilter.refId()
            }
        )
    }
}

