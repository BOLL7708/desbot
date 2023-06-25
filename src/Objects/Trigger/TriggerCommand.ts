import DataMap from '../DataMap.js'
import {PresetPermissions} from '../Preset/PresetPermissions.js'
import Trigger from '../Trigger.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
import TextHelper from '../../Classes/TextHelper.js'
import {ITwitchCommandConfig} from '../../Interfaces/itwitch.js'
import {ActionHandler} from '../../Pages/Widget/Actions.js'

export class TriggerCommand extends Trigger {
    entries: string[] = []
    permissions: number|PresetPermissions = 0
    requireUserTag = false
    requireExactWordCount: number = 0
    requireMinimumWordCount: number = 0
    helpTitle: string = ''
    helpInput: string[] = []
    helpText: string = ''
    globalCooldown: number = 0
    userCooldown: number = 0

    enlist() {
        DataMap.addRootInstance(new TriggerCommand(),
            'A chat command.',
            {
                entries: 'The commands that can be used with this trigger.',
                permissions: 'Permission for who can execute this command.',
                requireUserTag: 'Require this command to include a user tag to get triggered.',
                requireExactWordCount: 'Require this command to include exactly this number of words to get triggered.',
                requireMinimumWordCount: 'Require this command to include at least this number of words to get triggered.',
                helpTitle: 'A title that is used when posting all help to Discord, is inserted above this command.',
                helpInput: 'Input values for the command, used to build the help text.',
                helpText: 'Description that is used for help documentation.',
                globalCooldown: 'The number of seconds before this can be used again, by anyone.',
                userCooldown: 'The number of seconds before this can be used again, by the same user.'
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
        if(this.entries.length > 0) {
            for(let trigger of this.entries) {
                trigger = TextHelper.replaceTags(trigger, {eventKey: eventKey})
                const actionHandler = new ActionHandler(eventKey)

                // Set handler depending on cooldowns
                const useThisCommand = <ITwitchCommandConfig> { trigger: trigger }
                if(this.userCooldown) useThisCommand.cooldownUserHandler = actionHandler
                else if(this.globalCooldown) useThisCommand.cooldownHandler = actionHandler
                else useThisCommand.handler = actionHandler
                modules.twitch.registerCommand(useThisCommand)
            }
        }
    }
}