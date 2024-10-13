import {AbstractData, DataEntries} from '../AbstractData.mts'
import {DataMap} from '../DataMap.mts'
import {PresetPermissions} from '../Preset/PresetPermissions.mts'
import {SettingUser} from '../Setting/SettingUser.mts'
import {PresetDiscordWebhook} from '../Preset/PresetDiscordWebhook.mts'

export class ConfigCommands extends AbstractData {
    commandPrefix: string = '!'
    defaultCommandPermissions: number|DataEntries<PresetPermissions> = 0
    ignoreModerators: number[]|DataEntries<SettingUser> = []
    allowWhisperCommands: boolean = false
    logWhisperCommandsToDiscord: number|DataEntries<PresetDiscordWebhook> = 0
    remoteCommandChannel: number|DataEntries<SettingUser> = 0
    remoteCommandPrefix: string = '!'
    remoteCommandAllowedUsers: number[]|DataEntries<SettingUser> = []
    postCommandHelpToDiscord: number|DataEntries<PresetDiscordWebhook> = 0

    enlist() {
        DataMap.addRootInstance({
            instance: new ConfigCommands(),
            description: 'Settings for Twitch.',
            documentation: {
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
            types: {
                defaultCommandPermissions: PresetPermissions.ref.id.build(),
                ignoreModerators: SettingUser.ref.id.label.build(),
                logWhisperCommandsToDiscord: PresetDiscordWebhook.ref.id.build(),
                remoteCommandChannel: SettingUser.ref.id.label.build(),
                remoteCommandAllowedUsers: SettingUser.ref.id.label.build(),
                postCommandHelpToDiscord: PresetDiscordWebhook.ref.id.build()
            }
        })
    }
}