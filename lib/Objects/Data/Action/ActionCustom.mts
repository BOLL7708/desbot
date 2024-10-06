import AbstractAction, {IActionCallback} from './AbstractAction.mts'
import DataMap from '../DataMap.mts'

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

    async build(key: string): Promise<IActionCallback> {
        const runner = await import('../../../../Server/Runners/Action/ActionCustomRunner.mts')
        const instance = new runner.default()
        return instance.getCallback<ActionCustom>(key, this)
    }
}