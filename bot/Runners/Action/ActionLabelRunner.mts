import ActionLabel from '../../../Shared/Objects/Data/Action/ActionLabel.mts'
import {IActionCallback, IActionUser} from '../../../Shared/Objects/Data/Action/AbstractAction.mts'
import Utils from '../../../Shared/Utils/Utils.mts'
import ArrayUtils from '../../../Shared/Utils/ArrayUtils.mts'
import DataFileUtils from '../../../Shared/Utils/DataFileUtils.mts'
import TextHelper from '../../../Shared/Helpers/TextHelper.mts'
import AbstractActionRunner from './AbstractActionRunner.mts'

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