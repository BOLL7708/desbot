import ActionURI from '../../../Shared/Objects/Data/Action/ActionURI.js'
import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.js'
import Utils from '../../../Shared/Utils/Utils.js'
import ArrayUtils from '../../../Shared/Utils/ArrayUtils.js'
import TextHelper from '../../../Shared/Helpers/TextHelper.js'
import ExecUtils from '../../../Shared/Utils/ExecUtils.js'
import AbstractActionRunner from './AbstractActionRunner.js'

export default class ActionURIRunner extends AbstractActionRunner {
    getCallback<T>(key: string, instance: T): IActionCallback {
        return  {
            description: 'Callback that triggers a URI action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone(instance as ActionURI)
                const uris = ArrayUtils.getAsType(clone.entries, clone.entries_use, index)
                let totalDelay = 0
                for(const uri of uris) {
                    if(clone.delayMs) {
                        totalDelay += clone.delayMs
                        setTimeout(()=>{ loadURI(uri).then() }, totalDelay)
                    } else {
                        loadURI(uri).then()
                    }
                }
                async function loadURI(uri: string) {
                    uri = await TextHelper.replaceTagsInText(uri.trim(), user)
                    if(uri.startsWith('http://') || uri.startsWith('https://')) {
                        await fetch(uri, {mode: 'no-cors'})
                        console.log(`ActionURI: Loaded URL: ${uri}`)
                    } else {
                        ExecUtils.loadCustomURI(uri)
                        console.log(`ActionURI: Loaded URI: ${uri}`)
                    }
                }
            }
        }
    }
}