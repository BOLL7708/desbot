import ActionInput from '../../../Shared/Objects/Data/Action/ActionInput.js'
import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.js'
import Utils from '../../../Shared/Utils/Utils.js'
import ArrayUtils from '../../../Shared/Utils/ArrayUtils.js'
import ExecUtils from '../../../Shared/Utils/ExecUtils.js'
import AbstractActionRunner from './AbstractActionRunner.js'

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