import DataMap from '../DataMap.js'
import Data, {DataEntries} from '../Data.js'
import {OptionEventBehavior} from '../../Options/OptionEventBehavior.js'
import Trigger from '../Trigger.js'
import Action from '../Action.js'
import {OptionEventRun} from '../../Options/OptionEventRun.js'
import OptionEventType from '../../Options/OptionEventType.js'
import {DataUtils} from '../DataUtils.js'
import {IDataBaseItem} from '../../Classes/DataBaseHelper.js'

export class EventDefault extends Data {
    type: number = OptionEventType.Uncategorized
    options: EventOptions = new EventOptions()
    triggers: number[]|DataEntries<Trigger> = []
    actions: EventActionContainer[] = []

    enlist() {
        DataMap.addRootInstance(new EventDefault(),
            'The event that contains triggers and actions.',
            {
                type: 'The type of this event.',
                options: 'Set various options for event behavior.',
                triggers: 'Supply in which ways we should trigger this event.',
                actions: 'Provide which actions to execute when this event is triggered.'
            },
            {
                type: OptionEventType.ref,
                triggers: Data.genericRef('Trigger').build(),
                actions: EventActionContainer.ref.build()
            }
        )
    }

    /**
     * @param instance
     */
    getTriggers<T>(instance: T&Trigger): T[] {
        const potentialTriggers = DataUtils.ensureDataArray(this.triggers)
        return potentialTriggers.filter(trigger => trigger.__getClass() == instance.__getClass()) as T[]
    }

    async getTriggersWithKeys<T>(instance: T&Trigger): Promise<IDataBaseItem<T>[]> {
        const potentialTriggers = DataUtils.ensureItemArray(this.triggers)?.dataArray ?? []
        const result = potentialTriggers.filter(
            (item) => {return item.class == instance.__getClass()}
        )
        return result as IDataBaseItem<T>[]
    }
}

export class EventOptions extends Data {
    relayCanTrigger: boolean = true
    specificIndex: number = 0
    behavior = OptionEventBehavior.All
    behaviorOptions: EventBehaviorOptions = new EventBehaviorOptions()
    rewardOptions: EventRewardOptions = new EventRewardOptions()

    enlist() {
        DataMap.addSubInstance(new EventOptions(),
            {
                relayCanTrigger: 'If this event can be triggered by messages from WSRelay.',
                specificIndex: 'Provide an index to use when not using a specific event behavior. This can be overridden at runtime, and it will be respected.',
                behavior: 'Set this to add special behavior to this event, usually affected by reward redemptions.\nThis will change how the actions below are used, specific indices will be used for various things.',
                behaviorOptions: 'Options related to the behavior of this event.',
                rewardOptions: 'Options related to the reward triggers of this event.'
            },
            {
                behavior: OptionEventBehavior.ref
            }
        )
    }
}
export class EventActionContainer extends Data {
    run = OptionEventRun.immediately
    run_ms: number = 0
    entries: number[]|DataEntries<Action> = []

    enlist() {
        DataMap.addSubInstance(new EventActionContainer(),
            {
                run: 'Choose when to run this set.',
                entries: 'The actions that will run.'
            },
            {
                run: OptionEventRun.ref,
                entries: Action.genericRef('Action').build()
            }
        )
    }
}
export class EventBehaviorOptions extends Data {
    accumulationGoal: number = 0
    accumulationResetOnCommand: boolean = true // TODO: Add capability to refund accumulations later.
    incrementationLoop: boolean = false
    incrementationResetOnCommand: boolean = true
    multiTierTimeout: number = 0
    multiTierMaxLevel: number = 0
    multiTierResetOnTrigger: boolean = false
    multiTierResetOnTimeout: boolean = false
    multiTierDisableAfterMaxLevel: boolean = false

    enlist() {
        DataMap.addSubInstance(new EventBehaviorOptions(),
            {
                accumulationGoal: 'The goal to reach if behavior is set to accumulating.',
                accumulationResetOnCommand: 'Will reset an accumulating reward when the reset command is run, resetting the index to 0.',
                incrementationLoop: 'Will loop an incrementing reward when the max index is reached, resetting the index to 0.',
                incrementationResetOnCommand: 'Will reset an incrementing reward when the reset command is run, resetting the index to 0.',
                multiTierTimeout: 'The duration in seconds before we reset the multi-tier level unless it is triggered again.',
                multiTierMaxLevel: 'The maximum level we can reach with the multi-tier behavior.',
                multiTierResetOnTrigger: 'Perform reset actions before default actions when triggering this multi-tier event.\n\nWill use the action set at max level + 1.',
                multiTierResetOnTimeout: 'Perform reset actions when resetting this multi-tier event.\n\nWill use action set at max level + 2.',
                multiTierDisableAfterMaxLevel: 'Will only allow the last level to be redeemed once before resetting again.',
            })
    }
}

export class EventRewardOptions extends Data {
    ignoreUpdateCommand: boolean = false
    ignoreClearRedemptionsCommand: boolean = false
    ignoreAutomaticDiscordPosting: boolean = false

    enlist() {
        DataMap.addSubInstance(new EventRewardOptions(),
            {
                ignoreUpdateCommand: 'A list of rewards that will only be created, not updated using `!update`.\n\nUsually references from: `Keys.*`, and it\'s recommended to put the channel trophy reward in here if you use it.',
                ignoreClearRedemptionsCommand: 'Will avoid refunding the redemption when the clear redemptions command is used.',
                ignoreAutomaticDiscordPosting: 'Ignore the Discord webhook for this reward even if it exists. (might be used for something else)',
            })
    }
}