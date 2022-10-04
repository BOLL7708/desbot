// Data

/**
 * Main message received from PubSub
 */
export interface ITwitchPubsubMessage {
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

// Seconary message payloads
export interface ITwitchPubsubRewardMessage {
    type: string
    data: {
        timestamp: string
        redemption: {
            channel_id: string
            id: string
            redeemed_at: string
            reward: {
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
            status: TTwitchRedemptionStatus
            user: {
                display_name:string
                id: string
                login: string
            }
            user_input: string
        }
    }
}
export type TTwitchRedemptionStatus =
| 'FULFILLED'
| 'UNFULFILLED'
| 'CANCELED'

// Subscription
// https://dev.twitch.tv/docs/pubsub#receiving-messages
export interface ITwitchPubsubSubscriptionMessage {
    user_name?: string
    display_name?: string
    channel_name: string
    user_id?: string
    channel_id: string
    time: string
    sub_plan: string
    sub_plan_name: string
    cumulative_months?: number
    streak_months?: number
    months?: number
    context: string
    is_gift: false
    sub_message: {
        message: string
        emotes: null|ITwitchPubsubEmote[]
    },
    recipient_id?: string
    recipient_user_name?: string
    recipient_display_name?: string
    multi_month_duration?: number
}
export interface ITwitchPubsubEmote {
    start: number
    end: number
    id: number
}

// Cheer
export interface ITwitchPubsubCheerMessage {
    data: {
        badge_entitlement?: null|object // ?
        bits_used: number
        channel_id: string
        chat_message: string
        context: string
        is_anonymous: boolean
        message_id: string
        message_type: string
        time: string
        total_bits_used: number
        user_id?: string
        user_name?: string
        version: string
    },
    message_id: string
    message_type: string
    version: string
}

// Callback
export interface ITwitchPubsubRewardCallback {
    (id: string, message: ITwitchPubsubRewardMessage): void
}
export interface ITwitchPubsubSubscriptionCallback {
    (message: ITwitchPubsubSubscriptionMessage): void
}
export interface ITwitchPubsubCheerCallback {
    (message: ITwitchPubsubCheerMessage): void
}