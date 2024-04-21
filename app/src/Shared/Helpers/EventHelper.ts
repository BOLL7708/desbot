import AbstractTrigger from '../Objects/Data/Trigger/AbstractTrigger.js'
import DataUtils from '../Objects/Data/DataUtils.js'
import TriggerReward from '../Objects/Data/Trigger/TriggerReward.js'
import DataBaseHelper from './DataBaseHelper.js'
import {IDictionary} from '../Interfaces/igeneral.js'
import EventDefault from '../Objects/Data/Event/EventDefault.js'

export default class EventHelper {
    static async getAllTriggersOfType<T>(triggerInstance: T&AbstractTrigger): Promise<(T&AbstractTrigger)[]> {
        const allEvents = DataUtils.getKeyDataDictionary(await DataBaseHelper.loadAll(new EventDefault()) ?? {})
        const triggers: (T&AbstractTrigger)[] = []
        for(const ev of Object.values(allEvents)) {
            const ts = ev.getTriggers(triggerInstance)
            triggers.push(...ts)
        }
        return triggers
    }

    static async getAllEventsWithTriggersOfType(triggerInstance: AbstractTrigger, matchRewardId?: string): Promise<IDictionary<EventDefault>> {
        const allEvents = DataUtils.getKeyDataDictionary(await DataBaseHelper.loadAll(new EventDefault()) ?? {})
        const matchedEvents = Object.entries(allEvents)
            .filter(([key, e])=>{
            const rewards = e?.getTriggers(triggerInstance) ?? []
            const matches = rewards.filter((reward)=>{
                return matchRewardId === undefined
                    || (
                        triggerInstance.__getClass() == TriggerReward.ref.build()
                        && DataUtils.ensureKey((triggerInstance as TriggerReward).rewardID) == matchRewardId
                    )
            })
            return matches.length > 0
        })
        return Object.fromEntries(matchedEvents)
    }
}