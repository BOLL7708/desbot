import {IPipeCustomMessage} from '../interfaces/ipipe.js'

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

/**
 * Pipe presets, big configs used for the notification pipe, usage:
 * ```
 *     Config.pipe.configs: {
 *         'YourRewardKey': {
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
export class PipePresetsTemplate {
    static readonly PIPE_DOT: IPipeCustomMessage = {
        customProperties: {
            enabled: true,
            attachToAnchor: true,
            overlayChannel: 100,
            widthM: 0.025,
            zDistanceM: 0.25,
            yawDeg: -30,
            pitchDeg: -30,
        }
    }
    static readonly PIPE_CHAT: IPipeCustomMessage = {
        customProperties: {
            enabled: true,
            ignoreAnchorPitch: true,
            ignoreAnchorRoll: false,
            overlayChannel: 10,
            widthM: 0.47,
            zDistanceM: 0.73,
            pitchDeg: -34.5,
            follow: {
                enabled: true,
                triggerAngle: 65,
                durationMs: 250,
                tweenType: 5,
            },
            transitions: [{
                scalePer: 0.5,
                yDistanceM: -0.25,
                durationMs: 250,
                tweenType: 7
            },{
                durationMs: 125,
                tweenType: 6
            }]
        }
    }
    static readonly PIPE_SCREENSHOT: IPipeCustomMessage = {
        customProperties: {
            enabled: true,
            ignoreAnchorPitch: true,
            ignoreAnchorRoll: true,
            overlayChannel: 500,
            widthM: 0.4,
            yawDeg: -30,
            pitchDeg: -20,
            transitions: [{
                xDistanceM: -1,
                yDistanceM: -1,
                rollDeg: 180,
                durationMs: 200,
                tweenType: 6
            },{
                xDistanceM: -1,
                yDistanceM: -1,
                rollDeg: -180,
                durationMs: 200,
                tweenType: 6
            }],
            textAreas: [{
                xPositionPx: 16,
                yPositionPx: 512-16,
                widthPx: 1024-32,
                heightPx: 512,
                fontSizePt: 48,
                fontFamily: 'Arial',
                fontColor: '#ddd',
                verticalAlignment: 2
            },{
                xPositionPx: 16,
                yPositionPx: 16,
                widthPx: 1024-32,
                heightPx: 512,
                fontSizePt: 48,
                fontFamily: 'Arial',
                fontColor: '#ddd',
                horizontalAlignment: 2
            }]
        }
    }
}