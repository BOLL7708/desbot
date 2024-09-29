import ActionURI from '../../../Shared/Objects/Data/Action/ActionURI.mts'
import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.mts'
import Utils from '../../../Shared/Utils/Utils.mts'
import ArrayUtils from '../../../Shared/Utils/ArrayUtils.mts'
import TextHelper from '../../../Shared/Helpers/TextHelper.mts'
import ExecUtils from '../../../Shared/Utils/ExecUtils.mts'
import AbstractActionRunner from './AbstractActionRunner.mts'

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