import {AbstractTrigger} from '../../lib/index.mts'
import {DataUtils} from '../../lib/index.mts'
import {TriggerReward} from '../../lib/index.mts'
import DataBaseHelper from './DataBaseHelper.mts'
import {IDictionary} from '../Interfaces/igeneral.mts'
import {EventDefault} from '../../lib/index.mts'

export default class EventHelper {
    static async getAllTriggersOfType<T>(triggerInstance: T&AbstractTrigger): Promise<(T&AbstractTrigger)[]> {
        const allEvents = DataUtils.getKeyDataDictionary(await DataBaseHelper.loadAll<EventDefault>(new EventDefault()) ?? {})
        const triggers: (T&AbstractTrigger)[] = []
        for(const ev of Object.values(allEvents)) {
            const ts = ev.getTriggers(triggerInstance)
            triggers.push(...ts)
        }
        return triggers
    }

    static async getAllEventsWithTriggersOfType(triggerInstance: AbstractTrigger, matchRewardId?: string): Promise<IDictionary<EventDefault>> {
        const allEvents = DataUtils.getKeyDataDictionary(await DataBaseHelper.loadAll<EventDefault>(new EventDefault()) ?? {})
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