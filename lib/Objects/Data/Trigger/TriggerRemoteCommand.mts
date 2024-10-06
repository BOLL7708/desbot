import AbstractTrigger from './AbstractTrigger.mts'
import DataMap from '../DataMap.mts'
import ModulesSingleton from '../../../Singletons/ModulesSingleton.mts'
import Utils from '../../../Utils/Utils.mts'

export default class TriggerRemoteCommand extends AbstractTrigger {
    entries: string[] = ['']
    globalCooldown: number = 0
    userCooldown: number = 0

    enlist() {
        DataMap.addRootInstance({
            instance: new TriggerRemoteCommand(),
            tag: '📡',
            description: 'The most basic command, used for remote execution.',
            documentation: {
                entries: 'The command or commands that can be used with this trigger.',
                globalCooldown: 'The number of seconds before this can be used again, by anyone.',
                userCooldown: 'The number of seconds before this can be used again, by the same user.'
            },
            types: {
                entries: 'string'
            }
        })
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