import AbstractAction, {IActionCallback} from './AbstractAction.mts'
import {OptionEntryUsage} from '../../Options/OptionEntryType.mts'
import DataMap from '../DataMap.mts'

export default class ActionURI extends AbstractAction {
    entries: string[] = ['']
    entries_use = OptionEntryUsage.First
    delayMs: number = 0

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionURI(),
            tag: '🔗',
            description: 'Loads http/https URLs or custom schema URIs silently in the background.',
            documentation: {
                entries: 'Full URIs including protocol.\n\nhttp:// and https:// will load as web URLs, while custom schemas [custom]:// will be executed as local system calls.',
                delayMs: 'Delay between URI loads, in milliseconds.'
            },
            types: {
                entries: 'string',
                entries_use: OptionEntryUsage.ref
            }
        })
    }

    async build(key: string): Promise<IActionCallback> {
        const runner = await import('../../../../Server/Runners/Action/ActionURIRunner.mts')
        const instance = new runner.default()
        return instance.getCallback<ActionURI>(key, this)
    }
}

