/*
 * This is a premade file with examples of how to make preset objects.
 * It is useful if you want to reuse the same config values in multiple places.
 * 
 * You can create any additional container for presets here, and the name and contents is up to you.
 * The ones provided are examples that were deemed useful.
 */

/**
 * Override presets for the default controller options per game, usage:
 * ```
 * Config.controller.gameDefaults: {
 *     [Games.YOUR_GAME]: ControllerPresets.YOUR_PRESET
 * }
 * ```
 */ 
export class ControllerPresetsTemplate {
    // static readonly YOUR_PRESET: IControllerDefaults = { ttsForAll: false }
}

/** 
 *  Reward presets that are toggled on game changes, usage:
 *  ```
 *     Config.twitch.rewardConfigProfilePerGame: {
 *         [Games.YOUR_GAME]: GamePresets.YOUR_PRESET
 *     }
 * ```
 */
export class GamePresetsTemplate {
    /*
    static readonly REWARDS_EXAMPLE1: ITwitchRewardProfileConfig = {
        'YourRewardKey': false
    }
    */
}