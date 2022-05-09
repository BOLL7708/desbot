interface ITwitchChatConfig {
    /**
     * Pipe preset used for displaying custom chat messages in VR.
     */
    pipe: IPipeMessagePreset
    /**
     * Audio config for empty messages that would not be piped.
     */
    audio: IAudio
    /**
     * String used for TTS, first `%s` is the name of the user, second `%s` is the message.
     */
    speech: string
}

// Data (used in Factory)
interface ITwitchMessageCmd {
    properties: ITwitchChatMessageProperties
    message: ITwitchChatMessage
}
interface ITwitchChatMessage {
    data: string
    username?: string
    channel?: string
    type?: string
    text?: string
    isAction: boolean
}
interface ITwitchChatMessageProperties {
    // Standard
    data: string
    '@badge-info'?: string
    badges?: string
    'client-nonce'?: string
    color?: string
    'custom-reward-id'?: string
    'display-name'?: string
    emotes?: ITwitchEmote[]
    'first-msg'?: string
    flags?: string
    id?: string
    mod?: string
    'room-id'?: string
    subscriber?: string
    'tmi-sent-ts'?: string
    turbo?: string
    'user-id'?: string
    'user-type'?: string
    bits?: string

    // Thread
    'reply-parent-display-name'?: string
    'reply-parent-msg-body'?: string
    'reply-parent-msg-id'?: string
    'reply-parent-user-id'?: string
    'reply-parent-user-login'?: string

    [x: string]: any
}

interface ITwitchEmote {
    id: string,
    positions: ITwitchEmotePosition[]
}
interface ITwitchEmotePosition {
    start: number
    end: number
}