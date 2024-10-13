import {ActionPhilipsHueBulb, DataUtils, IActionCallback, IActionUser} from '../../../lib/index.mts'
import PhilipsHueHelper from '../../Helpers/PhilipsHueHelper.mts'
import ArrayUtils from '../../Utils/ArrayUtils.mts'
import Utils from '../../Utils/Utils.mts'

// deno-lint-ignore require-await
ActionPhilipsHueBulb.prototype.build = async function <T>(key: string, instance: T): Promise<IActionCallback> {
   return {
      description: 'Callback that triggers a Philips Hue bulb action',
      call: async (user: IActionUser, nonce: string, index?: number) => {
         const clone = Utils.clone(instance as ActionPhilipsHueBulb)
         const ids = ArrayUtils.getAsType(DataUtils.ensureKeyArray(clone.entries) ?? [], clone.entries_use, index)
         let colors = ArrayUtils.getAsType(DataUtils.ensureDataArray(clone.colorEntries) ?? [], clone.colorEntries_use, index)
         if (colors.length > 0 && ids.length > 0) {
            if (clone.colorEntries_delay <= 0) colors = [colors[0]] // No reason to set more than one color if there is no delay as that would be at the same time.
            let delay = 0
            for (const color of colors) {
               setTimeout(() => {
                  PhilipsHueHelper.runBulbs(ids, color.brightness, color.hue, color.saturation)
               }, delay)
               delay += (clone.colorEntries_delay * 1000)
            }
         }
      }
   }
}