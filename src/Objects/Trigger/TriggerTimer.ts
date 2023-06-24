import DataObjectMap from '../DataObjectMap.js'
import BaseDataObject from '../BaseDataObject.js'

export class TriggerTimer extends BaseDataObject {
    interval: number = 10
    repetitions: number = 1
    initialDelay: number = 0

    register() {
        DataObjectMap.addRootInstance(
            new TriggerTimer(),
            'Optional: Have something happen automatically on a timer.',
            {
                interval: 'The time in seconds between each trigger.',
                repetitions: 'The amount of times to trigger the event.',
                initialDelay: 'Delay in seconds before first run.'
            }
        )
    }
}