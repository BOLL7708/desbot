import Data from '../Data.js'
import DataMap from '../DataMap.js'
import {TriggerCheer} from './TriggerCheer.js'

export class TriggerRelay extends Data {
    key: string = ''

    register() {
        DataMap.addRootInstance(
            new TriggerRelay(),
            'A relay message from WSRelay',
            {
                key: 'Listen to incoming relay messages supplying this key.'
            }
        )
    }
}