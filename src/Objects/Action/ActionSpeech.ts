import DataMap from '../DataMap.js'
import {OptionTTSType} from '../../Options/OptionTTS.js'
import {OptionEntryUsage} from '../../Options/OptionEntryType.js'
import {SettingUser} from '../Setting/SettingUser.js'
import Action, {IActionCallback, IActionUser} from '../Action.js'
import DataBaseHelper from '../../Classes/DataBaseHelper.js'
import {SettingTwitchTokens} from '../Setting/SettingTwitch.js'
import TwitchHelixHelper from '../../Classes/TwitchHelixHelper.js'
import Utils from '../../Classes/Utils.js'
import ArrayUtils from '../../Classes/ArrayUtils.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
import TextHelper from '../../Classes/TextHelper.js'
import {PresetText} from '../Preset/PresetText.js'

export class ActionSpeech extends Action {
    entries: string[] = ['']
    entries_use = OptionEntryUsage.First
    entryPreset: number|PresetText = 0
    entryPreset_use = OptionEntryUsage.OneRandom
    skipDictionary: boolean = false
    voiceOfUser: number|string = 0
    voiceOfUser_orUsername: string = ''
    type = OptionTTSType.Announcement

    enlist() {
        DataMap.addRootInstance(
            new ActionSpeech(),
            'Trigger the TTS to read a message.',
            {
                entries: 'The strings of text to read out loud.',
                entryPreset: 'A preset of text strings to read out loud, this overrides manually added entries.',
                skipDictionary: 'Set to true to not use the word replacement dictionary.',
                voiceOfUser: 'Use the voice of a specific user or username. Leave empty to use the trigger value.'
            },
            {
                entries: 'string',
                entries_use: OptionEntryUsage.ref(),
                entryPreset: PresetText.refId(),
                entryPreset_use: OptionEntryUsage.ref(),
                voiceOfUser: SettingUser.refIdKeyLabel(),
                type: OptionTTSType.ref()
            }
        )
    }

    build(key: string): IActionCallback {
        return {
            tag: '🗣',
            description: 'Callback that triggers something spoken with TTS.',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = await this.__clone(true)
                console.log('tts debug, entry preset original', this.entryPreset, clone.entryPreset)
                const modules = ModulesSingleton.getInstance()

                // TODO: This is not quite working yeah. Seems to be a fault in the data loading and cloning above.
                //  Will hopefully be fixed in the rewrite of all of that... soon!
                // const entryPreset = Utils.ensureObjectNotId(clone.entryPreset)
                // const entries = entryPreset && entryPreset.collection.length > 0
                //     ? ArrayUtils.getAsType(entryPreset.collection, clone.entryPreset_use, index)
                //     : ArrayUtils.getAsType(clone.entries, clone.entries_use, index)
                // console.log('tts debug, entries', entryPreset?.collection, clone.entries, entries)

                const entries = ArrayUtils.getAsType(clone.entries, clone.entries_use, index)
                const chatbotTokens = await DataBaseHelper.load(new SettingTwitchTokens(), 'Chatbot')
                const userName = await TextHelper.replaceTagsInText(clone.voiceOfUser_orUsername, user)
                const voiceUserId = parseInt(
                    Utils.ensureStringNotId(clone.voiceOfUser)
                    ?? (await TwitchHelixHelper.getUserByLogin(userName))?.id
                    ?? ''
                )
                for(const ttsStr of entries) {
                    await modules.tts.enqueueSpeakSentence(
                        await TextHelper.replaceTagsInText(ttsStr, user),
                        isNaN(voiceUserId) ? chatbotTokens?.userId : voiceUserId,
                        clone.type,
                        '', // TODO: Figure out if we can uses nonces again, I'm sure it's needed for something.
                        undefined,
                        undefined,
                        clone.skipDictionary
                    )
                }
            }
        }
    }
}