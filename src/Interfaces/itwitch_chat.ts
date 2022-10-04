import {IAudioAction, IPipeAction} from './iactions.js'

export interface ITwitchChatConfig {
    /**
     * Pipe preset used for displaying custom chat messages in VR.
     */
    pipe?: IPipeAction
    /**
     * Audio config for empty messages that would not be piped.
     */
    audio?: IAudioAction
    /**
     * String used for TTS, `%name` is the name of the user, `%text` is the message.
     */
    speech: string
}

// Data (used in Factory)
export interface ITwitchMessageCmd {
    properties: ITwitchChatMessageProperties
    message: ITwitchChatMessage
}
export interface ITwitchChatMessage {
    data: string
    username?: string
    channel?: string
    type?: string
    text?: string
    isAction: boolean
}
export interface ITwitchChatMessageProperties {
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

export interface ITwitchEmote {
    id: string,
    positions: ITwitchEmotePosition[]
}
export interface ITwitchEmotePosition {
    start: number
    end: number
}