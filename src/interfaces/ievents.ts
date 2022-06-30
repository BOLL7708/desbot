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
         * Set this to add special behavior to this reward.
         * - standard: is the same as leaving this out, no special behavior.
         * - incrementing: will increment the reward config every time it is redeemed.
         */
        rewardType?: ERewardType

        /**
         * A list of rewards that will only be created, not updated using `!update`.
         * Usually references from: `Keys.*`, and it's recommended to put the channel trophy reward in here if you use it.
         */
        rewardIgnoreUpdateCommand?: boolean

        /**
         * Will reset incrementing rewards when the widget loads, resetting them to 0.
         */
        rewardResetIncrementOnCommand?: boolean

    }
    triggers: {
        /**
         * Set this to trigger from a chat command.
         */
        command?: ITwitchActionCommandConfig
        
        /**
         * Set this to trigger this form a channel reward.
         * 
         * If set to an array, it can act in multiple ways. // TODO: Define ways.
         */
        reward?: ITwitchHelixRewardConfig|ITwitchHelixRewardUpdate[]

        /**
         * If a viewer cheers this specific bits value it will trigger this event.
         */
        cheer?: number

        /**
         * Have something happen automatically on a timer.
         */
        timer?: ITimerConfig
    }
    actions?: {
        // TODO: Add array support to everything? Random/Shuffle functionality?
        
        /**
         * Optional: Used to change SteamVR settings.
         */
        openVR2WS?: IOpenVR2WSSetting|IOpenVR2WSSetting[]
        
        /**
         * Optional: Used to toggle OBS sources or filters.
         */
        obs?: IObsSourceConfig|IObsSourceConfig[]
        
        /**
         * Optional: Trigger one or multiple pipe overlays.
         */
        pipe?: IPipeMessagePreset|IPipeMessagePreset[]
        
        /**
         * Optional: Trigger OBS or VR screenshots.
         */
        screenshots?: IScreenshot
        
        /**
         * Optional: Trigger Philips Hue lights changes.
         */
        lights?: IPhilipsHueColorConfig|IPhilipsHueColorConfig[]
        
        /**
         * Optional: Trigger Philips Hue plug changes.
         */
        plugs?: IPhilipsHuePlugConfig
        
        /**
         * Optional: Trigger audio clips.
         */
        audio?: IAudio
        
        /**
         * Optional: Trigger the TTS to read a message.
         * 
         * Note: Supplying an array will pick a random one, or if the reward is incrementing, it will pick the matching index.
         */
        speech?: ISpeechConfig
        
        /**
         * Optional: Show a pop-in message in the browser source for the widget.
         */
        sign?: ISignShowConfig
        
        /**
         * Optional: Execute a key command in a specific window or trigger a custom URI.
         */
        exec?: IExecConfig
        
        /**
         * Optional: Load a page in the background.
         * 
         * Note: Supplying an array will pick a random one, or if the reward is incrementing, it will pick the matching index.
         */
        web?: string
        
        /**
         * Optional: Send a message to a Discord channel, make sure to set a webhook URL in {@link Config.credentials.webhooks} for the same key.
         * 
         * Note: Supplying an array will pick a random one, or if the reward is incrementing, it will pick the matching index.
         */
        discord?: string|string[],
        
        /**
         * Optional: Play back the user-provided audio URL.
         */
        audioUrl?: IAudioBase
    
        /**
         * Optional: Send a message to the Twitch chat.
         * 
         * Note: Supplying an array will pick a random one, or if the reward is incrementing, it will pick the matching index.
         */
        chat?: string|string[]
    
        /**
         * Optional: Writes a label to settings.
         */
        label?: string

        /**
         * Optional: Trigger other commands, propagating input.
         */
        commands?: ICommandConfig
    }
}

interface ITimerConfig {
    /**
     * The time in seconds between each trigger.
     */
    interval?: number

    /**
     * The amount of times to trigger the event.
     */
    times?: number

    /**
     * Delay in seconds before first run.
     */
    delay?: number
}