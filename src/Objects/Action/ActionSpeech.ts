import DataMap from '../DataMap.js'
import {OptionTTSType} from '../../Options/OptionTTS.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import {SettingUser} from '../Setting/SettingUser.js'
import Action, {IActionCallback, IActionUser} from '../Action.js'
import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import {SettingTwitchTokens} from '../Setting/SettingTwitch.js'
import TwitchHelixHelper from '../../Classes/TwitchHelixHelper.js'
import ArrayUtils from '../../Classes/ArrayUtils.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
import TextHelper from '../../Classes/TextHelper.js'
import {PresetText} from '../Preset/PresetText.js'
import {DataUtils} from '../DataUtils.js'
import {DataEntries} from '../Data.js'

export class ActionSpeech extends Action {
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

    build(key: string): IActionCallback {
        return {
            tag: '🗣',
            description: 'Callback that triggers something spoken with TTS.',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                console.log('tts debug, entry preset', this.entryPreset)
                const modules = ModulesSingleton.getInstance()

                let entries: string[] = []
                if(this.entryPreset) {
                    const entryPreset = DataUtils.ensureData(this.entryPreset)
                    entries = entryPreset && entryPreset.collection.length > 0
                        ? ArrayUtils.getAsType(entryPreset.collection, this.entryPreset_use, index)
                        : ArrayUtils.getAsType(this.entries, this.entries_use, index) // Should be redundant, only used if someone forgot to remove an empty preset
                } else {
                    entries = ArrayUtils.getAsType(this.entries, this.entries_use, index)
                }
                const chatbotTokens = await DataBaseHelper.load(new SettingTwitchTokens(), 'Chatbot')

                const userName = await TextHelper.replaceTagsInText(this.voiceOfUser_orUsername, user)
                const voiceOfUserTwitchId = parseInt(DataUtils.ensureKey(this.voiceOfUser))
                const voiceOfNameTwitchId = parseInt((await TwitchHelixHelper.getUserByLogin(userName))?.id ?? '')
                const voiceUserId = !isNaN(voiceOfUserTwitchId)
                    ? voiceOfUserTwitchId
                    : !isNaN(voiceOfNameTwitchId)
                        ? voiceOfNameTwitchId
                        : chatbotTokens?.userId ?? 0
                console.log('Voice of user', [this.voiceOfUser, DataUtils.ensureKey(this.voiceOfUser), this.voiceOfUser_orUsername, userName, voiceUserId])
                for(const ttsStr of entries) {
                    await modules.tts.enqueueSpeakSentence(
                        await TextHelper.replaceTagsInText(ttsStr, user),
                        voiceUserId,
                        this.type,
                        nonce, // Used for screenshots but could be used for other things too.
                        undefined,
                        undefined,
                        this.skipDictionary
                    )
                }
            }
        }
    }
}