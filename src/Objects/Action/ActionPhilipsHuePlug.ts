import DataMap from '../DataMap.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import Action, {IActionCallback, IActionUser} from '../Action.js'
import PhilipsHueHelper from '../../Classes/PhilipsHueHelper.js'
import Utils from '../../Classes/Utils.js'
import {PresetPhilipsHuePlug} from '../Preset/PresetPhilipsHue.js'
import ArrayUtils from '../../Classes/ArrayUtils.js'
import {IData} from '../Data.js'
import {DataUtils} from '../DataUtils.js'

export class ActionPhilipsHuePlug extends Action {
    entries: number[]|IData<string> = []
    entries_use = OptionEntryUsage.All
    originalState: boolean = false
    triggerState: boolean = true
    duration: number = 0

    enlist() {
        DataMap.addRootInstance(
            new ActionPhilipsHuePlug(),
            'Trigger Philips Hue plug changes.',
            {
                entries: 'The plug IDs to affect.',
                originalState: 'If the plug original state is on or off.',
                triggerState: 'If the plug triggered state is on or off.',
                duration: 'Duration of plug action in seconds, 0 means it is permanent.'
            },
            {
                entries: PresetPhilipsHuePlug.refIdKeyLabel(),
                entries_use: OptionEntryUsage.ref()
            }
        )
    }

    build(key: string): IActionCallback {
        return  {
            tag: '🔌',
            description: 'Callback that triggers a Philips Hue plug action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone<ActionPhilipsHuePlug>(this)
                const ids = ArrayUtils.getAsType(DataUtils.ensureValues(clone.entries) ?? [], clone.entries_use, index)
                PhilipsHueHelper.runPlugs(ids, clone.triggerState, clone.originalState, clone.duration)
            }
        }
    }
}