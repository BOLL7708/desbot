import ActionPhilipsHuePlug from '../../../Shared/Objects/Data/Action/ActionPhilipsHuePlug.mts'
import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.mts'
import Utils from '../../../Shared/Utils/Utils.mts'
import ArrayUtils from '../../../Shared/Utils/ArrayUtils.mts'
import DataUtils from '../../../Shared/Objects/Data/DataUtils.mts'
import PhilipsHueHelper from '../../../Shared/Helpers/PhilipsHueHelper.mts'
import AbstractActionRunner from './AbstractActionRunner.mts'

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