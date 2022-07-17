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
enum ERewardType { 
    Standard = 'standard',
    Incrementing = 'incrementing',
    Accumulating = 'accumulating'
}

/**
 * The event that contains triggers and actions.
 */
interface IEvent {
    options?: {
        /**
         * Optional: Set this to add special behavior to this reward.
         * - standard: is the same as leaving this out, no special behavior.
         * - incrementing: will increment the reward config every time it is redeemed.
         */
        rewardType?: ERewardType

        /**
         * Optional: A list of rewards that will only be created, not updated using `!update`.
         * Usually references from: `Keys.*`, and it's recommended to put the channel trophy reward in here if you use it.
         */
        rewardIgnoreUpdateCommand?: boolean

        /**
         * Optional: Will reset an incrementing reward when the reset command is run, resetting the index to 0.
         */
        rewardResetIncrementOnCommand?: boolean

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
    actions?: IActions|IActionsTimeline
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