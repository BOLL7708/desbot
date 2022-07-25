interface IEventsConfig {
    [key: string]: IEvent
}
interface IEventsForGamesConfig {
    [key: string]: { 
        [key: string]: IEvent
    }
}

/**
 * Various types of special reward behavior.
 */
enum EBehavior { 
    All,
    Random,
    Incrementing,
    Accumulating,
    Multitier
}

/**
 * The event that contains triggers and actions.
 */
interface IEvent {
    options?: {
        /**
         * Optional: Set this to add special behavior to this reward.
         * - **All**: Is the same as leaving this out, no special behavior, will trigger everything provided.
         * - **Random**: Will pick a random reward from the list.
         * - **Incrementing**: Will increment every time it is redeemed.
         * - **Accumulating**: Will show the first setting until goal is met when it shows the second.
         * - **Multitier**: Will switch to the next, but will reset after a duration, can have multiple levels.
         */
        behavior?: EBehavior
       
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
    }
    triggers: {
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
    }

    /**
     * Optional: Set this to execute actions when the event is triggered. There are a few options.
     * 1. A single batch of actions to execute.
     * 2. A timeline of actions to execute.
     * 3. An array single action to execute.
     */
    actions?: IActions|IActionsTimeline|IActions[]|IActionsTimeline[]
}

interface ITimerConfig {
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