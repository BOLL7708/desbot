import ActionInput from '../../../Shared/Objects/Data/Action/ActionInput.js'
import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.js'
import Utils from '../../../Shared/Utils/Utils.js'
import ArrayUtils from '../../../Shared/Utils/ArrayUtils.js'
import ExecUtils from '../../../Shared/Utils/ExecUtils.js'

export default class ActionInputRunner extends ActionInput {
    build(key: string): IActionCallback {
        return  {
            description: 'Callback that triggers an input action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone<ActionInput>(this)
                clone.commands = ArrayUtils.getAsType(clone.commands, clone.commands_use, index)
                ExecUtils.runCommandsFromAction(clone)
            }
        }
    }
}