class ControllerPresetsTemplate {
    static NO_CHAT: IControllerDefaults = {
        pipeAllChat: false
    }
    static NO_TTS: IControllerDefaults = {
        ttsForAll: false
    }
}

// Keys are before Presets alphabetically so the values will exist due to it being included prior.
class GamePresetsTemplate {
    // Reward toggles
    static REWARDS_EXAMPLE1: ITwitchRewardProfileConfig = {
        [KeysTemplate.KEY_OBS_EXAMPLE1]: true,
        [KeysTemplate.KEY_OBS_EXAMPLE2]: false,
        [KeysTemplate.KEY_OBS_EXAMPLE3]: false
    }
}