// Override presets for the default controller options
class ControllerPresetsTemplate {
    static NO_CHAT: IControllerDefaults = {
        pipeAllChat: false
    }
    static NO_TTS: IControllerDefaults = {
        ttsForAll: false
    }
}

// Reward presets that are toggled on game changes
class GamePresetsTemplate {
    static REWARDS_EXAMPLE1: ITwitchRewardProfileConfig = {
        [KeysTemplate.KEY_SETTING_EXAMPLE1]: false,
        [KeysTemplate.KEY_SETTING_EXAMPLE2]: false
    }
}

// Pipe presets
class PipePresetsTemplate {
    static PIPE_DOT: IPipeCustomMessage = {
        custom: true,
        properties: {
            headset: true,
            horizontal: true,
            level: false,
            channel: 100,
            width: 0.025,
            distance: 0.25,
            pitch: -30, 
            yaw: -30
        },
        transitions: [],
        textAreas: []
    }
    static PIPE_DROP: IPipeCustomMessage = {
        custom: true,
        properties: {
            headset: false,
            horizontal: true,
            level: true,
            channel: 200,
            width: 2,
            distance: 2,
            pitch: 0, 
            yaw: 0
        },
        transitions: [
            {
                scale: 0,
                opacity: 0,
                vertical: 3,
                distance: 0,
                horizontal: 0,
                spin: 0,
                tween: 7,
                duration: 300
            },
            {
                scale: 0,
                opacity: 0,
                vertical: -3,
                distance: 0,
                horizontal: 0,
                spin: 0,
                tween: 6,
                duration: 500
            }
        ],
        textAreas: []
    }
    static PIPE_DEFAULT: IPipeCustomMessage = {
        image: null,
        custom: true,
        properties: {
            headset: false,
            horizontal: true,
            level: false,
            channel: 0,
            hz: -1,
            duration: 1000,
            width: 1,
            distance: 1,
            pitch: 0, 
            yaw: 0
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
}