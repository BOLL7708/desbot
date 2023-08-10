import DataMap from '../DataMap.js'
import Data from '../Data.js'
import {OptionEventBehavior} from '../../Options/OptionEventBehavior.js'
import Trigger from '../Trigger.js'
import Action from '../Action.js'
import {OptionEventRun} from '../../Options/OptionEventRun.js'
import Utils from '../../Classes/Utils.js'

export class EventDefault extends Data {
    options: EventOptions = new EventOptions()
    triggers: (number|Trigger)[] = []
    actions: EventActionContainer[] = []

    enlist() {
        DataMap.addRootInstance(new EventDefault(),
            'The event that contains triggers and actions.',
            {
                options: 'Set various options for event behavior.',
                triggers: 'Supply in which ways we should trigger this event.',
                actions: 'Provide which actions to execute when this event is triggered.'
            },
            {
                triggers: Data.genericRef('Trigger'),
                actions: EventActionContainer.ref()
            }
        )
    }

    getTriggers<T>(instance: T&Trigger): T[] {
        const potentialTriggers = Utils.ensureObjectArrayNotId(this.triggers)
        return potentialTriggers.filter(trigger => trigger.__getClass() == instance.__getClass()) as T[]
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
                behavior: 'Set this to add special behavior to this event, usually affected by reward redemptions.',
                behaviorOptions: 'Options related to the behavior of this event.',
                rewardOptions: 'Options related to the reward triggers of this event.'
            },
            {
                behavior: OptionEventBehavior.ref()
            }
        )
    }
}
export class EventActionContainer extends Data {
    run = OptionEventRun.immediately
    run_ms: number = 0
    entries: (number|Action)[] = []

    enlist() {
        DataMap.addSubInstance(new EventActionContainer(),
            {
                run: 'Choose when to run this set.',
                entries: 'The actions that will run.'
            },
            {
                run: OptionEventRun.ref(),
                entries: Action.genericRef('Action')
            }
        )
    }
}
export class EventBehaviorOptions extends Data {
    accumulationGoal: number = 0
    accumulationResetOnCommand: boolean = true // TODO: Add capability to refund accumulations later.
    incrementationResetOnCommand: boolean = true
    multiTierTimeout: number = 0
    multiTierMaxLevel: number = 0
    multiTierDoResetActions: boolean = false
    multiTierDisableWhenMaxed: boolean = false

    enlist() {
        DataMap.addSubInstance(new EventBehaviorOptions(),
            {
                accumulationGoal: 'The goal to reach if behavior is set to accumulating.',
                accumulationResetOnCommand: 'Will reset an accumulating reward when the reset command is run, resetting the index to 0.',
                incrementationResetOnCommand: 'Will reset an incrementing reward when the reset command is run, resetting the index to 0.',
                multiTierTimeout: 'The duration in seconds before we reset the multi-tier level unless it is triggered again.',
                multiTierMaxLevel: 'The maximum level we can reach with the multi-tier behavior. If this is not provided we will use the count of `triggers.reward`.',
                multiTierDoResetActions: 'Also perform actions when resetting this multi-tier event.\n\nThe level after `multiTierMaxLevel` or the level matching the count of `triggers.reward` plus one will be used.',
                multiTierDisableWhenMaxed: 'Will only allow the last level to be redeemed once before resetting again.',
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