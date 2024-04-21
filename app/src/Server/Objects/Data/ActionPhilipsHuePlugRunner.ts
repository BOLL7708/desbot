import ActionPhilipsHuePlug from '../../../Shared/Objects/Data/Action/ActionPhilipsHuePlug.js'
import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.js'
import Utils from '../../../Shared/Utils/Utils.js'
import ArrayUtils from '../../../Shared/Utils/ArrayUtils.js'
import DataUtils from '../../../Shared/Objects/Data/DataUtils.js'
import PhilipsHueHelper from '../../../Shared/Helpers/PhilipsHueHelper.js'
import AbstractActionRunner from './AbstractActionRunner.js'

export default class ActionPhilipsHuePlugRunner extends AbstractActionRunner {
    getCallback<T>(key: string, instance: T): IActionCallback {
        return  {
            description: 'Callback that triggers a Philips Hue plug action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone(instance as ActionPhilipsHuePlug)
                const ids = ArrayUtils.getAsType(DataUtils.ensureKeyArray(clone.entries) ?? [], clone.entries_use, index)
                PhilipsHueHelper.runPlugs(ids, clone.triggerState, clone.originalState, clone.duration)
            }
        }
    }
}