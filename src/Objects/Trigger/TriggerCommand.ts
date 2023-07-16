import DataMap from '../DataMap.js'
import {PresetPermissions} from '../Preset/PresetPermissions.js'
import Trigger from '../Trigger.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
import Utils from '../../Classes/Utils.js'

export class TriggerCommand extends Trigger {
    entries: string[] = []
    permissions: number|PresetPermissions = 0
    requireUserTag = false
    requireExactWordCount: number = 0
    requireMinimumWordCount: number = 0
    globalCooldown: number = 0
    userCooldown: number = 0
    helpTitle: string = ''
    helpInput: string[] = []
    helpText: string = ''

    enlist() {
        DataMap.addRootInstance(new TriggerCommand(),
            'A chat command.',
            {
                entries: 'The commands that can be used with this trigger.',
                permissions: 'Permission for who can execute this command.',
                requireUserTag: 'Require this command to include a user tag to get triggered.',
                requireExactWordCount: 'Require this command to include exactly this number of words to get triggered.',
                requireMinimumWordCount: 'Require this command to include at least this number of words to get triggered.',
                globalCooldown: 'The number of seconds before this can be used again, by anyone.',
                userCooldown: 'The number of seconds before this can be used again, by the same user.',
                helpTitle: 'A title that is used when posting all help to Discord, is inserted above this command.',
                helpInput: 'Input values for the command, used to build the help text.',
                helpText: 'Description that is used for help documentation.'
            },
            {
                entries: 'string',
                permissions: PresetPermissions.refId(),
                helpInput: 'string'
            }
        )
    }

    register(eventKey: string) {
        const modules = ModulesSingleton.getInstance()
        const clone = Utils.clone<TriggerCommand>(this)
        if(clone.entries.length > 0) {
            modules.twitch.registerCommandTrigger(clone, eventKey)
        }
    }
}