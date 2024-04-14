import AbstractAction, {IActionCallback, IActionUser} from './AbstractAction.js'
import {DataEntries} from '../AbstractData.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import DataMap from '../DataMap.js'
import {PresetPhilipsHuePlug} from '../Preset/PresetPhilipsHue.js'
import Utils from '../../../Utils/Utils.js'
import ArrayUtils from '../../../Utils/ArrayUtils.js'
import PhilipsHueHelper from '../../../Helpers/PhilipsHueHelper.js'
import {DataUtils} from '../DataUtils.js'

export class ActionPhilipsHuePlug extends AbstractAction {
    entries: number[]|DataEntries<PresetPhilipsHuePlug> = []
    entries_use = OptionEntryUsage.All
    originalState: boolean = false
    triggerState: boolean = true
    duration: number = 0

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionPhilipsHuePlug(),
            tag: '🔌',
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
            description: 'Callback that triggers a Philips Hue plug action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone<ActionPhilipsHuePlug>(this)
                const ids = ArrayUtils.getAsType(DataUtils.ensureKeyArray(clone.entries) ?? [], clone.entries_use, index)
                PhilipsHueHelper.runPlugs(ids, clone.triggerState, clone.originalState, clone.duration)
            }
        }
    }
}