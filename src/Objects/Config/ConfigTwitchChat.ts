import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'
import {PresetPipeCustom} from '../Preset/PresetPipe.js'
import {ActionAudio} from '../Action/ActionAudio.js'
import {PresetDiscordWebhook} from '../Preset/PresetDiscordWebhook.js'

export default class ConfigTwitchChat extends BaseDataObject {
    pipePreset: (number|PresetPipeCustom) = 0
    pipePreset_forMs: number = 5000
    soundEffectOnEmptyMessage: (number|ActionAudio) = 0
    speechTemplate: string = '%userNick said: %userInput'
    logToDiscord: number|PresetDiscordWebhook = 0

    register() {
        DataObjectMap.addRootInstance(
            new ConfigTwitchChat(),
            'Settings for how to handle Twitch Chat for various systems.',
            {
                pipePreset: 'The Pipe preset for chat messages. Duration to display the headset overlay for in milliseconds.',
                soundEffectOnEmptyMessage: 'Sound that will play if a chat message does not have any content that should be read out.',
                speechTemplate: 'String used for TTS, `%userNick` is the name of the user, `%userInput` is the message.',
                logToDiscord: 'Mirror all chat to a discord channel.'
            },
            {
                pipePreset: PresetPipeCustom.refId(),
                soundEffectOnEmptyMessage: ActionAudio.refId(),
                logToDiscord: PresetDiscordWebhook.refId()
            }
        )
    }
}