import Color from '../Constants/ColorConstants.mts'
import WebSockets from './WebSockets.mts'
import Utils from '../Utils/Utils.mts'
import TwitchHelixHelper from '../Helpers/TwitchHelixHelper.mts'
import {SettingTwitchRedemption} from '../Objects/Data/Setting/SettingTwitch.mts'
import DataBaseHelper from '../Helpers/DataBaseHelper.mts'
import {ActionHandler, Actions} from '../Actions.mts'

export default class TwitchEventSub {
    private LOG_COLOR = Color.DarkViolet
    private _serverUrl: string = 'wss://eventsub.wss.twitch.tv/ws'
    private _socket?: WebSockets
    private _sessionId: string = ''
    private _keepAliveSeconds: number = 0
    private static _receivedMessageIds: string[] = []

    private _onRewardCallback: ITwitchEventSubRewardCallback = (event) => { console.log('EventSub: Reward unhandled') }
    private _onSubscriptionCallback: ITwitchEventSubSubscriptionCallback = (event) => { console.log('EventSub: Subscription unhandled') }
    private _onGiftSubscriptionCallback: ITwitchEventSubGiftSubscriptionCallback = (event) => { console.log('EventSub: Gift Subscription unhandled') }
    private _onResubscriptionCallback: ITwitchEventSubResubscriptionCallback = (event) => { console.log('EventSub: Resubscription unhandled') }
    private _onCheerCallback: ITwitchEventSubCheerCallback = (event) => { console.log('EventSub: Cheer unhandled') }
    private _onRaidCallback: ITwitchEventSubRaidCallback = (event) => { console.log('EventSub: Raid unhandled') }

    // region Triggers & Actions
    private _rewards: Map<string, ITwitchReward> = new Map()
    registerReward(twitchReward: ITwitchReward) {
        if(twitchReward.id) {
            Utils.log(`Registering reward: ${twitchReward.id}`, this.LOG_COLOR)
            this._rewards.set(twitchReward.id ?? '', twitchReward)
        } else {
            Utils.log(`Failed registering reward as ID was: ${twitchReward.id}`, Color.DarkRed)
        }
    }
    private _cheers: Map<number, ITwitchCheer> = new Map()
    registerCheer(twitchCheer: ITwitchCheer) {
        Utils.log(`Registering cheer: ${this._cheers}`, this.LOG_COLOR)
        this._cheers.set(twitchCheer.bits, twitchCheer)
    }
    // endregion

    // region Callbacks
    setOnRewardCallback(callback: ITwitchEventSubRewardCallback) {
        this._onRewardCallback = callback
    }
    setOnSubscriptionCallback(callback: ITwitchEventSubSubscriptionCallback) {
        this._onSubscriptionCallback = callback
    }
    setOnGiftSubscriptionCallback(callback: ITwitchEventSubGiftSubscriptionCallback) {
        this._onGiftSubscriptionCallback = callback
    }
    setOnResubscriptionCallback(callback: ITwitchEventSubResubscriptionCallback) {
        this._onResubscriptionCallback = callback
    }
    setOnCheerCallback(callback: ITwitchEventSubCheerCallback) {
        this._onCheerCallback = callback
    }
    setOnRaidCallback(callback: ITwitchEventSubRaidCallback) {
        this._onRaidCallback = callback
    }
    // endregion

    // region Connection
    async init() {
        this._socket = new WebSockets(this._serverUrl)
        this._socket._onOpen = ()=>{
            Utils.log('Connected to EventSub', Color.Purple, true, true)
        }
        this._socket._onClose = ()=>{}
        this._socket._onError = ()=>{}
        this._socket._onMessage = this.onMessage.bind(this)
        this._socket.init()
    }

    private async onMessage(messageEvent: MessageEvent) {
        let dataJson: any
        try {
            dataJson = JSON.parse(messageEvent.data)
        } catch (error) {
            console.warn(`TwitchEventSub: Unable to parse message data: ${error}`)
            return
        }
        if(dataJson && dataJson.metadata) {
            const metaData: ITwitchEventSubMetadata = dataJson.metadata
            const messageId = metaData.message_id
            if(TwitchEventSub._receivedMessageIds.indexOf(messageId) >= 0) {
                console.warn(`TwitchEventSub: Got a duplicate message of type: ${metaData.message_type}, id: ${metaData.message_id}`)
                return
            } else {
                TwitchEventSub._receivedMessageIds.push(messageId)
            }
            switch(metaData.message_type) {
                case 'session_welcome': {
                    // Initial message after connection to the server.
                    const message = dataJson as ITwitchEventSubMessageWelcome
                    this._sessionId = message.payload.session.id ?? ''
                    this._keepAliveSeconds = message.payload.session.keepalive_timeout_seconds ?? 0
                    this.subscribeToEvents().then()
                    this.resetTimeout()
                    break
                }
                case 'session_keepalive': {
                    // Is received if no notification has been sent to keep the connection alive.
                    const message = dataJson as ITwitchEventSubMessageKeepAlive
                    this.resetTimeout()
                    break
                }
                case 'session_reconnect': {
                    // This can move us to a new server.
                    const message = dataJson as ITwitchEventSubMessageSessionReconnect
                    this._keepAliveSeconds = 0
                    const newServerUrl = message.payload.session.reconnect_url
                    if(newServerUrl) this._serverUrl = newServerUrl
                    this.init().then()
                    break
                }
                case 'revocation': {
                    const message = dataJson as ITwitchEventSubMessageRevocation
                    console.warn(`TwitchEventSub: Lost access to subscription: ${message.payload.subscription.type}`)
                    break
                }
                case 'notification':
                    this.resetTimeout()
                    console.log(`TwitchEventSub: [${messageId}] MsgType: ${metaData.message_type}, SubType: ${metaData.subscription_type}`)
                    const message = dataJson as ITwitchEventSubMessageNotification
                    this.onEvent(metaData, message).then()
                    break
                default:
                    console.warn(`TwitchEventSub: Unhandled message type: ${metaData.message_type}`)
            }
        }
    }

