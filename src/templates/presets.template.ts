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
class ControllerPresetsTemplate {
    // static YOUR_PRESET: IControllerDefaults = { ttsForAll: false }
}

/** 
 *  Reward presets that are toggled on game changes, usage:
 *  ```
 *     Config.twitch.rewardConfigProfilePerGame: {
 *         [Games.YOUR_GAME]: GamePresets.YOUR_PRESET
 *     }
 * ```
 */
class GamePresetsTemplate {
    /*
    static REWARDS_EXAMPLE1: ITwitchRewardProfileConfig = {
        [KeysTemplate.KEY_YOURREWARD]: false
    }
    */
}

/**
 * Pipe presets, big configs used for the notification pipe, usage:
 * ```
 *     Config.pipe.configs: {
 *         [Keys.KEY_YOURREWARD]: {
 *             {
 *                 imagePath: ['_assets/yourimage.png'],
 *                 durationMs: 5000,
 *                 config: PipePresets.YOUR_PRESET
 *             }
 *         }
 *     }
 * ```
 * The values for these configs are best made with the example page you can open
 * through the application itself, click the `Example` link in OpenVRNotificationPipe.
 */ 
class PipePresetsTemplate {
    /*
    static PIPE_DEFAULT: IPipeCustomMessage = {
        custom: true,
        properties: {
            headset: false,
            horizontal: true,
            level: false,
            channel: 0,
            width: 1,
            distance: 1,
            pitch: 0, 
            yaw: 0,
            offsetx: 0,
            offsety: 0
        },
        transitions: [
            {
                scale: 1,
                opacity: 0,
                vertical: 0,
                distance: 0,
                horizontal: 0,
                spin: 0,
                tween: 0,
                duration: 100
            },
            {
                scale: 1,
                opacity: 0,
                vertical: 0,
                distance: 0,
                horizontal: 0,
                spin: 0,
                tween: 0,
                duration: 100
            }
        ],
        textAreas: [
            {
                posx: 0,
                posy: 0,
                width: 0,
                height: 0,
                size: 0,
                font: '',
                color: 'white',
                gravity: 0,
                alignment: 0
            }
        ]
    }
    */
}