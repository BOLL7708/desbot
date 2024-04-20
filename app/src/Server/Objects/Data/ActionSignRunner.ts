import ActionSign from '../../../Shared/Objects/Data/Action/ActionSign.js'
import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.js'
import Utils from '../../../Shared/Utils/Utils.js'
import ModulesSingleton from '../../../Shared/Singletons/ModulesSingleton.js'
import TwitchHelixHelper from '../../../Shared/Helpers/TwitchHelixHelper.js'
import TextHelper from '../../../Shared/Helpers/TextHelper.js'

export default class ActionSignRunner extends ActionSign {
    build(key: string): IActionCallback {
        return  {
            description: 'Callback that triggers a Sign action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone<ActionSign>(this)
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