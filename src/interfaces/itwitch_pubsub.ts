// Data

/**
 * Main message received from PubSub
 */
interface ITwitchPubsubMessage {
    /**
     * Type of message, most common type we check is just: "MESSAGE"
     */
    type: string
    /**
     * Data payload, the actually useful part.
     */
    data: {
        /**
         * The message payload encoded as JSON (again yes!)
         */
        message: string
        /**
         * The topic from the API.
         */
        topic: string
    }
}
interface ITwitchPubsubRewardMessage {
    type: string
    data: {
        timestamp: string
        redemption: ITwitchRedemption
    }
}

// Redemption
interface ITwitchRedemption {
    channel_id: string
    id: string
    redeemed_at: string
    reward: ITwitchRewardData
    status: string
    user: ITwitchUser
    user_input: string
}
interface ITwitchRewardData {
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

// Callback
interface ITwitchPubsubRewardCallback {
    (id:string, message: ITwitchRedemptionMessage): void
}