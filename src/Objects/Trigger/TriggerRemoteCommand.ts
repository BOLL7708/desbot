import Data from '../Data.js'
import DataMap from '../DataMap.js'

export class TriggerRemoteCommand extends Data{
    entries: string[] = []
    globalCooldown: number = 0
    userCooldown: number = 0

    register() {
        DataMap.addRootInstance(
            new TriggerRemoteCommand(),
            'The most basic command, used for remote execution.',
            {
                entries: 'The command or commands that can be used with this trigger.',
                globalCooldown: 'The number of seconds before this can be used again, by anyone.',
                userCooldown: 'The number of seconds before this can be used again, by the same user.'
            },
            {
                entries: 'string'
            }
        )
    }
}