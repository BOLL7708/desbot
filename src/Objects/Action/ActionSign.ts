import DataMap from '../DataMap.js'
import Action, {IActionCallback, IActionUser} from '../Action.js'
import ModulesSingleton from '../../Singletons/ModulesSingleton.js'
import TwitchHelixHelper from '../../Classes/TwitchHelixHelper.js'
import Utils from '../../Classes/Utils.js'
import TextHelper from '../../Classes/TextHelper.js'
import {DataUtils} from '../DataUtils.js'

export class ActionSign extends Action {
    title: string = ''
    imageSrc: string = ''
    subtitle: string = ''
    durationMs: number = 5000

    enlist() {
        DataMap.addRootInstance(
            new ActionSign(),
            'Show a pop-in message in the browser source for the widget.',
            {
                title: 'The title above the image, takes tags.',
                imageSrc: 'The image to display in the Sign pop-in, as web URL, local URL or data URL.\n\nIf left empty the avatar image will be used instead, if available.',
                subtitle: 'The subtitle beneath the image, takes tags.',
                durationMs: 'The duration for the Sign to be visible for, in milliseconds.'
            },
            {
                imageSrc: DataUtils.getStringFileImageRef()
            }
        )
    }

    build(key: string): IActionCallback {
        return  {
            tag: '🚦',
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