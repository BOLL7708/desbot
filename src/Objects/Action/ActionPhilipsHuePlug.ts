import DataMap from '../DataMap.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import Action, {IActionCallback, IActionUser} from '../Action.js'
import PhilipsHueHelper from '../../Classes/PhilipsHueHelper.js'
import Utils from '../../Classes/Utils.js'
import {PresetPhilipsHuePlug} from '../Preset/PresetPhilipsHue.js'
import ArrayUtils from '../../Classes/ArrayUtils.js'
import {DataUtils} from '../DataUtils.js'
import {DataEntries} from '../Data.js'

export class ActionPhilipsHuePlug extends Action {
    entries: number[]|DataEntries<PresetPhilipsHuePlug> = []
    entries_use = OptionEntryUsage.All
    originalState: boolean = false
    triggerState: boolean = true
    duration: number = 0

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionPhilipsHuePlug(),
            description: 'Trigger Philips Hue plug changes.',
            documentation: {
                entries: 'The plug IDs to affect.',
                originalState: 'If the plug original state is on or off.',
                triggerState: 'If the plug triggered state is on or off.',
                duration: 'Duration of plug action in seconds, 0 means it is permanent.'
            },
            types: {
                entries: PresetPhilipsHuePlug.ref.id.label.build(),
                entries_use: OptionEntryUsage.ref
            }
        })
    }

    build(key: string): IActionCallback {
        return  {
            tag: '🔌',
            description: 'Callback that triggers a Philips Hue plug action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone<ActionPhilipsHuePlug>(this)
                const ids = ArrayUtils.getAsType(DataUtils.ensureKeyArray(clone.entries) ?? [], clone.entries_use, index)
                PhilipsHueHelper.runPlugs(ids, clone.triggerState, clone.originalState, clone.duration)
            }
        }
    }
}