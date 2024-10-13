import {OptionEntryUsage} from '../../Options/OptionEntryType.mts'
import {OptionTTSType} from '../../Options/OptionTTS.mts'
import {DataEntries} from '../AbstractData.mts'
import {DataMap} from '../DataMap.mts'
import {PresetText} from '../Preset/PresetText.mts'
import {SettingUser} from '../Setting/SettingUser.mts'
import {AbstractAction} from './AbstractAction.mts'

export class ActionSpeech extends AbstractAction {
    entries: string[] = ['']
    entries_use = OptionEntryUsage.First
    entryPreset: number|DataEntries<PresetText> = 0
    entryPreset_use = OptionEntryUsage.OneRandom
    skipDictionary: boolean = false
    voiceOfUser: number|DataEntries<SettingUser> = 0
    voiceOfUser_orUsername: string = ''
    type = OptionTTSType.Announcement

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionSpeech(),
            tag: '👄',
            description: 'Trigger the TTS to read a message.',
            documentation: {
                entries: 'The strings of text to read out loud.',
                entryPreset: 'A preset of text strings to read out loud, this overrides manually added entries.',
                skipDictionary: 'Set to true to not use the word replacement dictionary.',
                voiceOfUser: 'Use the voice of a specific user or username. Leave empty to use the trigger value.'
            },
            types: {
                entries: 'string',
                entries_use: OptionEntryUsage.ref,
                entryPreset: PresetText.ref.id.build(),
                entryPreset_use: OptionEntryUsage.ref,
                voiceOfUser: SettingUser.ref.id.label.build(),
                type: OptionTTSType.ref
            }
        })
    }
}