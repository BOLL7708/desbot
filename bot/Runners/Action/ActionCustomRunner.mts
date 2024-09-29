import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.mts'
import Utils from '../../../Shared/Utils/Utils.mts'
import ModulesSingleton from '../../../Shared/Singletons/ModulesSingleton.mts'
import ActionCustom from '../../../Shared/Objects/Data/Action/ActionCustom.mts'
import AbstractActionRunner from './AbstractActionRunner.mts'

export default class ActionCustomRunner extends AbstractActionRunner {
    getCallback<T>(key: string, instance: T): IActionCallback {
        return {
            description: 'Callback that triggers arbitrary code',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                try {
                    const clone = Utils.clone(instance as ActionCustom)
                    const modules = ModulesSingleton.getInstance()
                    eval(clone.code)
                } catch (error) {
                    Utils.logWithBold(`Error in custom action <${key}>`, 'red')
                    console.warn(error)
                }
            }
        }
    }
}