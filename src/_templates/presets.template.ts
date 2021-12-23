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
    static PIPE_EXAMPLE1: IPipeCustomMessage = {
        image: '', // Gets overridden by the Config values
        custom: true,
        properties: {
            headset: true,
            horizontal: true,
            level: false,
            channel: 100,
            hz: -1,
            duration: 0, // Gets overridden by the Config values
            width: 0.025,
            distance: 0.25,
            pitch: 30, 
            yaw: 30
        },
        transition: {
            scale: 1,
            opacity: 0,
            vertical: 0,
            distance: 0,
            horizontal: 0,
            spin: 0,
            tween: 0,
            duration: 100
        },
        transition2: {
            scale: 1,
            opacity: 0,
            vertical: 0,
            distance: 0,
            horizontal: 0,
            spin: 0,
            tween: 0,
            duration: 100
        }
    }
}