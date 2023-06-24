import DataObjectMap from '../DataObjectMap.js'
import BaseDataObject from '../BaseDataObject.js'
import {EnumEventBehavior} from '../../Enums/EventBehavior.js'

export class EventDefault extends BaseDataObject {
    options: EventOptions = new EventOptions()
    triggers: (number|BaseDataObject)[] = []
    actions: EventActionContainer[] = []

    register() {
        DataObjectMap.addRootInstance(new EventDefault(),
            'The event that contains triggers and actions.',
            {
                options: 'Set various options for event behavior.',
                triggers: 'Supply in which ways we should trigger this event.',
                actions: 'Provide which actions to execute when this event is triggered.'
            },
            {
                triggers: BaseDataObject.genericRef('Trigger'),
                actions: EventActionContainer.ref()
            }
        )
    }
}

export class EventOptions extends BaseDataObject {
    behavior = EnumEventBehavior.All
    accumulationGoal: number = 0
    multiTierTimeout: number = 0
    multiTierMaxLevel: number = 0
    multiTierDoResetActions: boolean = false
    multiTierDisableWhenMaxed: boolean = false
    resetIncrementOnCommand: boolean = false
    resetAccumulationOnCommand: boolean = false // TODO: Add capability to refund accumulations later.
    rewardIgnoreUpdateCommand: boolean = false
    rewardIgnoreClearRedemptionsCommand: boolean = false
    rewardIgnoreAutomaticDiscordPosting: boolean = false
    rewardMergeUpdateConfigWithFirst: boolean = false
    specificIndex: number = 0
    relayCanTrigger: boolean = true

    register() {
        DataObjectMap.addSubInstance(new EventOptions(),
            {
                behavior: 'Set this to add special behavior to this event, usually affected by reward redemptions.',
                accumulationGoal: 'The goal to reach if behavior is set to accumulating.',
                multiTierTimeout: 'The duration in seconds before we reset the multi-tier level unless it is triggered again.',
                multiTierMaxLevel: 'The maximum level we can reach with the multi-tier behavior. If this is not provided we will use the count of `triggers.reward`.',
                multiTierDoResetActions: 'Also perform actions when resetting this multi-tier event.\n\nThe level after `multiTierMaxLevel` or the level matching the count of `triggers.reward` plus one will be used.',
                multiTierDisableWhenMaxed: 'Will only allow the last level to be redeemed once before resetting again.',
                resetIncrementOnCommand: 'Will reset an incrementing reward when the reset command is run, resetting the index to 0.',
                resetAccumulationOnCommand: 'Will reset an accumulating reward when the reset command is run, resetting the index to 0.',
                rewardIgnoreUpdateCommand: 'A list of rewards that will only be created, not updated using `!update`.\n\nUsually references from: `Keys.*`, and it\'s recommended to put the channel trophy reward in here if you use it.',
                rewardIgnoreClearRedemptionsCommand: 'Will avoid refunding the redemption when the clear redemptions command is used.',
                rewardIgnoreAutomaticDiscordPosting: 'Ignore the Discord webhook for this reward even if it exists. (might be used for something else)',
                rewardMergeUpdateConfigWithFirst: 'Merge the current reward config onto the first default config in the array.',
                specificIndex: 'Provide an index to use when not using a specific event behavior. This can be overridden at runtime, and it will be respected.',
                relayCanTrigger: 'If this event can be triggered by messages from WSRelay.'
            },
            {
                behavior: EnumEventBehavior.ref()
            }
        )
    }
}
export class EventActionContainer extends BaseDataObject {
    delayMs: number = 0
    delayMs_orTimeMs: number = 0
    entries: (number|BaseDataObject)[] = []

    register() {
        DataObjectMap.addSubInstance(new EventActionContainer(),
            {
                delayMs: 'Set delay to execute this batch a certain amount of time after the previous batch, or set time to execute it at an absolute point in time.',
                entries: 'The actions that will run.'
            },
            {
                entries: BaseDataObject.genericRef('Action')
            }
        )
    }
}
