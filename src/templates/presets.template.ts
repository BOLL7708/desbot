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
    static PIPE_CHAT: IPipeCustomMessage = {
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
    /*
    static PIPE_DEFAULT: IPipeCustomMessage = {
        customProperties: {
            enabled: true,
            nonce: '',
            anchorType: 1,
            attachToAnchor: true,
            overlayChannel: 0,
            opacityPer: 1,
            animationHz: 0,
            durationMs: 5000,
            widthM: 1,
            zDistanceM: 1,
            yDistanceM: 0,
            xDistanceM: 0,
            yawDeg: 0,
            pitchDeg: 0,
            rollDeg: 0,
            follow: {},
            animations: [],
            transitions: [
                {
                    scalePer: 1,
                    opacityPer: 0,
                    zDistanceM: 0,
                    yDistanceM: 0,
                    xDistanceM: 0,
                    yawDeg: 0,
                    pitchDeg: 0,
                    rollDeg: 0,
                    durationMs: 250,
                    tweenType: 5            
                },
                {
                    scalePer: 1,
                    opacityPer: 0,
                    zDistanceM: 0,
                    yDistanceM: 0,
                    xDistanceM: 0,
                    yawDeg: 0,
                    pitchDeg: 0,
                    rollDeg: 0,
                    durationMs: 250,
                    tweenType: 5            
                }        
            ],
            textAreas: [
                {
                    xPositionPx: 0,
                    yPositionPx: 0,
                    widthPx: 1024,
                    heightPx: 1024,
                    fontSizePt: 56,
                    fontFamily: 'Arial Black',
                    fontColor: '#ffffff',
                    horizontalAlignment: 1,
                    verticalAlignment: 1            
                }        
            ]    
        }
    }
    */
}