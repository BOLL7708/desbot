import DataMap from '../DataMap.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import {PresetPhilipsHueBulb, PresetPhilipsHueBulbState} from '../Preset/PresetPhilipsHue.js'
import Action, {IActionCallback, IActionUser} from '../Action.js'
import Utils from '../../Classes/Utils.js'
import ArrayUtils from '../../Classes/ArrayUtils.js'
import PhilipsHueHelper from '../../Classes/PhilipsHueHelper.js'
import {DataUtils} from '../DataUtils.js'
import {DataEntries} from '../Data.js'

export class ActionPhilipsHueBulb extends Action {
    entries: number[]|DataEntries<PresetPhilipsHueBulb> = []
    entries_use = OptionEntryUsage.All
    colorEntries: number[]|DataEntries<PresetPhilipsHueBulbState> = []
    colorEntries_use = OptionEntryUsage.All
    colorEntries_delay = 0

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionPhilipsHueBulb(),
            tag: '💡',
            description: 'Trigger Philips Hue bulb changes.',
            documentation: {
                colorEntries: 'The color(s) to set the bulb(s) to, if more than one color is used and a positive delay in seconds has been provided, they will automatically be applied in sequence.',
                entries: 'The bulbs to affect.',
            },
            types: {
                entries: PresetPhilipsHueBulb.ref.id.label.build(),
                entries_use: OptionEntryUsage.ref,
                colorEntries: PresetPhilipsHueBulbState.ref.id.build(),
                colorEntries_use: OptionEntryUsage.ref
            }
        })
    }

    build(key: string): IActionCallback {
        return  {
            description: 'Callback that triggers a Philips Hue bulb action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone<ActionPhilipsHueBulb>(this)
                const ids = ArrayUtils.getAsType(DataUtils.ensureKeyArray(clone.entries) ?? [], clone.entries_use, index)
                let colors = ArrayUtils.getAsType(DataUtils.ensureDataArray(clone.colorEntries) ?? [], clone.colorEntries_use, index)
                if(colors.length > 0 && ids.length > 0) {
                    if(this.colorEntries_delay <= 0) colors = [colors[0]] // No reason to set more than one color if there is no delay as that would be at the same time.
                    let delay = 0
                    for(const color of colors) {
                        setTimeout(() => {
                            PhilipsHueHelper.runBulbs(ids, color.brightness, color.hue, color.saturation)
                        }, delay)
                        delay += (this.colorEntries_delay*1000)
                    }
                }
            }
        }
    }
}

