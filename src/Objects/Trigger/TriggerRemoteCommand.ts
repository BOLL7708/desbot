import DataMap from '../DataMap.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
import Utils from '../../Classes/Utils.js'
import Trigger from '../Trigger.js'

export class TriggerRemoteCommand extends Trigger {
    entries: string[] = ['']
    globalCooldown: number = 0
    userCooldown: number = 0

    enlist() {
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

    async register(eventKey: string) {
        const modules = ModulesSingleton.getInstance()
        const clone = Utils.clone<TriggerRemoteCommand>(this)
        if(this.entries.length) {
            for(let trigger of clone.entries) {
                modules.twitch.registerRemoteCommand(clone, eventKey)
            }
        }
    }
}