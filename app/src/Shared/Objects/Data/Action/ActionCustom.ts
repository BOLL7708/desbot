import AbstractAction from './AbstractAction.js'
import DataMap from '../DataMap.js'

export default class ActionCustom extends AbstractAction {
    code: string = ''

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionCustom(),
            tag: '❓',
            description: 'Provide a custom action callback, this can execute any arbitrary code you provide.\n\nOBS: If you put anything that breaks in here it will wreck the whole thing when executed.',
            documentation: {
                code: 'Should be valid JavaScript code.'
            },
            types: {
                code: 'string|code'
            }
        })
    }
}