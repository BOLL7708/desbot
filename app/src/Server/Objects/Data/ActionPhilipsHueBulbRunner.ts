import ActionPhilipsHueBulb from '../../../Shared/Objects/Data/Action/ActionPhilipsHueBulb.js'
import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.js'
import Utils from '../../../Shared/Utils/Utils.js'
import ArrayUtils from '../../../Shared/Utils/ArrayUtils.js'
import DataUtils from '../../../Shared/Objects/Data/DataUtils.js'
import PhilipsHueHelper from '../../../Shared/Helpers/PhilipsHueHelper.js'
import AbstractActionRunner from './AbstractActionRunner.js'

export default class ActionPhilipsHueBulbRunner extends AbstractActionRunner {
    getCallback<T>(key: string, instance: T): IActionCallback {
        return  {
            description: 'Callback that triggers a Philips Hue bulb action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone(instance as ActionPhilipsHueBulb)
                const ids = ArrayUtils.getAsType(DataUtils.ensureKeyArray(clone.entries) ?? [], clone.entries_use, index)
                let colors = ArrayUtils.getAsType(DataUtils.ensureDataArray(clone.colorEntries) ?? [], clone.colorEntries_use, index)
                if(colors.length > 0 && ids.length > 0) {
                    if(clone.colorEntries_delay <= 0) colors = [colors[0]] // No reason to set more than one color if there is no delay as that would be at the same time.
                    let delay = 0
                    for(const color of colors) {
                        setTimeout(() => {
                            PhilipsHueHelper.runBulbs(ids, color.brightness, color.hue, color.saturation)
                        }, delay)
                        delay += (clone.colorEntries_delay*1000)
                    }
                }
            }
        }
    }
}