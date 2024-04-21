import AbstractData, {DataEntries} from '../AbstractData.js'
import DataMap from '../DataMap.js'
import {PresetPipeCustom} from '../Preset/PresetPipe.js'
import ActionAudio from '../Action/ActionAudio.js'
import PresetDiscordWebhook from '../Preset/PresetDiscordWebhook.js'
import SettingUser from '../Setting/SettingUser.js'

export default class ConfigChat extends AbstractData {
    pipePreset: number|DataEntries<PresetPipeCustom> = 0
    pipePreset_forMs: number = 5000
    soundEffectOnEmptyMessage: number|DataEntries<ActionAudio> = 0
    speechTemplate: string = '%userNick said: %userInput'
    logToDiscord: number|DataEntries<PresetDiscordWebhook> = 0
    proxyChatBotUser: number|DataEntries<SettingUser> = 0
    proxyChatMessageRegex: string = '/\\[(\\w*):\\s(.+)\\]\\s(.+)/'

    enlist() {
        DataMap.addRootInstance({
            instance: new ConfigChat(),
            description: 'Settings for how to handle Twitch Chat for various systems.',
            documentation: {
                pipePreset: 'The Pipe preset for chat messages. Duration to display the headset overlay for in milliseconds.',
                soundEffectOnEmptyMessage: 'Sound that will play if a chat message does not have any content that should be read out.',
                speechTemplate: 'String used for TTS, `%userNick` is the name of the user, `%userInput` is the message.',
                logToDiscord: 'Mirror all chat to a discord channel.',
                proxyChatBotUser: 'When using a chat proxy service, like Restream, you can use this to read the messges coming in from that bot as if it were the original user.',
                proxyChatMessageRegex: 'A regular expression to extract the username and message from the proxy chat message.\nThere should be three capture groups, in order: botname, username, message'
            },
            types: {
                pipePreset: PresetPipeCustom.ref.id.build(),
                soundEffectOnEmptyMessage: ActionAudio.ref.id.build(),
                logToDiscord: PresetDiscordWebhook.ref.id.build(),
                proxyChatBotUser: SettingUser.ref.id.label.build(),
            }
        })
    }
}