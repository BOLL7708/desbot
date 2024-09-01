import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.js'
import Utils from '../../../Shared/Utils/Utils.js'
import AssetsHelper from '../../../Shared/Helpers/AssetsHelper.js'
import TextHelper from '../../../Shared/Helpers/TextHelper.js'
import ArrayUtils from '../../../Shared/Utils/ArrayUtils.js'
import ModulesSingleton from '../../../Shared/Singletons/ModulesSingleton.js'
import AbstractActionRunner from './AbstractActionRunner.js'
import ActionAudio from '../../../Shared/Objects/Data/Action/ActionAudio.js'

export default class ActionAudioRunner extends AbstractActionRunner {
    getCallback<T>(key: string, instance: T): IActionCallback {
        return {
            description: 'Callback that triggers a sound and/or speech action',
            awaitCall: true,
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone(instance as ActionAudio)
                clone.srcEntries = await AssetsHelper.preparePathsForUse(clone.srcEntries)
                clone.srcEntries = await TextHelper.replaceTagsInTextArray( // To support audio URLs in input
                    ArrayUtils.getAsType(Utils.ensureArray(clone.srcEntries), clone.srcEntries_use, index), // Need to read entries from config here as cloning drops __type
                    user
                )
                const modules = ModulesSingleton.getInstance()
                if(clone.channel_orOnSpeechChannel) modules.tts.enqueueSoundEffect(clone)
                else modules.audioPlayer.enqueueAudio(clone)
            }
        }
    }
}