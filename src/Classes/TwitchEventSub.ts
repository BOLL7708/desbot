import WebSockets from './WebSockets.js'
import Utils from './Utils.js'
import Color from './ColorConstants.js'
import {
    ITwitchEventSubEventCheer,
    ITwitchEventSubEventGiftSubscription,
    ITwitchEventSubEventRaid,
    ITwitchEventSubEventRedemption,
    ITwitchEventSubEventSubscription,
    ITwitchEventSubEventResubscription,
    ITwitchEventSubMessageKeepAlive,
    ITwitchEventSubMessageNotification,
    ITwitchEventSubMessageRevocation,
    ITwitchEventSubMessageSessionReconnect,
    ITwitchEventSubMessageWelcome,
    ITwitchEventSubMetadata,
    ITwitchEventSubSubscriptionCondition,
    ITwitchEventSubSubscriptionPayload,
    TTwitchEventSubSubscriptionType
} from '../Interfaces/itwitch_eventsub.js'
import TwitchHelixHelper from './TwitchHelixHelper.js'
import ModulesSingleton from '../Singletons/ModulesSingleton.js'
import {ITwitchCheer, ITwitchReward} from '../Interfaces/itwitch.js'
import {SettingTwitchRedemption} from '../Objects/Setting/Twitch.js'
import DataBaseHelper from './DataBaseHelper.js'
import {Actions} from '../Pages/Widget/Actions.js'

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

    private _timeoutHandle: number = 0

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
                Utils.log(`TwitchEventSub: Reward redeemed! (${redemptionId})`, this.LOG_COLOR)
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
                const broadcasterId = (await TwitchHelixHelper.getBroadcasterUserId()).toString()
                if(event.to_broadcaster_user_id == broadcasterId) {
                    const message = `@${event.from_broadcaster_user_name} raided the channel with ${event.viewers} viewer(s)! (this is a test)`
                    console.log(message)
                    // TODO: Make customizable
                    // ModulesSingleton.getInstance().twitch._twitchChatOut.sendMessageToChannel(message)
                }
                if (event.from_broadcaster_user_id == broadcasterId) {
                    const message = `This channel raided @${event.to_broadcaster_user_name} with ${event.viewers} viewer(s)! (this is a test)`
                    console.log(message)
                    // TODO: Make customizable
                    // ModulesSingleton.getInstance().twitch._twitchChatOut.sendMessageToChannel(message)
                }
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
