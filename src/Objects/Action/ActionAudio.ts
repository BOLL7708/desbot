import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'
import {EnumEntryUsage} from '../../Enums/EntryType.js'

export class ActionAudio extends BaseDataObject {
    srcEntries: string[] = []
    srcEntries_use = EnumEntryUsage.First
    volume: number = 1.0
    nonce: string = ''
    repeat: number = 1
    channel: number = 0
}

DataObjectMap.addRootInstance(
    new ActionAudio(),
    'Trigger audio clips.',
    {
        srcEntries: 'The web URL, local URL or data URL of one or more audio files.',
        volume: 'The volume of the audio, the valid range is 0.0 to 1.0.',
        nonce: 'A unique value that is provided to the callback for audio finished playing.\n\nWill be overwritten for automatic rewards, and is used for some functionality in the fixed rewards.',
        repeat: 'Repeat the playback of this audio this many times.',
        channel: 'Channel to play on, it is a separate instance of the audio player.'
    }, {
        srcEntries: 'string|file',
        srcEntries_use: EnumEntryUsage.ref()
    }
)