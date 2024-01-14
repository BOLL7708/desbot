import DataMap from '../DataMap.js'
import Action, {IActionCallback, IActionUser} from '../Action.js'
import Utils from '../../Classes/Utils.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'

export class ActionCustom extends Action {
    code: string = ''

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionCustom(),
            description: 'Provide a custom action callback, this can execute any arbitrary code you provide.\n\nOBS: If you put anything that breaks in here it will wreck the whole thing when executed.',
            documentation: {
                code: 'Should be valid JavaScript code.'
            },
            types: {
                code: 'string|code'
            }
        })
    }

    build(key: string): IActionCallback {
        return {
            tag: '❓',
            description: 'Callback that triggers arbitrary code',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                try {
                    const clone = Utils.clone<ActionCustom>(this)
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