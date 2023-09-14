import Trigger from '../Objects/Trigger.js'
import DataBaseHelper from './DataBaseHelper.js'
import {EventDefault} from '../Objects/Event/EventDefault.js'
import {TriggerReward} from '../Objects/Trigger/TriggerReward.js'
import Utils from './Utils.js'
import {TriggerRelay} from '../Objects/Trigger/TriggerRelay.js'
import {DataUtils} from '../Objects/DataUtils.js'
import {IDictionary} from '../Interfaces/igeneral.js'

export default class EventHelper {
    static async getAllTriggersOfType<T>(triggerInstance: T&Trigger): Promise<(T&Trigger)[]> {
        const allEvents = DataUtils.getKeyDataDictionary(await DataBaseHelper.loadAll(new EventDefault(), undefined, undefined) ?? {})
        const triggers: (T&Trigger)[] = []
        for(const ev of Object.values(allEvents)) {
            const ts = ev.getTriggers(triggerInstance)
            triggers.push(...ts)
        }
        return triggers
    }

    static async getAllEventsWithTriggersOfType(triggerInstance: Trigger, matchRewardId?: string): Promise<IDictionary<EventDefault>> {
        const allEvents = DataUtils.getKeyDataDictionary(await DataBaseHelper.loadAll(new EventDefault(), undefined, undefined) ?? {})
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