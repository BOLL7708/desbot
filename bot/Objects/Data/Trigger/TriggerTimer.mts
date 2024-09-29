import AbstractTrigger from './AbstractTrigger.mts'
import DataMap from '../DataMap.mts'
import {ActionHandler, Actions} from '../../../Actions.mts'
import {EEventSource} from '../../../Enums.mts'

export default class TriggerTimer extends AbstractTrigger {
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
        let handle: number|any = -1 // TODO: Transitional node fix
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