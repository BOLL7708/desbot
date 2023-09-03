import Data, {IData} from '../Data.js'
import DataMap from '../DataMap.js'
import {PresetPipeCustom} from '../Preset/PresetPipe.js'
import {ActionAudio} from '../Action/ActionAudio.js'
import {PresetDiscordWebhook} from '../Preset/PresetDiscordWebhook.js'
import {SettingUser} from '../Setting/SettingUser.js'

export default class ConfigChat extends Data {
    pipePreset: number|IData<PresetPipeCustom> = 0
    pipePreset_forMs: number = 5000
    soundEffectOnEmptyMessage: number|IData<ActionAudio> = 0
    speechTemplate: string = '%userNick said: %userInput'
    logToDiscord: number|IData<PresetDiscordWebhook> = 0
    proxyChatBotUser: number|IData<SettingUser> = 0
    proxyChatMessageRegex: string = '/\\[(\\w*):\\s(.+)\\]\\s(.+)/'

    enlist() {
        DataMap.addRootInstance(
            new ConfigChat(),
            'Settings for how to handle Twitch Chat for various systems.',
            {
                pipePreset: 'The Pipe preset for chat messages. Duration to display the headset overlay for in milliseconds.',
                soundEffectOnEmptyMessage: 'Sound that will play if a chat message does not have any content that should be read out.',
                speechTemplate: 'String used for TTS, `%userNick` is the name of the user, `%userInput` is the message.',
                logToDiscord: 'Mirror all chat to a discord channel.',
                proxyChatBotUser: 'When using a chat proxy service, like Restream, you can use this to read the messges coming in from that bot as if it were the original user.',
                proxyChatMessageRegex: 'A regular expression to extract the username and message from the proxy chat message.\nThere should be three capture groups, in order: botname, username, message'
            },
            {
                pipePreset: PresetPipeCustom.ref.id.build(),
                soundEffectOnEmptyMessage: ActionAudio.ref.key.id.build(),
                logToDiscord: PresetDiscordWebhook.ref.id.build(),
                proxyChatBotUser: SettingUser.ref.id.label.build(),
            }
        )
    }
}