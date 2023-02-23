// region Components
export interface ITwitchEventSubMetadata {
    message_id: string
    message_type: TTwitchEventSubMetadataType
    message_timestamp: string
    subscription_type?: TTwitchEventSubSubscriptionType
    subscription_version?: string
}
export interface ITwitchEventSubPayloadSession {
    id: string
    status: TTwitchEventSubMessageStatus,
    connected_at: string,
    keepalive_timeout_seconds: number|null,
    reconnect_url: string|null
}
export interface ITwitchEventSubPayloadSubscription {
    id: string
    status: TTwitchEventSubPayloadSubscriptionStatus
    type: TTwitchEventSubSubscriptionType
    version: string
    cost: number
    condition: ITwitchEventSubSubscriptionCondition
    transport: {
        method: TTwitchEventSubPayloadSubscriptionTransportMethod,
        session_id?: string
        callback?: string
    },
    created_at: string
}
// endregion

// region Messages
export interface ITwitchEventSubMessageWelcome {
    metadata: ITwitchEventSubMetadata
    payload: {
        session: ITwitchEventSubPayloadSession
    }
}
export interface ITwitchEventSubMessageKeepAlive {
    metadata: ITwitchEventSubMetadata
    payload: {}
}
export interface ITwitchEventSubMessageSessionReconnect {
    metadata: ITwitchEventSubMetadata
    payload: {
        session: ITwitchEventSubPayloadSession
    }
}
export interface ITwitchEventSubMessageRevocation {
    metadata: ITwitchEventSubMetadata
    payload: {
        subscription: ITwitchEventSubPayloadSubscription
    }
}
export interface ITwitchEventSubMessageNotification {
    metadata: ITwitchEventSubMetadata
    payload: {
        subscription: ITwitchEventSubPayloadSubscription
        event: any
    }
}
// endregion

// region Types
export type TTwitchEventSubMetadataType =
    'session_welcome'
    | 'session_keepalive'
    | 'notification'
    | 'session_reconnect'
    | 'revocation'
export type TTwitchEventSubMessageStatus =
    'connected'
    | 'enabled'
    | 'reconnecting'
export type TTwitchEventSubPayloadSubscriptionStatus =
    'enabled'
    | 'user_removed'
    | 'authorization_revoked'
    | 'version_removed'
export type TTwitchEventSubPayloadSubscriptionTransportMethod =
    'websocket'
    | 'webhook'
export type TTwitchEventSubSubscriptionType =
    'channel.update'
    | 'channel.follow'
    | 'channel.subscribe'
    | 'channel.subscription.end'
    | 'channel.subscription.gift'
    | 'channel.subscription.message'
    | 'channel.cheer'
    | 'channel.raid'
    | 'channel.ban'
    | 'channel.unban'
    | 'channel.moderator.add'
    | 'channel.moderator.remove'
    | 'channel.channel_points_custom_reward.add'
    | 'channel.channel_points_custom_reward.update'
    | 'channel.channel_points_custom_reward.remove'
    | 'channel.channel_points_custom_reward_redemption.add'
    | 'channel.channel_points_custom_reward_redemption.update'
    | 'channel.poll.begin'
    | 'channel.poll.progress'
    | 'channel.poll.end'
    | 'channel.prediction.begin'
    | 'channel.prediction.progress'
    | 'channel.prediction.lock'
    | 'channel.prediction.end'
    | 'channel.charity_campaign.donate'
    | 'channel.charity_campaign.start'
    | 'channel.charity_campaign.progress'
    | 'channel.charity_campaign.stop'
    | 'drop.entitlement.grant'
    | 'extension.bits_transaction.create'
    | 'channel.goal.begin'
    | 'channel.goal.progress'
    | 'channel.goal.end'
    | 'channel.hype_train.begin'
    | 'channel.hype_train.progress'
    | 'channel.hype_train.end'
    | 'channel.shield_mode.begin'
    | 'channel.shield_mode.end'
    | 'channel.shoutout.create'
    | 'channel.shoutout.receive'
    | 'stream.online'
    | 'stream.offline'
    | 'user.authorization.grant'
    | 'user.authorization.revoke'
    | 'user.update'
// endregion

// region Payloads
export interface ITwitchEventSubSubscriptionPayload {
    type: TTwitchEventSubSubscriptionType
    version: string
    condition: ITwitchEventSubSubscriptionCondition
    transport: {
        method: TTwitchEventSubPayloadSubscriptionTransportMethod
        session_id?: string
        callback?:string
        secret?:string
    }
}

/**
 * Check the documentation for which properties are needed for which subscription.
 * @link https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/
 */
export interface ITwitchEventSubSubscriptionCondition {
    broadcaster_user_id?: string // common, but not for all
    moderator_user_id?: string // shield mode, shoutouts, follows
    to_broadcaster_user_id?: string // raids
    from_broadcaster_user_id?: string // raids
    reward_id?: string // Filter on this reward
    organization_id?: string // Drops
    category_id?: string // Drops
    campaign_id?: string // Drops
    extension_client_id?: string // Extensions
    client_id?: string // Authorizations
    user_id?: string // User updates
}
// endregion

// region Notifications
export interface ITwitchEventSubEmote {
    begin: number
    end: number
    id: number
}
export type TTwitchEventSubEventStatus =
    'fulfilled'
    | 'unfulfilled'
    | 'canceled'

/**
 * @link https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/#channelchannel_points_custom_reward_redemptionadd
 * @link https://dev.twitch.tv/docs/eventsub/eventsub-reference/#channel-points-custom-reward-redemption-add-event
 */
export interface ITwitchEventSubEventRedemption {
    id: string
    broadcaster_user_id: string
    broadcaster_user_login: string
    broadcaster_user_name: string
    user_id: string
    user_login: string
    user_name: string
    user_input: string
    status: TTwitchEventSubEventStatus,
    reward: {
        id: string
        title: string
        cost: number
        prompt: string
    },
    redeemed_at: string
}
export interface ITwitchEventSubEventCheer {
    is_anonymous: boolean
    user_id: string // null if is_anonymous=true
    user_login: string // null if is_anonymous=true
    user_name: string // null if is_anonymous=true
    broadcaster_user_id: string
    broadcaster_user_login: string
    broadcaster_user_name: string
    message: string
    bits: number
}

export interface ITwitchEventSubEventSubscription {
    user_id: string
    user_login: string
    user_name: string
    broadcaster_user_id: string
    broadcaster_user_login: string
    broadcaster_user_name: string
    tier: string
    is_gift: false
}

export interface ITwitchEventSubEventGiftSubscription {
    user_id: string
    user_login: string
    user_name: string
    broadcaster_user_id: string
    broadcaster_user_login: string
    broadcaster_user_name: string
    total: number
    tier: string
    cumulative_total: number //null if anonymous or not shared by the user
    is_anonymous: boolean
}

export interface ITwitchEventSubEventSubscriptionMessage {
    user_id: string
    user_login: string
    user_name: string
    broadcaster_user_id: string
    broadcaster_user_login: string
    broadcaster_user_name: string
    tier: string
    message: {
        text: string
        emotes: [
            {
                begin: number
                end: number
                id: string
            }
        ]
    }
    cumulative_months: number
    streak_months: number, // null if not shared
    duration_months: number
}

export interface ITwitchEventSubEventRaid {

}
// endregion