import Trigger from '../Trigger.js'
import DataMap from '../DataMap.js'
import {ActionHandler, Actions} from '../../../Client/Pages/Widget/Actions.js'
import {EEventSource} from '../../../Client/Pages/Widget/Enums.js'

export class TriggerTimer extends Trigger {
    interval: number = 10
    repetitions: number = 0
    initialDelay: number = 0
    adjustIntervalEachTime: number = 0

    enlist() {
        DataMap.addRootInstance({
            instance: new TriggerTimer(),
            tag: '⏰',
            description: 'Optional: Have something happen automatically on a timer.',
            documentation: {
                interval: 'The time in seconds between each trigger.',
                repetitions: 'The amount of times to trigger the event, zero or a negative value will repeat forever.',
                initialDelay: 'Delay in seconds before first run.',
                adjustIntervalEachTime: 'Increase or decrease the interval by this number of seconds each trigger.'
            }
        })
    }

    async register(eventKey: string) {
        const actionHandler = new ActionHandler(eventKey)
        const user = await Actions.buildEmptyUserData(EEventSource.Timer, eventKey)
        let handle: number = -1
        let count = 0
        const times = this.repetitions ?? 0
        let interval = this.interval
        const delay = Math.max(0, (this.initialDelay ?? 10) - interval)
        setTimeout(()=>{
            handle = setInterval(()=>{
                actionHandler.call(user)
                count++
                interval += this.adjustIntervalEachTime
                if(times > 0) {
                    if(count >= times) clearInterval(handle)
                }
            }, Math.max(0, interval)*1000)
        }, delay*1000)
    }
}