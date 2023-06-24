import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

export class TriggerCheer extends BaseDataObject {
    amount: number = 1

    register() {
        DataObjectMap.addRootInstance(
            new TriggerCheer(),
            'A channel cheer',
            {
                amount: 'If a viewer cheers this specific bit amount it will trigger this event.'
            }
        )
    }
}