import ActionSign from '../../../Shared/Objects/Data/Action/ActionSign.mts'
import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.mts'
import Utils from '../../../Shared/Utils/Utils.mts'
import ModulesSingleton from '../../../Shared/Singletons/ModulesSingleton.mts'
import TwitchHelixHelper from '../../../Shared/Helpers/TwitchHelixHelper.mts'
import TextHelper from '../../../Shared/Helpers/TextHelper.mts'
import AbstractActionRunner from './AbstractActionRunner.mts'

export default class ActionSignRunner extends AbstractActionRunner {
    getCallback<T>(key: string, instance: T): IActionCallback {
        return  {
            description: 'Callback that triggers a Sign action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone(instance as ActionSign)
                const modules = ModulesSingleton.getInstance()
                TwitchHelixHelper.getUserById(user.id).then(async userData => {
                    const modules = ModulesSingleton.getInstance()
                    clone.title = await TextHelper.replaceTagsInText(clone.title, user)
                    if(clone.imageSrc.length == 0) clone.imageSrc = userData?.profile_image_url ?? ''
                    clone.imageSrc = await TextHelper.replaceTagsInText(clone.imageSrc, user)
                    clone.subtitle = await TextHelper.replaceTagsInText(clone.subtitle, user)
                    modules.sign.enqueueSign(clone)
                })
            }
        }
    }
}