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
    options = new EventOptions() // TODO: Put internal properties in the base root instead, as well as the reward options object.
    behavior: OptionEventBehavior = OptionEventBehavior.All
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
                options: 'Set various options for event behavior.',
                behavior: 'Set this to add a special behavior to this event, affecting how consecutive triggering is treated.\nThis will change how action set are run and which reward presets are applied.',
                incrementingOptions: 'Options related to the incrementing behavior.',
                accumulatingOptions: 'Options related to the accumulating behavior.',
                multiTierOptions: 'Options related to the multi-tier behavior.',
                triggers: 'Supply in which ways we should trigger this event.',
                actions: 'Provide which actions to execute when this event is triggered.'
            },
            instructions: {
                incrementingOptions: 'Incrementing means the action set and reward preset used will be incremented every time the event is triggered.' +
                    '<ol>' +
                    '<li>It will continue to count up for as long as there are more entries in either actions or reward presets, then repeat the last one in perpetuity unless set to loop.</li>' +
                    '<li>To prevent infinite repeats, add an empty item at the end of the actions, or for rewards a preset that is disabled where it should stop updating which will hide the reward.</li>' +
                    '</ol>',
                accumulatingOptions: 'Accumulating means it is affected by a counter that is retained and that will keep counting up, usually added to by channel points but can also be used by non-reward triggers with a value set here. This is an analog for the community challenge on Twitch. Different sets of actions and reward presets will be used for different things, see below.' +
                    '<ol>' +
                    '<li>The first entry will be used as the initial state, this is what happens the first time it is triggered, or represents the first preset a reward would get.</li>' +
                    '<li>The second to last entry, or first if only one is available, will be used as the progress step, that is what will happen for all triggers except first and last.</li>' +
                    '<li>The last entry will be used when the goal has been met, as the last thing that can be triggered, then this event will be inert until reset.</li>' +
                    '</ol>' +
                    'Associated text tags are: <code>%eventKey</code>, <code>%eventCost</code>, <code>%eventCount</code>, <code>%eventCountPercent</code>, <code>%eventGoal</code> and <code>%eventGoalShort</code>.',
                multiTierOptions: 'This behavior will level up temporarily with a timeout that will reset it. It uses reward presets and action sets differently.' +
                    '<br/>Reward presets: <ol>' +
                    '<li>First one is used as a base, and is what is reset to after a timeout.</li>' +
                    '<li>The rest are used in turn as the level increases.</li>' +
                    '</ol>' +
                    'Action sets: <ol>' +
                    '<li>The first set is used for the soft reset, reset on trigger, it runs before all other levels, leave it empty if you do not need it.</li>' +
                    '<li>The second set is used for the hard reset, this is when the timeout happens and the level is reset, this can also be left empty if not needed.</li>' +
                    '<li>The rest are used in turn as the level increases.</li>'
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
    maxValue: number = 0
    resetOnCommand: boolean = true

    enlist() {
        DataMap.addSubInstance({
            instance: new EventIncrementingOptions(),
            documentation: {
                loop: 'Will loop an incrementing reward when the max index is reached, resetting the index to 0.',
                maxValue: 'Will never increment past this value, if set to 0 or lower it will keep incrementing forever.',
                resetOnCommand: 'Will reset an incrementing reward when the reset command is run, resetting the index to 0.',
            }
        })
    }
}

export class EventAccumulatingOptions extends Data {
    goal: number = 0
    nonRewardIncrease: number = 1
    resetOnCommand: boolean = true // TODO: Add capability to refund accumulations later.

    enlist() {
        DataMap.addSubInstance({
            instance: new EventAccumulatingOptions(),
            documentation: {
                goal: 'The goal to reach if behavior is set to accumulating.',
                nonRewardIncrease: 'The amount to increase the accumulation by when not using a reward trigger.',
                resetOnCommand: 'Will reset an accumulating reward when the reset command is run, resetting the index to 0.',
            }
        })
    }
}

export class EventMultiTierOptions extends Data {
    timeout: number = 30
    maxLevel: number = 0
    resetOnTrigger: boolean = true
    resetOnTimeout: boolean = true
    disableAfterMaxLevel: boolean = true
    disableAfterMaxLevel_andHideReward: boolean = false
    disableAfterMaxLevel_andPauseReward: boolean = false

    enlist() {
        DataMap.addSubInstance({
            instance: new EventMultiTierOptions(),
            documentation: {
                timeout: 'The duration in seconds before we reset the event, unless it is triggered again, will clamp to a minimum of 1.',
                maxLevel: 'The maximum level that this event can reach, set to 0 or lower to disable the limit.',
                resetOnTrigger: 'Run the soft reset actions, first set, before default actions when triggering this multi-tier event..',
                resetOnTimeout: 'Run the hard reset actions, second set, when the timeout expires.',
                disableAfterMaxLevel: 'Will only allow the final level to run once, then the event is disabled, only works when a max level is set.'
            }
        })
    }
}