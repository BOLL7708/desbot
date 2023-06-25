import Data from '../Data.js'
import DataMap from '../DataMap.js'

export class TriggerCheer extends Data {
    amount: number = 1

    register() {
        DataMap.addRootInstance(
            new TriggerCheer(),
            'A channel cheer',
            {
                amount: 'If a viewer cheers this specific bit amount it will trigger this event.'
            }
        )
    }
}