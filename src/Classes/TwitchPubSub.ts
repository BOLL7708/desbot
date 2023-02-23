import {ITwitchCheer, ITwitchReward} from '../Interfaces/itwitch.js'
import {
    ITwitchPubsubCheerCallback,
    ITwitchPubsubCheerMessage,
    ITwitchPubsubMessage,
    ITwitchPubsubRewardCallback,
    ITwitchPubsubRewardMessage,
    ITwitchPubsubSubscriptionCallback,
    ITwitchPubsubSubscriptionMessage
} from '../Interfaces/itwitch_pubsub.js'
import {Actions} from '../Pages/Widget/Actions.js'
import Color from './ColorConstants.js'
import WebSockets from './WebSockets.js'
import Utils from './Utils.js'
import DataBaseHelper from './DataBaseHelper.js'
import {SettingTwitchRedemption, SettingTwitchTokens} from '../Objects/Setting/Twitch.js'

export default class TwitchPubSub {
    private LOG_COLOR: string = 'teal'
    private _socket?: WebSockets
    private _pingIntervalHandle?: number
    private _pingTimestamp: number = 0
    private _onRewardCallback: ITwitchPubsubRewardCallback = (message) => { console.log('PubSub Reward unhandled') }
    private _onSubscriptionCallback: ITwitchPubsubSubscriptionCallback = (message) => { console.log('PubSub Subscription unhandled') }
    private _onCheerCallback: ITwitchPubsubCheerCallback = (message) => { console.log('PubSub Cheer unhandled') }
    
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

    setOnRewardCallback(callback: ITwitchPubsubRewardCallback) {
        this._onRewardCallback = callback
    }
    setOnSubscriptionCallback(callback: ITwitchPubsubSubscriptionCallback) {
        this._onSubscriptionCallback = callback
    }
    setOnCheerCallback(callback: ITwitchPubsubCheerCallback) {
        this._onCheerCallback = callback
    }

    init() {
        this._socket = new WebSockets(
            "wss://pubsub-edge.twitch.tv",
            30,
            false,
            this.onOpen.bind(this),
            this.onClose.bind(this),
            this.onMessage.bind(this)
        )
        this._socket.init()
    }

    private async onOpen(evt:any) {
        const tokenData = await DataBaseHelper.load(new SettingTwitchTokens(), 'Channel')
        const userId = tokenData?.userId ?? 0
        let payload = {
            type: "LISTEN",
            nonce: "7708",
            data: {
                topics: [
                    `channel-points-channel-v1.${userId}`,
                    `channel-subscribe-events-v1.${userId}`,
                    `channel-bits-events-v2.${userId}`
                ],
                auth_token: tokenData?.accessToken
            }
        }
        this._socket?.send(JSON.stringify(payload))
        this._pingIntervalHandle = setInterval(this.ping.bind(this), 4*60*1000) // Ping at least every 5 minutes to keep the connection open
        Utils.log('PubSub connected', this.LOG_COLOR, true, true)
    }

    private onClose(evt:any) {
        clearInterval(this._pingIntervalHandle)
        Utils.log('PubSub disconnected', this.LOG_COLOR, true, true)
    }

    private async onMessage(evt:any) {
        const msg: ITwitchPubsubMessage = JSON.parse(evt.data)
        const topic = Utils.removeLastPart('-', msg?.data?.topic)
        switch(msg.type) {
            case "MESSAGE":
                switch(topic) {
                    case 'channel-points-channel': 
                        let rewardMessage: ITwitchPubsubRewardMessage = JSON.parse(Utils.unescapeQuotes(msg?.data?.message))
                        switch(rewardMessage.type) {
                            case 'reward-redeemed': 
                                const id = rewardMessage?.data?.redemption?.reward?.id ?? null
                                const redemption = rewardMessage?.data?.redemption
                                if(redemption && redemption.status == 'UNFULFILLED') {
                                    const redemptionStatus = new SettingTwitchRedemption()
                                    redemptionStatus.userId = parseInt(redemption.user?.id) ?? 0
                                    redemptionStatus.rewardId = redemption.reward?.id
                                    redemptionStatus.time = redemption.redeemed_at
                                    redemptionStatus.status = redemption.status
                                    redemptionStatus.cost = redemption.reward?.cost
                                    await DataBaseHelper.save(redemptionStatus, redemption.id)
                                }
                                Utils.log(`Reward redeemed! (${id})`, this.LOG_COLOR)
                                if(id !== null) this._onRewardCallback(id, rewardMessage)
                                
                                // Event
                                const reward = this._rewards.get(id)
                                if(reward?.handler) reward.handler.call(await Actions.buildUserDataFromRedemptionMessage(reward.handler.key, rewardMessage)).then()
                                else console.warn(`Reward not found: ${id}`)
                                break
                            default:
                                Utils.log(`Unknown PubSub message type: ${rewardMessage.type}`, this.LOG_COLOR)
                                console.log(rewardMessage)
                                break
                        }
                        break
                    case 'channel-subscribe-events': 
                        let subscriptionMessage: ITwitchPubsubSubscriptionMessage = JSON.parse(Utils.unescapeQuotes(msg?.data?.message))
                        console.log(msg)
                        console.log(subscriptionMessage)
                        this._onSubscriptionCallback(subscriptionMessage)
                        break
                    case 'channel-bits-events': 
                    let cheerMessage: ITwitchPubsubCheerMessage = JSON.parse(Utils.unescapeQuotes(msg?.data?.message))
                        console.log(msg)
                        console.log(cheerMessage)
                        this._onCheerCallback(cheerMessage)

                        // Event
                        const cheer = this._cheers.get(cheerMessage.data?.bits_used)
                        if(cheer?.handler) cheer.handler.call(await Actions.buildUserDataFromCheerMessage(cheer.handler.key, cheerMessage)).then()
                        else console.warn(`Cheer not found: ${cheerMessage.data?.bits_used}, the cheer might just not exist!`)

                        break
                }
                break
            case "RECONNECT":
                // Server is doing maintenance or similar and wants us to reconnect
                this._socket?.reconnect()
                break
            case "PONG":
                // If a pong response is older than 10 seconds we are recommended to reconnect
                if(Date.now() - this._pingTimestamp > 10000) this._socket?.reconnect()
                break
            case "RESPONSE":
                Utils.log(evt.data, this.LOG_COLOR)
                break;
            default:
                Utils.log(`Unhandled message: ${msg.type}`, this.LOG_COLOR)
                break;
        }
    }

    private ping() {
        let payload = {
            type: "PING"
        }
        this._socket?.send(JSON.stringify(payload))
        this._pingTimestamp = Date.now()
    }
}