    private _timeoutHandle: number|any = 0 // TODO: Transitional node fix

    /**
     * If we don't get notifications or keepalive messages the connection has
     * likely timed out, and we should reconnect.
     * @private
     */
    private resetTimeout() {
        clearTimeout(this._timeoutHandle)
        if(this._keepAliveSeconds > 0) {
            this._timeoutHandle = setTimeout(()=>{
                console.warn('TwitchEventSub: Connection timed out, resetting...')
                this._socket?.reconnect()
            }, (this._keepAliveSeconds+5)*1000) // TODO: Put this margin in some config?
        }
    }
    // endregion

    // region Subscriptions
    private async subscribeToEvents() {
        if(this._socket) {
            const broadcasterId = await TwitchHelixHelper.getBroadcasterUserId()
            let successes = 0
            successes += await this.subscribe(
                'channel.channel_points_custom_reward_redemption.add',
                { broadcaster_user_id: broadcasterId.toString() }
            )
            successes += await this.subscribe(
                'channel.follow',
                {
                    broadcaster_user_id: broadcasterId.toString(),
                    moderator_user_id: broadcasterId.toString()
                },
                '2'
            )
            successes += await this.subscribe(
                'channel.raid',
                {
                    from_broadcaster_user_id: broadcasterId.toString()
                }
            )
            successes += await this.subscribe(
                'channel.raid',
                {
                    to_broadcaster_user_id: broadcasterId.toString()
                }
            )
            successes += await this.subscribe(
                'channel.cheer',
                { broadcaster_user_id: broadcasterId.toString() }
            )
            /**
             * New subscriptions
             */
            successes += await this.subscribe(
                'channel.subscribe',
                { broadcaster_user_id: broadcasterId.toString() }
            )
            /**
             * Gift subscriptions
             */
            successes += await this.subscribe(
                'channel.subscription.gift',
                { broadcaster_user_id: broadcasterId.toString() }
            )
            /**
             * Re-subscriptions
             */
            successes += await this.subscribe(
                'channel.subscription.message',
                { broadcaster_user_id: broadcasterId.toString() }
            )
            successes += await this.subscribe(
                'channel.poll.begin',
                { broadcaster_user_id: broadcasterId.toString() }
            )
            successes += await this.subscribe(
                'channel.poll.end',
                { broadcaster_user_id: broadcasterId.toString() }
            )
            successes += await this.subscribe(
                'channel.prediction.begin',
                { broadcaster_user_id: broadcasterId.toString() }
            )
            successes += await this.subscribe(
                'channel.prediction.end',
                { broadcaster_user_id: broadcasterId.toString() }
            )
            successes += await this.subscribe(
                'stream.online',
                { broadcaster_user_id: broadcasterId.toString() }
            )
            successes += await this.subscribe(
                'stream.offline',
                { broadcaster_user_id: broadcasterId.toString() }
            )
            successes += await this.subscribe(
                'channel.ban',
                { broadcaster_user_id: broadcasterId.toString() }
            )
            successes += await this.subscribe(
                'channel.unban',
                { broadcaster_user_id: broadcasterId.toString() }
            )
            successes += await this.subscribe(
                'channel.moderator.add',
                { broadcaster_user_id: broadcasterId.toString() }
            )
            successes += await this.subscribe(
                'channel.moderator.remove',
                { broadcaster_user_id: broadcasterId.toString() }
            )
            successes += await this.subscribe(
                'channel.update',
                { broadcaster_user_id: broadcasterId.toString() }
            )
            console.log(`TwitchEventSub: Successful Subscriptions->${successes}`)
        }
    }

