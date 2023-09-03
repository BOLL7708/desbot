import DataMap from '../DataMap.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import {PresetPhilipsHueBulb, PresetPhilipsHueBulbState} from '../Preset/PresetPhilipsHue.js'
import Action, {IActionCallback, IActionUser} from '../Action.js'
import Utils from '../../Classes/Utils.js'
import ArrayUtils from '../../Classes/ArrayUtils.js'
import PhilipsHueHelper from '../../Classes/PhilipsHueHelper.js'
import {IData} from '../Data.js'
import {DataUtils} from '../DataUtils.js'

export class ActionPhilipsHueBulb extends Action {
    entries: number[]|IData<string> = []
    entries_use = OptionEntryUsage.All
    colorEntries: number[]|IData<PresetPhilipsHueBulbState> = []
    colorEntries_use = OptionEntryUsage.First

    enlist() {
        DataMap.addRootInstance(
            new ActionPhilipsHueBulb(),
            'Trigger Philips Hue bulb changes.',
            {
                colorEntries: 'The color(s) to set the bulb(s) to, as all bulbs are set in a batch only one color will be used even if you pick something that returns multiples.',
                entries: 'The bulbs to affect.',
            },
            {
                entries: PresetPhilipsHueBulb.refIdKeyLabel(),
                entries_use: OptionEntryUsage.ref(),
                colorEntries: PresetPhilipsHueBulbState.refId(),
                colorEntries_use: OptionEntryUsage.ref()
            }
        )
    }

    build(key: string): IActionCallback {
        return  {
            tag: '🎨',
            description: 'Callback that triggers a Philips Hue bulb action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone<ActionPhilipsHueBulb>(this)
                const ids = ArrayUtils.getAsType(DataUtils.ensureValues(clone.entries) ?? [], clone.entries_use, index)
                const colors = ArrayUtils.getAsType(DataUtils.ensureValues(clone.colorEntries) ?? [], clone.colorEntries_use, index)
                const color = colors.pop() // No reason to set more than one color at the same time for the same bulb.
                if(color) {
                    PhilipsHueHelper.runBulbs(ids, color.brightness, color.hue, color.saturation)
                }
            }
        }
    }
}

