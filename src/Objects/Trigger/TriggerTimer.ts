import DataMap from '../DataMap.js'
import Trigger from '../Trigger.js'
import {EEventSource} from '../../Pages/Widget/Enums.js'
import {ActionHandler, Actions} from '../../Pages/Widget/Actions.js'

export class TriggerTimer extends Trigger {
    interval: number = 10
    repetitions: number = 1
    initialDelay: number = 0

    enlist() {
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

    async register(eventKey: string) {
        const actionHandler = new ActionHandler(eventKey)
        const user = await Actions.buildEmptyUserData(EEventSource.Timer, eventKey)
        let handle: number = -1
        let count = 0
        const times = this.repetitions ?? 0
        const interval = this.interval
        const delay = Math.max(0, (this.initialDelay ?? 10) - interval)
        setTimeout(()=>{
            handle = setInterval(()=>{
                actionHandler.call(user)
                count++
                if(times > 0) {
                    if(count >= times) clearInterval(handle)
                }
            }, interval*1000)
        }, delay*1000)
    }
}