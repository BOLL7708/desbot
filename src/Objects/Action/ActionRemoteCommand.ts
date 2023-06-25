import Data from '../Data.js'
import DataMap from '../DataMap.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'

export class ActionRemoteCommand extends Data {
    entries: string[] = []
    entries_use = OptionEntryUsage.All

    register() {
        DataMap.addRootInstance(
            new ActionRemoteCommand(),
            'Send remote command(s) to the remote command channel.',
            {},
            {
                entries: 'string',
                entries_use: OptionEntryUsage.ref()
            }
        )
    }
}