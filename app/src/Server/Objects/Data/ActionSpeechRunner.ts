import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.js'
import ModulesSingleton from '../../../Shared/Singletons/ModulesSingleton.js'
import DataUtils from '../../../Shared/Objects/Data/DataUtils.js'
import ArrayUtils from '../../../Shared/Utils/ArrayUtils.js'
import DataBaseHelper from '../../../Shared/Helpers/DataBaseHelper.js'
import {SettingTwitchTokens} from '../../../Shared/Objects/Data/Setting/SettingTwitch.js'
import TextHelper from '../../../Shared/Helpers/TextHelper.js'
import TwitchHelixHelper from '../../../Shared/Helpers/TwitchHelixHelper.js'
import ActionSpeech from '../../../Shared/Objects/Data/Action/ActionSpeech.js'
import AbstractActionRunner from './AbstractActionRunner.js'
import Utils from '../../../Shared/Utils/Utils.js'

export default class ActionSpeechRunner extends AbstractActionRunner {
    getCallback<T>(key: string, instance: T): IActionCallback {
        return {
            description: 'Callback that triggers something spoken with TTS.',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone(instance as ActionSpeech)
                console.log('tts debug, entry preset', clone.entryPreset)
                const modules = ModulesSingleton.getInstance()

                let entries: string[] = []
                if(clone.entryPreset) {
                    const entryPreset = DataUtils.ensureData(clone.entryPreset)
                    entries = entryPreset && entryPreset.collection.length > 0
                        ? ArrayUtils.getAsType(entryPreset.collection, clone.entryPreset_use, index)
                        : ArrayUtils.getAsType(clone.entries, clone.entries_use, index) // Should be redundant, only used if someone forgot to remove an empty preset
                } else {
                    entries = ArrayUtils.getAsType(clone.entries, clone.entries_use, index)
                }
                const chatbotTokens = await DataBaseHelper.load(new SettingTwitchTokens(), 'Chatbot')

                const userName = await TextHelper.replaceTagsInText(clone.voiceOfUser_orUsername, user)
                const voiceOfUserTwitchId = parseInt(DataUtils.ensureKey(clone.voiceOfUser))
                const voiceOfNameTwitchId = parseInt((await TwitchHelixHelper.getUserByLogin(userName))?.id ?? '')
                const voiceUserId = !isNaN(voiceOfUserTwitchId)
                    ? voiceOfUserTwitchId
                    : !isNaN(voiceOfNameTwitchId)
                        ? voiceOfNameTwitchId
                        : chatbotTokens?.userId ?? 0
                console.log('Voice of user', [clone.voiceOfUser, DataUtils.ensureKey(clone.voiceOfUser), clone.voiceOfUser_orUsername, userName, voiceUserId])
                for(const ttsStr of entries) {
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
}