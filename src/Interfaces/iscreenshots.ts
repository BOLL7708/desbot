import {IAudioAction, IPipeAction} from './iactions.js'
import {TKeys} from '../_data/!keys.js'

/**
 * Trigger and transmit screenshots from [SuperScreenShotterVR](https://github.com/BOLL7708/SuperScreenShotterVR) or [OBS Studio](https://obsproject.com/) sources.
 */
export interface IScreenshotConfig {
    /**
     * Values used when posting things coming in from SSSVR & OBS to Discord and the {@link Sign}.
     */
    callback: {
        /**
         * Keys for screenshot rewards that should be output to VR through the Pipe.
         */
        pipeEnabledForRewards: TKeys[]
    }
}

/**
 * Reference data about a screenshot that is cached from triggering it until it is completed.
 */
 export interface IScreenshotRequestData {
    /**
     * Key for the reward that triggered the screenshot.
     */
    rewardKey: TKeys
    /**
     * Twitch user ID for the redeemer.
     */
    userId: number
    /**
     * Twitch username for the redeemer.
     */
    userName: string
    /**
     * Input from the Twitch reward redemption.
     */
    userInput: string
}
