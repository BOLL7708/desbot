class TwitchPubsub {
    private LOG_COLOR: string = 'teal'
    private _socket?: WebSockets
    private _config: ITwitchConfig = Config.twitch
    private _pingIntervalHandle?: number
    private _pingTimestamp: number = 0
    private _onRewardCallback: ITwitchPubsubRewardCallback = (message) => { console.log('PubSub Reward unhandled') }
    
    setOnRewardCallback(callback: ITwitchPubsubRewardCallback) {
        this._onRewardCallback = callback
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

    private onOpen(evt:any) {
        Settings.pullSetting<ITwitchTokens>(Settings.TWITCH_TOKENS, 'username', Config.twitch.channelName).then(tokenData => {
            let payload = {
                type: "LISTEN",
                nonce: "7708",
                data: {
                    topics: [
                        `channel-points-channel-v1.${TwitchHelix._channelUserId}`,
                        `channel-subscribe-events-v1.${TwitchHelix._channelUserId}`,
                        `channel-bits-events-v2.${TwitchHelix._channelUserId}`,
                        
                    ],
                    auth_token: tokenData?.access_token
                }
            }
            this._socket?.send(JSON.stringify(payload))
            this._pingIntervalHandle = setInterval(this.ping.bind(this), 4*60*1000) // Ping at least every 5 minutes to keep the connection open
            Utils.log('PubSub connected', this.LOG_COLOR, true, true)
        })
    }

    private onClose(evt:any) {
        clearInterval(this._pingIntervalHandle)
        Utils.log('PubSub disconnected', this.LOG_COLOR, true, true)
    }

    private onMessage(evt:any) {
        const msg: ITwitchPubsubMessage = JSON.parse(evt.data)
        const topic = Utils.removeLastPart('-', msg?.data?.topic)
        switch(msg.type) {
            case "MESSAGE":
                switch(topic) {
                    case 'channel-points-channel': 
                        let rewardMessage: ITwitchPubsubRewardMessage = JSON.parse(decodeURI(msg?.data?.message))
                        switch(rewardMessage.type) {
                            case 'reward-redeemed': 
                                const id = rewardMessage?.data?.redemption?.reward?.id ?? null
                                if(id !== null) this._onRewardCallback(id, rewardMessage)
                                Utils.log(`Reward redeemed! (${id})`, this.LOG_COLOR)
                                break
                            default:
                                Utils.log(`Unknown PubSub message type: ${rewardMessage.type}`, this.LOG_COLOR)
                                console.log(rewardMessage)
                                break
                        }
                        break
                    case 'channel-subscribe-events': 
                        console.log(msg)
                        break
                    case 'channel-bits-events': 
                        console.log(msg)
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