    private async subscribe(
        type: TTwitchEventSubSubscriptionType,
        condition: ITwitchEventSubSubscriptionCondition,
        version: string = '1'
    ): Promise<number> {
        const body: ITwitchEventSubSubscriptionPayload = {
            type: type,
            version: version,
            condition: condition,
            transport: {
                method: 'websocket',
                session_id: this._sessionId
            }
        }
        return await TwitchHelixHelper.subscribeToEventSub(body) ? 1 : 0
    }
    // endregion

    // region Events
    private _receivedRedemptions: string[] = []

    private async onEvent(eventMeta: ITwitchEventSubMetadata, eventMessage: ITwitchEventSubMessageNotification) {
        switch(eventMessage.metadata.subscription_type) {
            // TODO:
            //  Redemptions
            //  Follows
            //  Cheers
            //  Raids
            //  Subscriptions
            case 'channel.channel_points_custom_reward_redemption.add': {
                const event = eventMessage.payload.event as ITwitchEventSubEventRedemption
                const redemptionId = event.id
                console.log(`TwitchEventSub: Redemption ${redemptionId} (${eventMeta.message_id})`, event)

                if(this._receivedRedemptions.indexOf(redemptionId) >= 0) {
                    console.warn(`TwitchEventSub: We got a duplicate redemption with ID: ${redemptionId}`)
                    break
                } else {
                    this._receivedRedemptions.push(redemptionId)
                }
                if(event && event.status == 'UNFULFILLED') {
                    const redemptionStatus = new SettingTwitchRedemption()
                    redemptionStatus.userId = parseInt(event.user_id) ?? 0
                    redemptionStatus.rewardId = event.reward.id
                    redemptionStatus.time = event.redeemed_at
                    redemptionStatus.status = event.status
                    redemptionStatus.cost = event.reward.cost
                    await DataBaseHelper.save(redemptionStatus, event.id)
                }
                Utils.log(`TwitchEventSub: Reward redeemed! (${event.reward.id})`, this.LOG_COLOR)
                if(event.reward.id !== null) this._onRewardCallback(event)

                // Event
                const reward = this._rewards.get(event.reward.id)
                if(reward?.handler) reward.handler.call(await Actions.buildUserDataFromRedemptionMessage(reward.handler.key, event)).then()
                else console.warn(`TwitchEventSub: Reward not found: ${redemptionId}`)
                break
            }
            case 'channel.subscribe': {
                const event = eventMessage.payload.event as ITwitchEventSubEventSubscription
                this._onSubscriptionCallback(event)
                break
            }
            case 'channel.subscription.gift': {
                const event = eventMessage.payload.event as ITwitchEventSubEventGiftSubscription
                this._onGiftSubscriptionCallback(event)
                break
            }
            case 'channel.subscription.message': {
                const event = eventMessage.payload.event as ITwitchEventSubEventResubscription
                this._onResubscriptionCallback(event)
                break
            }
            case 'channel.cheer': {
                const event = eventMessage.payload.event as ITwitchEventSubEventCheer
                this._onCheerCallback(event)

                // Event
                const cheer = this._cheers.get(event.bits)
                if(cheer?.handler) cheer.handler.call(await Actions.buildUserDataFromCheerMessage(cheer.handler.key, event)).then()
                else console.warn(`TwitchEventSub: Cheer not found: ${event.bits}`)
                break
            }
            case 'channel.raid': {
                const event = eventMessage.payload.event as ITwitchEventSubEventRaid
                this._onRaidCallback(event)
                break
            }
            default: {
                const message = `EventSub: unhandled event of type: ${eventMessage.metadata.subscription_type}`
                console.warn(message)
                // TODO: Handle more events
                // ModulesSingleton.getInstance().twitch._twitchChatOut.sendMessageToChannel(message)
            }
        }
    }
    // endregion
}

export interface ITwitchEventSubRewardCallback {
    (event: ITwitchEventSubEventRedemption):void
}
export interface ITwitchEventSubSubscriptionCallback {
    (event: ITwitchEventSubEventSubscription):void
}
export interface ITwitchEventSubGiftSubscriptionCallback {
    (event: ITwitchEventSubEventGiftSubscription):void
}
export interface ITwitchEventSubResubscriptionCallback {
    (event: ITwitchEventSubEventResubscription):void
}
export interface ITwitchEventSubCheerCallback {
    (event: ITwitchEventSubEventCheer):void
}
export interface ITwitchEventSubRaidCallback {
    (event: ITwitchEventSubEventRaid):void
}

export interface ITwitchReward {
    id?: string
    handler?: ActionHandler
}
export interface ITwitchCheer {
    bits: number
    handler?: ActionHandler
}

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
    'FULFILLED'
    | 'UNFULFILLED'
    | 'CANCELED'

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

export interface ITwitchEventSubEventResubscription {
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
    from_broadcaster_user_id: string
    from_broadcaster_user_login: string
    from_broadcaster_user_name: string
    to_broadcaster_user_id: string
    to_broadcaster_user_login: string
    to_broadcaster_user_name: string
    viewers: number
}
// endregion