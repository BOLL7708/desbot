import DataMap from '../DataMap.js'
import Data, {DataEntries} from '../Data.js'
import {OptionEventBehavior} from '../../Options/OptionEventBehavior.js'
import Trigger from '../Trigger.js'
import Action from '../Action.js'
import {OptionEventRun} from '../../Options/OptionEventRun.js'
import {DataUtils} from '../DataUtils.js'
import {IDictionary} from '../../Interfaces/igeneral.js'
import {PresetEventCategory} from '../Preset/PresetEventCategory.js'

export class EventDefault extends Data {
    category: number|DataEntries<PresetEventCategory> = 0
    behavior: OptionEventBehavior = OptionEventBehavior.All
    options = new EventOptions()
    incrementingOptions = new EventIncrementingOptions()
    accumulatingOptions = new EventAccumulatingOptions()
    multiTierOptions = new EventMultiTierOptions()
    triggers: number[]|DataEntries<Trigger> = []
    actions: EventActionContainer[] = []

    enlist() {
        DataMap.addRootInstance({
            instance: new EventDefault(),
            description: 'The event that contains triggers and actions.',
            documentation: {
                category: 'The type of this event, this is mostly used to separate out imported default events, so you can leave it as uncategorized.',
                behavior: 'Set this to add special behavior to this event, usually affected by reward redemptions.\nThis will change how the actions below are used, specific indices will be used for various things.',
                options: 'Set various options for event behavior.',
                incrementingOptions: 'Options related to the incrementing behavior.',
                accumulatingOptions: 'Options related to the accumulating behavior.',
                multiTierOptions: 'Options related to the multi-tier behavior.',
                triggers: 'Supply in which ways we should trigger this event.',
                actions: 'Provide which actions to execute when this event is triggered.'
            },
            types: {
                category: PresetEventCategory.ref.id.build(),
                behavior: OptionEventBehavior.ref,
                triggers: Data.genericRef('Trigger').build(),
                actions: EventActionContainer.ref.build()
            },
            visibleForOption: {
                behavior: {
                    incrementingOptions: OptionEventBehavior.Incrementing,
                    accumulatingOptions: OptionEventBehavior.Accumulating,
                    multiTierOptions: OptionEventBehavior.MultiTier
                }
            }
        })
    }

    /**
     * @param instance
     */
    getTriggers<T>(instance: T&Trigger): (T&Trigger)[] {
        const potentialTriggers = DataUtils.ensureDataArray(this.triggers)
        return potentialTriggers.filter(trigger => trigger.__getClass() == instance.__getClass()) as (T&Trigger)[]
    }

    async getTriggersWithKeys<T>(instance: T&Trigger): Promise<IDictionary<T&Trigger>> {
        const potentialTriggers = DataUtils.ensureItemArray(this.triggers)?.dataArray ?? []
        const triggers = potentialTriggers.filter(
            (item) => {return item.class == instance.__getClass()}
        )
        const result: IDictionary<T&Trigger> = {}
        for(const trigger of triggers) {
            result[trigger.key] = trigger.filledData as T&Trigger
        }
        return result
    }
}

export class EventOptions extends Data {
    relayCanTrigger: boolean = true
    specificIndex: number = 0
    rewardOptions: EventRewardOptions = new EventRewardOptions()

    enlist() {
        DataMap.addSubInstance({
            instance: new EventOptions(),
            documentation: {
                relayCanTrigger: 'If this event can be triggered by messages from WSRelay.',
                specificIndex: 'Provide an index to use when not using a specific event behavior. This can be overridden at runtime, and it will be respected.',
                rewardOptions: 'Options related to the reward triggers of this event.'
            }
        })
    }
}
export class EventActionContainer extends Data {
    run = OptionEventRun.immediately
    run_ms: number = 0
    entries: number[]|DataEntries<Action> = []

    enlist() {
        DataMap.addSubInstance({
            instance: new EventActionContainer(),
            documentation: {
                run: 'Choose when to run this set.',
                entries: 'The actions that will run.'
            },
            types: {
                run: OptionEventRun.ref,
                entries: Action.genericRef('Action').build()
            }
        })
    }
}

export class EventRewardOptions extends Data {
    ignoreUpdateCommand: boolean = false
    ignoreClearRedemptionsCommand: boolean = false
    ignoreAutomaticDiscordPosting: boolean = false

    enlist() {
        DataMap.addSubInstance({
            instance: new EventRewardOptions(),
            documentation: {
                ignoreUpdateCommand: 'A list of rewards that will only be created, not updated using `!update`.\n\nUsually references from: `Keys.*`, and it\'s recommended to put the channel trophy reward in here if you use it.',
                ignoreClearRedemptionsCommand: 'Will avoid refunding the redemption when the clear redemptions command is used.',
                ignoreAutomaticDiscordPosting: 'Ignore the Discord webhook for this reward even if it exists. (might be used for something else)',
            }
        })
    }
}

export class EventIncrementingOptions extends Data {
    loop: boolean = false
    resetOnCommand: boolean = true

    enlist() {
        DataMap.addSubInstance({
            instance: new EventIncrementingOptions(),
            documentation: {
                loop: 'Will loop an incrementing reward when the max index is reached, resetting the index to 0.',
                resetOnCommand: 'Will reset an incrementing reward when the reset command is run, resetting the index to 0.',
            }
        })
    }
}

export class EventAccumulatingOptions extends Data {
    goal: number = 0
    resetOnCommand: boolean = true // TODO: Add capability to refund accumulations later.

    enlist() {
        DataMap.addSubInstance({
            instance: new EventAccumulatingOptions(),
            documentation: {
                goal: 'The goal to reach if behavior is set to accumulating.',
                resetOnCommand: 'Will reset an accumulating reward when the reset command is run, resetting the index to 0.',
            }
        })
    }
}

export class EventMultiTierOptions extends Data {
    timeout: number = 0
    maxLevel: number = 0
    resetOnTrigger: boolean = false
    resetOnTimeout: boolean = false
    disableAfterMaxLevel: boolean = false

    enlist() {
        DataMap.addSubInstance({
            instance: new EventMultiTierOptions(),
            documentation: {
                timeout: 'The duration in seconds before we reset the multi-tier level unless it is triggered again.',
                maxLevel: 'The maximum level we can reach with the multi-tier behavior.',
                resetOnTrigger: 'Perform reset actions before default actions when triggering this multi-tier event.\n\nWill use the action set at max level + 1.',
                resetOnTimeout: 'Perform reset actions when resetting this multi-tier event.\n\nWill use action set at max level + 2.',
                disableAfterMaxLevel: 'Will only allow the last level to be redeemed once before resetting again.',
            }
        })
    }
}