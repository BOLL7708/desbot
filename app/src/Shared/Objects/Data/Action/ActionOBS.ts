import AbstractAction, {IActionCallback, IActionUser} from './AbstractAction.js'
import AbstractData, {DataEntries} from '../AbstractData.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import DataMap from '../DataMap.js'
import {PresetOBSFilter, PresetOBSScene, PresetOBSSource} from '../Preset/PresetOBS.js'
import Utils from '../../../Utils/Utils.js'
import ModulesSingleton from '../../../Singletons/ModulesSingleton.js'

export class ActionOBS extends AbstractAction {
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

    build(key: string): IActionCallback {
        return {
            description: 'Callback that triggers an OBS action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone(this) as ActionOBS
                const modules = ModulesSingleton.getInstance()
                // clone.key = key TODO: Is this needed for the group toggling?
                const state = clone.state
                console.log("OBS Reward triggered")
                modules.obs.toggle(clone, state)
            }
        }
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

