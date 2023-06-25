import DataMap from '../DataMap.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import ConfigTwitch from '../Config/ConfigTwitch.js'
import TextHelper from '../../Classes/TextHelper.js'
import Utils from '../../Classes/Utils.js'
import {ITwitchCommandConfig} from '../../Interfaces/itwitch.js'
import {ActionHandler} from '../../Pages/Widget/Actions.js'
import Trigger from '../Trigger.js'

export class TriggerRemoteCommand extends Trigger {
    entries: string[] = []
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
        if(this.entries.length) {
            const twitchConfig = await DataBaseHelper.loadMain(new ConfigTwitch())
            for(let trigger of this.entries) {
                trigger = TextHelper.replaceTags(trigger, {eventKey: eventKey})
                const actionHandler = new ActionHandler(eventKey)

                // Set handler depending on cooldowns
                const allowedUsers = Utils.ensureObjectArrayNotId(twitchConfig.remoteCommandAllowedUsers).map((user) => user.userName).filter((login) => login)
                const useThisCommand = <ITwitchCommandConfig> { trigger: trigger, allowedUsers: allowedUsers }
                if(this.userCooldown) useThisCommand.cooldownUserHandler = actionHandler
                else if(this.globalCooldown) useThisCommand.cooldownHandler = actionHandler
                else useThisCommand.handler = actionHandler
                modules.twitch.registerRemoteCommand(useThisCommand)
            }
        }
    }
}