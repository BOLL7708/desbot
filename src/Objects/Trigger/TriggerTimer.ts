import DataObjectMap from '../DataObjectMap.js'
import BaseDataObject from '../BaseDataObject.js'

export class TriggerTimer extends BaseDataObject {
    interval: number = 10
    times: number = 1
    delay: number = 0
}

DataObjectMap.addRootInstance(
    new TriggerTimer(),
    'Optional: Have something happen automatically on a timer.',
    {
        interval: 'The time in seconds between each trigger.',
        times: 'The amount of times to trigger the event.',
        delay: 'Delay in seconds before first run.'
    }
)