import {ActionSpeech, DataUtils, IActionCallback, IActionUser, SettingTwitchTokens} from '../../../lib/index.mts'
import DataBaseHelper from '../../Helpers/DataBaseHelper.mts'
import TextHelper from '../../Helpers/TextHelper.mts'
import TwitchHelixHelper from '../../Helpers/TwitchHelixHelper.mts'
import ModulesSingleton from '../../Singletons/ModulesSingleton.mts'
import ArrayUtils from '../../Utils/ArrayUtils.mts'
import Utils from '../../Utils/Utils.mts'

// deno-lint-ignore require-await
ActionSpeech.prototype.build = async function <T>(key: string, instance: T): Promise<IActionCallback> {
   return {
      description: 'Callback that triggers something spoken with TTS.',
      call: async (user: IActionUser, nonce: string, index?: number) => {
         const clone = Utils.clone(instance as ActionSpeech)
         console.log('tts debug, entry preset', clone.entryPreset)
         const modules = ModulesSingleton.getInstance()

         let entries: string[] = []
         if (clone.entryPreset) {
            const entryPreset = DataUtils.ensureData(clone.entryPreset)
            entries = entryPreset && entryPreset.collection.length > 0
               ? ArrayUtils.getAsType(entryPreset.collection, clone.entryPreset_use, index)
               : ArrayUtils.getAsType(clone.entries, clone.entries_use, index) // Should be redundant, only used if someone forgot to remove an empty preset
         } else {
            entries = ArrayUtils.getAsType(clone.entries, clone.entries_use, index)
         }
         const chatbotTokens = await DataBaseHelper.load<SettingTwitchTokens>(new SettingTwitchTokens(), 'Chatbot')

         const userName = await TextHelper.replaceTagsInText(clone.voiceOfUser_orUsername, user)
         const voiceOfUserTwitchId = parseInt(DataUtils.ensureKey(clone.voiceOfUser))
         const voiceOfNameTwitchId = parseInt((await TwitchHelixHelper.getUserByLogin(userName))?.id ?? '')
         const voiceUserId = !isNaN(voiceOfUserTwitchId)
            ? voiceOfUserTwitchId
            : !isNaN(voiceOfNameTwitchId)
               ? voiceOfNameTwitchId
               : chatbotTokens?.userId ?? 0
         console.log('Voice of user', [clone.voiceOfUser, DataUtils.ensureKey(clone.voiceOfUser), clone.voiceOfUser_orUsername, userName, voiceUserId])
         for (const ttsStr of entries) {
            await modules.tts.enqueueSpeakSentence(
               await TextHelper.replaceTagsInText(ttsStr, user),
               voiceUserId,
               clone.type,
               nonce, // Used for screenshots but could be used for other things too.
               undefined,
               undefined,
               clone.skipDictionary
            )
         }
      }
   }
}