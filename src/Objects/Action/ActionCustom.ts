import DataMap from '../DataMap.js'
import Action, {IActionCallback, IActionUser} from '../Action.js'
import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import Utils from '../../Classes/Utils.js'

export class ActionCustom extends Action {
    code: string = ''

    enlist() {
        DataMap.addRootInstance(
            new ActionCustom(),
            'Provide a custom action callback, this can execute any arbitrary code you provide.\n\nOBS: If you put anything that breaks in here it will wreck the whole thing when executed.',
            {
                code: 'Should be valid JavaScript code.'
            },
            {
                code: 'string|code'
            }
        )
    }

    build(key: string): IActionCallback {
        return {
            tag: '❓',
            description: 'Callback that triggers arbitrary code',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone<ActionCustom>(this)
                eval(clone.code)
            }
        }
    }
}