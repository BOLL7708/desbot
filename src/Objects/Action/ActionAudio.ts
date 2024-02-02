import DataMap from '../DataMap.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import Action, {IActionCallback, IActionUser} from '../Action.js'
import Utils from '../../Classes/Utils.js'
import TextHelper from '../../Classes/TextHelper.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
import ArrayUtils from '../../Classes/ArrayUtils.js'
import {DataUtils} from '../DataUtils.js'
import AssetsHelper from '../../Classes/AssetsHelper.js'

export class ActionAudio extends Action {
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
            tag: '🔊',
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

    build(key: string): IActionCallback {
        return {
            description: 'Callback that triggers a sound and/or speech action',
            awaitCall: true,
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone<ActionAudio>(this)
                clone.srcEntries = await AssetsHelper.replaceWildcardPaths(clone.srcEntries)
                clone.srcEntries = await TextHelper.replaceTagsInTextArray( // To support audio URLs in input
                    ArrayUtils.getAsType(Utils.ensureArray(clone.srcEntries), clone.srcEntries_use, index), // Need to read entries from config here as cloning drops __type
                    user
                )
                const modules = ModulesSingleton.getInstance()
                if(clone.onTTSQueue) modules.tts.enqueueSoundEffect(clone)
                else modules.audioPlayer.enqueueAudio(clone)
            }
        }
    }
}

