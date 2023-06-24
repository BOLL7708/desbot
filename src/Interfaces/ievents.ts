import {TKeys} from '../_data/!keys.js'
import {IActions} from './iactions.js'
import {ITwitchActionCommandConfig, ITwitchActionRemoteCommandConfig} from './itwitch.js'
import {ITwitchHelixRewardConfig, ITwitchHelixRewardUpdate} from './itwitch_helix.js'

/**
 * Config for events
 */
export interface IEventsConfig extends Partial<Record<string, IEvent>> {}

/**
 * Various types of special event behavior.
 */
export enum EBehavior {
    All,
    Random,
    Incrementing,
    Accumulating,
    MultiTier
}

/**
 * The event that contains triggers and actions.
 */
export interface IEvent {
    /**
     * Set various options for event behavior.
     */
    options?: IEventOptions

    /**
     * Supply in which ways we should trigger this event.
     */
    triggers: IEventTriggers

    /**
     * Optional: Provide which actions to execute when this event is triggered. There are two options.
     * 1. A single actions-set to execute.
     * 2. An array of actions-sets to execute. This can behave differently depending on the behavior set for the event.
     */
    actionsEntries?: IActions|IActions[]
}

export interface IEventOptions {
    /**
     * Optional: Set this to add special behavior to this reward.
     * - **All**: Is the same as leaving this out, no special behavior, will trigger everything provided.
     * - **Random**: Will pick a random reward from the list.
     * - **Incrementing**: Will increment every time it is redeemed.
     * - **Accumulating**: Will show the first setting until goal is met when it shows the second.
     * - **MultiTier**: Will switch to the next, but will reset after a duration, can have multiple levels.
     */
    behavior?: EBehavior

    /**
     * Optional: The goal to reach if behavior is set to accumulating.
     */
    accumulationGoal?: number

    /**
     * Optional: The duration in seconds before we reset the multi-tier level unless it is triggered again.
     */
    multiTierTimeout?: number
    /**
     * Optional: The maximum level we can reach with the multi-tier behavior. If this is not provided we will use the count of `triggers.reward`.
     */
    multiTierMaxLevel?: number
    /**
     * Optional: Also perform actions when resetting this multi-tier event.
     *
     * The level after `multiTierMaxLevel` or the level matching the count of `triggers.reward` plus one will be used.
     */
    multiTierDoResetActions?: boolean
    /**
     * Optional: Will only allow the last level to be redeemed once before resetting again.
     */
    multiTierDisableWhenMaxed?: boolean

    /**
     * Optional: Will reset an incrementing reward when the reset command is run, resetting the index to 0.
     */
    resetIncrementOnCommand?: boolean
    /**
     * Optional: Will reset an accumulating reward when the reset command is run, resetting the index to 0.
     */
    resetAccumulationOnCommand?: boolean

    // TODO: Add capability to refund accumulations later.

    /**
     * Optional: A list of rewards that will only be created, not updated using `!update`.
     * Usually references from: `Keys.*`, and it's recommended to put the channel trophy reward in here if you use it.
     */
    rewardIgnoreUpdateCommand?: boolean
    /**
     * Optional: Will avoid refunding the redemption when the clear redemptions command is used.
     */
    rewardIgnoreClearRedemptionsCommand?: boolean
    /**
     * Optional: Ignore the Discord webhook for this reward even if it exists. (might be used for something else)
     */
    rewardIgnoreAutomaticDiscordPosting?: boolean
    /**
     * Optional: Merge the current reward config onto the first default config in the array.
     */
    rewardMergeUpdateConfigWithFirst?: boolean

    /**
     * Optional: Provide an index to use when not using a specific event behavior. This can be overridden at runtime, and it will be respected.
     */
    specificIndex?: number
}

export interface IEventTriggers {
    /**
     * Optional: Set this to trigger from a chat command.
     */
    command?: ITwitchActionCommandConfig

    /**
     * Optional: Set this to trigger from a remote chat command.
     */
    remoteCommand?: ITwitchActionRemoteCommandConfig

    /**
     * Optional: Set this to trigger this form a channel reward.
     *
     * If set to an array, it can act in multiple ways. // TODO: Define ways.
     */
    reward?: ITwitchHelixRewardConfig|ITwitchHelixRewardUpdate[]

    /**
     * Optional: If a viewer cheers this specific bits value it will trigger this event.
     */
    cheer?: number

    /**
     * Optional: Have something happen automatically on a timer.
     */
    timer?: ITimerConfig

    /**
     * Optional: Listen to incoming relay messages from OpenVR2WS.
     */
    relay?: TKeys
}

export interface ITimerConfig {
    /**
     * Optional: The time in seconds between each trigger.
     */
    interval?: number

    /**
     * Optional: The amount of times to trigger the event.
     */
    times?: number

    /**
     * Optional: Delay in seconds before first run.
     */
    delay?: number
}