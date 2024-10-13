import {IActionCallback, IActionUser} from '../../../lib/index.mts'
import {ActionURI} from '../../../lib/index.mts'
import TextHelper from '../../Helpers/TextHelper.mts'
import ArrayUtils from '../../Utils/ArrayUtils.mts'
import ExecUtils from '../../Utils/ExecUtils.mts'
import Utils from '../../Utils/Utils.mts'

// deno-lint-ignore require-await
ActionURI.prototype.build = async function <T>(key: string, instance: T): Promise<IActionCallback> {
   return {
      description: 'Callback that triggers a URI action',
      call: async (user: IActionUser, nonce: string, index?: number) => {
         const clone = Utils.clone(instance as ActionURI)
         const uris = ArrayUtils.getAsType(clone.entries, clone.entries_use, index)
         let totalDelay = 0
         for (const uri of uris) {
            if (clone.delayMs) {
               totalDelay += clone.delayMs
               setTimeout(() => {
                  loadURI(uri).then()
               }, totalDelay)
            } else {
               loadURI(uri).then()
            }
         }

         async function loadURI(uri: string) {
            uri = await TextHelper.replaceTagsInText(uri.trim(), user)
            if (uri.startsWith('http://') || uri.startsWith('https://')) {
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