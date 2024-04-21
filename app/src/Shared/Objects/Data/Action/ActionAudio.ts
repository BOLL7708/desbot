import AbstractAction, {IActionCallback} from './AbstractAction.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import DataMap from '../DataMap.js'
import DataUtils from '../DataUtils.js'

export default class ActionAudio extends AbstractAction {
    srcEntries: string[] = ['']
    srcEntries_use = OptionEntryUsage.First
    volume: number = 1.0
    nonce: string = ''
    repeat: number = 1
    channel: number = 0
    onTTSQueue: boolean = true

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionAudio(),
            tag: '🎶',
            description: 'Trigger audio clips.',
            documentation: {
                srcEntries: 'The web URL, local URL or data URL of one or more audio files.\n\nA path ending in a slash or including an asterisk will do a wildcard match of multiple files.',
                volume: 'The volume of the audio, the valid range is 0.0 to 1.0.',
                nonce: 'A unique value that is provided to the callback for audio finished playing.\n\nWill be overwritten for automatic rewards, and is used for some functionality in the fixed rewards.',
                repeat: 'Repeat the playback of this audio this many times.',
                channel: 'Channel to play on, it is a separate instance of the audio player.',
                onTTSQueue: 'If true, the audio will be queued with TTS to play after the current speech is finished.'
            },
            types: {
                srcEntries: DataUtils.getStringFileAudioRef(),
                srcEntries_use: OptionEntryUsage.ref
            }
        })
    }

    async build(key: string): Promise<IActionCallback> {
        const runner = await import('../../../../Server/Objects/Data/ActionAudioRunner.js')
        const instance = new runner.default()
        return instance.getCallback<ActionAudio>(key, this)
    }
}

