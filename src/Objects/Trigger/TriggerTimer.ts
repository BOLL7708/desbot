import DataMap from '../DataMap.js'
import Data from '../Data.js'

export class TriggerTimer extends Data {
    interval: number = 10
    repetitions: number = 1
    initialDelay: number = 0

    register() {
        DataMap.addRootInstance(
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