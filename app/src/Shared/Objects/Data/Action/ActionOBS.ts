import AbstractAction, {IActionCallback} from './AbstractAction.js'
import AbstractData, {DataEntries} from '../AbstractData.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import DataMap from '../DataMap.js'
import PresetOBSScene, {PresetOBSFilter, PresetOBSSource} from '../Preset/PresetOBS.js'

export default class ActionOBS extends AbstractAction {
    sceneEntries: number[]|DataEntries<PresetOBSScene> = []
    sceneEntries_use = OptionEntryUsage.All
    sourceEntries: ActionOBSSource[] = []
    sourceEntries_use = OptionEntryUsage.All
    filterEntries: ActionOBSFilter[] = []
    filterEntries_use = OptionEntryUsage.All
    durationMs: number = 0
    state: boolean = true

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionOBS(),
            tag: '🎬',
            description: 'Used to toggle OBS sources or filters.',
            documentation: {
                sceneEntries: 'The scenes to affect.',
                sourceEntries: 'The sources to affect.',
                filterEntries: 'The filters to affect.',
                durationMs: 'The elements will switch state again after this amount of milliseconds if more than 0.',
                state: 'Define a specific state, true is on/visible.'
            },
            types: {
                sceneEntries: PresetOBSScene.ref.id.build(),
                sceneEntries_use: OptionEntryUsage.ref,
                sourceEntries: ActionOBSSource.ref.build(),
                sourceEntries_use: OptionEntryUsage.ref,
                filterEntries: ActionOBSFilter.ref.build(),
                filterEntries_use: OptionEntryUsage.ref
            }
        })
    }

    async build(key: string): Promise<IActionCallback> {
        const runner = await import('../../../../Server/Objects/Data/ActionOBSRunner.js')
        const instance = new runner.default()
        return instance.getCallback<ActionOBS>(key, this)
    }
}
export class ActionOBSSource extends AbstractData {
    scenePreset: number|DataEntries<PresetOBSScene> = 0
    sourcePreset: number|DataEntries<PresetOBSSource> = 0

    enlist() {
        DataMap.addSubInstance({
            instance: new ActionOBSSource(),
            documentation: {
                scenePreset: 'The scene the source is in.'
            },
            types: {
                scenePreset: PresetOBSScene.ref.id.build(),
                sourcePreset: PresetOBSSource.ref.id.build()
            }
        })
    }
}
export class ActionOBSFilter extends AbstractData {
    sourcePreset: number|DataEntries<PresetOBSSource> = 0
    filterPreset: number|DataEntries<PresetOBSFilter> = 0

    enlist() {
        DataMap.addSubInstance({
            instance: new ActionOBSFilter(),
            documentation: {
                sourcePreset: 'The source the filter attached to.'
            },
            types: {
                sourcePreset: PresetOBSSource.ref.id.build(),
                filterPreset: PresetOBSFilter.ref.id.build()
            }
        })
    }
}

