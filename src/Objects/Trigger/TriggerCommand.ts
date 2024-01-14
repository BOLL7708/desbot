import DataMap from '../DataMap.js'
import {PresetPermissions} from '../Preset/PresetPermissions.js'
import Trigger from '../Trigger.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
import OptionCommandCategory from '../../Options/OptionCommandCategory.js'
import {DataEntries} from '../Data.js'

export class TriggerCommand extends Trigger {
    entries: string[] = ['']
    permissions: number|DataEntries<PresetPermissions> = 0
    requireUserTag = false
    requireExactWordCount: number = 0
    requireMinimumWordCount: number = 0
    globalCooldown: number = 0
    userCooldown: number = 0
    category: number = OptionCommandCategory.Uncategorized
    helpInput: string[] = []
    helpText: string = ''

    enlist() {
        DataMap.addRootInstance({
            instance: new TriggerCommand(),
            description: 'A chat command.',
            documentation: {
                entries: 'The commands that can be used with this trigger.',
                permissions: 'Permission for who can execute this command.',
                requireUserTag: 'Require this command to include a user tag to get triggered.',
                requireExactWordCount: 'Require this command to include exactly this number of words to get triggered.',
                requireMinimumWordCount: 'Require this command to include at least this number of words to get triggered.',
                globalCooldown: 'The number of seconds before this can be used again, by anyone.',
                userCooldown: 'The number of seconds before this can be used again, by the same user.',
                category: 'A category for grouping this command with others.',
                helpInput: 'Input values for the command, used to build the help text.',
                helpText: 'Description that is used for help documentation.'
            },
            types: {
                entries: 'string',
                permissions: PresetPermissions.ref.id.build(),
                category: OptionCommandCategory.ref,
                helpInput: 'string'
            }
        })
    }

    async register(eventKey: string) {
        const modules = ModulesSingleton.getInstance()
        if(this.entries.length > 0) {
            modules.twitch.registerCommandTrigger(this, eventKey)
        }
    }
}