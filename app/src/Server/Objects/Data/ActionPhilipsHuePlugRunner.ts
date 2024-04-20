import ActionPhilipsHuePlug from '../../../Shared/Objects/Data/Action/ActionPhilipsHuePlug.js'
import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.js'
import Utils from '../../../Shared/Utils/Utils.js'
import ArrayUtils from '../../../Shared/Utils/ArrayUtils.js'
import {DataUtils} from '../../../Shared/Objects/Data/DataUtils.js'
import PhilipsHueHelper from '../../../Shared/Helpers/PhilipsHueHelper.js'

class ActionPhilipsHuePlugRunner extends ActionPhilipsHuePlug {
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