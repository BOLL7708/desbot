import ActionLabel from '../../../Shared/Objects/Data/Action/ActionLabel.js'
import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.js'
import Utils from '../../../Shared/Utils/Utils.js'
import ArrayUtils from '../../../Shared/Utils/ArrayUtils.js'
import DataFileUtils from '../../../Shared/Utils/DataFileUtils.js'
import TextHelper from '../../../Shared/Helpers/TextHelper.js'
import AbstractActionRunner from './AbstractActionRunner.js'

export default class ActionLabelRunner extends AbstractActionRunner {
    getCallback<T>(key: string, instance: T): IActionCallback {
        return  {
            description: 'Callback that triggers a Label action',
            call: async (user: IActionUser, nonce: string, index?: number) => {
                const clone = Utils.clone(instance as ActionLabel)
                for(const text of ArrayUtils.getAsType(clone.textEntries, clone.textEntries_use)) {
                    if(clone.append) {
                        await DataFileUtils.appendText(clone.fileName, await TextHelper.replaceTagsInText(text, user))
                    } else {
                        await DataFileUtils.writeText(clone.fileName, await TextHelper.replaceTagsInText(text, user))
                    }
                }
            }
        }
    }
}