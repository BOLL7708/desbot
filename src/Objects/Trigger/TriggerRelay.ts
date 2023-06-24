import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'
import {TriggerCheer} from './TriggerCheer.js'

export class TriggerRelay extends BaseDataObject {
    key: string = ''

    register() {
        DataObjectMap.addRootInstance(
            new TriggerRelay(),
            'A relay message from WSRelay',
            {
                key: 'Listen to incoming relay messages supplying this key.'
            }
        )
    }
}