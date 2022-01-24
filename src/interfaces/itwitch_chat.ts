// Data (used in Factory)
interface ITwitchMessageCmd {
    properties: ITwitchChatMessageProperties
    message: ITwitchChatMessage
}
interface ITwitchChatMessage {
    data: string
    username: string
    channel: string
    type: string
    text: string
    isAction: boolean
}
interface ITwitchChatMessageProperties {
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