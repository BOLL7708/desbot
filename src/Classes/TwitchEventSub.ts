import WebSockets from './WebSockets.js'
import Utils from './Utils.js'
import Color from './ColorConstants.js'
import {
    ITwitchEventSubMessageKeepAlive,
    ITwitchEventSubMetadata,
    ITwitchEventSubPayloadSession,
    ITwitchEventSubMessageSessionReconnect,
    ITwitchEventSubMessageWelcome,
    TTwitchEventSubSubscriptionType,
    ITwitchEventSubMessageRevocation,
    ITwitchEventSubMessageNotification,
    ITwitchEventSubSubscriptionPayload, ITwitchEventSubSubscriptionCondition, ITwitchEventSubEventRedemption
} from '../Interfaces/itwitch_eventsub.js'
import TwitchHelixHelper from './TwitchHelixHelper.js'

export default class TwitchEventSub {
    private _serverUrl: string = 'wss://eventsub-beta.wss.twitch.tv/ws'
    private _socket?: WebSockets
    private _sessionId: string = ''
    private _keepAliveSeconds: number = 0
    private _receivedMessageIds: string[] = []

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
            if(this._receivedMessageIds.indexOf(metaData.message_id) >= 0) {
                console.warn(`TwitchEventSub: Got a duplicate message of type: ${metaData.message_type}, id: ${metaData.message_id}`)
                return
            }
            this._receivedMessageIds.push(metaData.message_id)
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
                    const message = dataJson as ITwitchEventSubMessageNotification
                    this.onEvent(message)
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
            }, (this._keepAliveSeconds+1)*1000) // Give it some margin
        }
    }

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
                'beta'
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
            successes += await this.subscribe(
                'channel.subscribe',
                { broadcaster_user_id: broadcasterId.toString() }
            )
            successes += await this.subscribe(
                'channel.subscription.gift',
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

    private onEvent(eventMessage: ITwitchEventSubMessageNotification) {
        switch(eventMessage.metadata.subscription_type) {
            // TODO:
            //  Redemptions
            //  Follows
            //  Cheers
            //  Raids
            //  Subscriptions
            case 'channel.channel_points_custom_reward_redemption.add':
                const event = eventMessage.payload.event as ITwitchEventSubEventRedemption
                console.log('TwitchEventSub: Redemption', event)
                break
            default:
                console.warn(`TwitchEventSub: Unhandled subscription type: ${eventMessage.metadata.subscription_type}`)
        }
    }
}