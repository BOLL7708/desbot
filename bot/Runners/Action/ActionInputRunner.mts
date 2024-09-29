import ActionInput from '../../../Shared/Objects/Data/Action/ActionInput.mts'
import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.mts'
import Utils from '../../../Shared/Utils/Utils.mts'
import ArrayUtils from '../../../Shared/Utils/ArrayUtils.mts'
import ExecUtils from '../../../Shared/Utils/ExecUtils.mts'
import AbstractActionRunner from './AbstractActionRunner.mts'

export default class ActionInputRunner extends AbstractActionRunner {
    getCallback<T>(key: string, instance: T): IActionCallback {
        return  {
            description: 'Callback that triggers an input action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone(instance as ActionInput)
                clone.commands = ArrayUtils.getAsType(clone.commands, clone.commands_use, index)
                ExecUtils.runCommandsFromAction(clone)
            }
        }
    }
}