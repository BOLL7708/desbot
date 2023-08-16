import Trigger from '../Objects/Trigger.js'
import DataBaseHelper from './DataBaseHelper.js'
import {EventDefault} from '../Objects/Event/EventDefault.js'
import {TriggerReward} from '../Objects/Trigger/TriggerReward.js'
import Utils from './Utils.js'
import {TriggerRelay} from '../Objects/Trigger/TriggerRelay.js'

export default class EventHelper {
    static async getAllTriggersOfType<T>(triggerInstance: T&Trigger): Promise<T[]> {
        const allEvents = await DataBaseHelper.loadAll(new EventDefault(), undefined, undefined, true)
        const triggers: T[][] = []
        for(const ev of Object.values(allEvents ?? {})) {
            triggers.push(ev.getTriggers(triggerInstance))
        }
        return triggers.flat()
    }

    static async getAllEventsWithTriggersOfType(triggerInstance: Trigger, matchRewardId?: string): Promise<{ [key:string]: EventDefault }> {
        const allEvents = await DataBaseHelper.loadAll(new EventDefault(), undefined, undefined, true)
        const matchedEvents = Object.entries(allEvents ?? {}).filter(([key, e])=>{
            const rewards = e.getTriggers(triggerInstance)
            const matches = rewards.filter((reward)=>{
                return matchRewardId === undefined
                    || (
                        triggerInstance.__getClass() == TriggerReward.ref()
                        && Utils.ensureStringNotId((triggerInstance as TriggerReward).rewardID) == matchRewardId
                    )
            })
            return matches.length > 0
        })
        return Object.fromEntries(matchedEvents)
    }
}