// Config
interface ITwitchConfig {
    userId: number
    clientId: string
    clientSecret: string
    channelName: string
    botName: string
    usersWithTts: string[]
    usersWithTtsTriggers: string[]
    usersWithTtsIgnore: string[]
    rewards: ITwitchRewardConfig[]
}
interface ITwitchRewardConfig {
    key: string
    id: string
}
interface IPubsubReward {
    id: string
    callback: (data: object) => void
}
interface ITwitchTokens {
    access_token: string
    refresh_token: string
    updated: string
}
interface ITwitchRedemptionMessage {
    timestamp: string
    redemption: ITwitchRedemption
}
interface ITwitchRedemption {
    channel_id: string
    id: string
    redeemed_at: string
    reward: ITwitchReward
    status: string
    user: ITwitchUser
    user_input: string
}
interface ITwitchReward {
    background_color: string
    channel_id: string
    cooldown_expires_at: string
    cost: number
    default_image: any // !
    global_cooldown: any // !
    id: string
    image: string // ?
    is_enabled: boolean
    is_in_stock: boolean
    is_paused: boolean
    is_sub_only: boolean
    is_user_input_requires: boolean
    max_per_stream: any // !
    max_per_user_per_stream: any // !
    prompt: string
    redemptions_redeemed_current_stream: any // ?
    should_redemptions_skip_request_queue: boolean
    template_id: any // ?
    title: string
    update_for_indicator_at: string
}
interface ITwitchUser {
    display_name:string
    id: string
    login: string
}

// Callbacks