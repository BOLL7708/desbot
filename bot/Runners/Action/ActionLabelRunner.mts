import {IActionCallback, IActionUser} from '../../../lib/index.mts'
import {ActionLabel} from '../../../lib/index.mts'
import TextHelper from '../../Helpers/TextHelper.mts'
import ArrayUtils from '../../Utils/ArrayUtils.mts'
import DataFileUtils from '../../Utils/DataFileUtils.mts'
import Utils from '../../Utils/Utils.mts'

// deno-lint-ignore require-await
ActionLabel.prototype.build = async function <T>(key: string, instance: T): Promise<IActionCallback> {
   return {
      description: 'Callback that triggers a Label action',
      call: async (user: IActionUser, nonce: string, index?: number) => {
         const clone = Utils.clone(instance as ActionLabel)
         for (const text of ArrayUtils.getAsType(clone.textEntries, clone.textEntries_use)) {
            if (clone.append) {
               await DataFileUtils.appendText(clone.fileName, await TextHelper.replaceTagsInText(text, user))
            } else {
               await DataFileUtils.writeText(clone.fileName, await TextHelper.replaceTagsInText(text, user))
            }
         }
      }
   }
}