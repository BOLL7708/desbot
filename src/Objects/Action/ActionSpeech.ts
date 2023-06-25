import Data from '../Data.js'
import DataMap from '../DataMap.js'
import {OptionTTSType} from '../../Options/OptionTTS.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import {SettingUser, SettingUserVoice} from '../Setting/SettingUser.js'

export class ActionSpeech extends Data {
    entries: string[] = []
    entries_use = OptionEntryUsage.First
    skipDictionary: boolean = false
    voiceOfUser: number|SettingUserVoice = 0
    voiceOfUsername: string = ''
    type = OptionTTSType.Announcement

    enlist() {
        DataMap.addRootInstance(
            new ActionSpeech(),
            'Trigger the TTS to read a message.',
            {
                entries: 'The strings of text to read out loud.',
                skipDictionary: 'Set to true to not use the word replacement dictionary.',
                voiceOfUser: 'User the voice of a specific user, leave empty to use the trigger value.',
                voiceOfUsername: 'Voice of the user with this name, if possible.'
            },
            {
                entries: 'string',
                entries_use: OptionEntryUsage.ref(),
                voiceOfUser: SettingUser.refIdKeyLabel(),
                type: OptionTTSType.ref()
            }
        )
    }
}