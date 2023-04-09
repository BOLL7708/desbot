import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'
import {EnumTTSType} from '../../Enums/TTS.js'
import {EnumEntryUsage} from '../../Enums/EntryType.js'
import {SettingUserVoice} from '../Setting/User.js'

export class ActionSpeech extends BaseDataObject {
    entries: string[] = []
    entriesType = EnumEntryUsage.First
    skipDictionary: boolean = false
    voiceOfUser: number|SettingUserVoice = 0
    type = EnumTTSType.Announcement
}

DataObjectMap.addRootInstance(
    new ActionSpeech(),
    'Trigger the TTS to read a message.',
    {
        entries: 'The strings of text to read out loud.',
        skipDictionary: 'Set to true to not use the word replacement dictionary.',
        voiceOfUser: 'User the voice of a specific user, leave empty to use the trigger value.'
    },
    {
        entries: 'string',
        entriesType: EnumEntryUsage.ref(),
        voiceOfUser: SettingUserVoice.refId(),
        type: EnumTTSType.ref()
    }
)