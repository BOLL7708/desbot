import DataMap from '../DataMap.js'
import Data from '../Data.js'
import {SettingUser} from '../Setting/SettingUser.js'
import {PresetDiscordWebhook} from '../Preset/PresetDiscordWebhook.js'
import {PresetPermissions} from '../Preset/PresetPermissions.js'

export default class ConfigCommands extends Data {
    commandPrefix: string = '!'
    defaultCommandPermissions: number|PresetPermissions = 0
    ignoreModerators: number[]|SettingUser[] = []
    allowWhisperCommands: boolean = true
    logWhisperCommandsToDiscord: number|PresetDiscordWebhook = 0
    remoteCommandChannel: number|SettingUser = 0
    remoteCommandPrefix: string = '!'
    remoteCommandAllowedUsers: number[]|SettingUser[] = []
    postCommandHelpToDiscord: number|PresetDiscordWebhook = 0

    enlist() {
        DataMap.addRootInstance(
            new ConfigCommands(),
            'Settings for Twitch.',
            {
                commandPrefix: 'Prefix for triggering chat commands.',
                defaultCommandPermissions: 'Default permissions for commands that do not have any set.',
                ignoreModerators: 'List of moderators that should not be able to execute commands, useful for bots.',
                allowWhisperCommands: 'Will allow users to execute commands by whispering the chatbot.',
                logWhisperCommandsToDiscord: 'Will push whisper commands to separate Discord channel for audit purposes.',
                remoteCommandChannel: 'Set this to a Twitch channel name if you want to allow remote commands from a different channel.',
                remoteCommandPrefix: 'Prefix for triggering remote chat commands.',
                remoteCommandAllowedUsers: 'Only allow remote command for these specific users.',
                postCommandHelpToDiscord: 'Will post a list of available commands to a Discord channel if that command is run.'
            },
            {
                defaultCommandPermissions: PresetPermissions.refId(),
                ignoreModerators: SettingUser.refIdLabel(),
                logWhisperCommandsToDiscord: PresetDiscordWebhook.refId(),
                remoteCommandChannel: SettingUser.refIdLabel(),
                remoteCommandAllowedUsers: SettingUser.refIdLabel(),
                postCommandHelpToDiscord: PresetDiscordWebhook.refId()
            }
        )
    }
}