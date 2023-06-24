import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

// TODO: Retire or replace this feature.
export class ActionCustom extends BaseDataObject {
    codeBlob: string = ''

    register() {
        DataObjectMap.addRootInstance(
            new ActionCustom(),
            'Provide a custom action callback, this can execute any arbitrary code you provide.\n\nOBS: This will likely be removed in the future, or only kept as an experimental feature.',
            {
                codeBlob: 'Should be JavaScript code encoded as a Base64-urlencoded blob.'
            }
        )
    }
}