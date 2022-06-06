interface IEventsConfig {
    [key: string]: IEvent
}
interface IEventsForGamesConfig {
    [key: string]: { 
        [key: string]: IEvent
    }
}

/**
 * The event that contains triggers and actions.
 */
interface IEvent {
    options?: {
        /**
         * For reward with an array of configs, this will reset them to 0 when the widget reloads.
         */
        resetIncrementingRewardOnLoad?: boolean

        /**
         * A list of rewards that will only be created, not updated using `!update`.
         * Usually references from: `Keys.*`, and it's recommended to put the channel trophy reward in here if you use it.
         */
        ignoreUpdateRewardsCommand?: boolean

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
        speech?: string|string[]
        
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
    }
}