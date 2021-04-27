class TwitchPubsub {
    private _rewards: IPubsubReward[] = []
    private _socket: WebSockets;
    private _reconnectIntervalHandle: number;
    private _pingIntervalHandle: number;
    private _pingTimestamp: number;
    private _connected: boolean = false;
    private _tts: GoogleTTS = new GoogleTTS();

    registerOBSReward(twitchReward: ITwitchRewardConfig, source: IObsSourceConfig) {
        let reward: IPubsubReward = {
            id: twitchReward.id,
            callback: (data:any) => {
                console.log("OBS Reward triggered")
                // Should call OBS instance
                console.table(data)
            }
        }
        this._rewards.push(reward)
    }
    registerTTSReward(twitchReward: ITwitchRewardConfig, ttsCommand: String) {
        let reward: IPubsubReward = {
            id: twitchReward.id,
            callback: (data:any) => {
                console.log("TTS Reward triggered")
                // Should call TTS instance
                console.table(data)
                this._tts.enqueueSpeakSentence(
                    data?.redemption?.user_input,
                    data?.redemption?.user?.display_name,
                    parseInt(data?.redemption?.user?.id)
                )
            }
        }
        this._rewards.push(reward)
    }
    private onReward(id, data) {
        let reward = this._rewards.find(reward => id == reward.id)
        if(reward != null) reward.callback(data)
        else console.warn(`Reward not found: ${id}`)
    }

    init() {
        this._tts.init();
        this._socket = new WebSockets(
            "wss://pubsub-edge.twitch.tv",
            30,
            this.onOpen.bind(this),
            this.onClose.bind(this),
            this.onMessage.bind(this)
        )
        this._socket.init();
    }

    private onOpen(evt:any) {
        let config:ITwitchConfig = Config.instance.twitch
        let payload = {
            type: "LISTEN",
            nonce: "7708",
            data: {
                topics: [`channel-points-channel-v1.${config.userId}`], // ID should come from Helix user request (huh?)
                auth_token: config.token
            }
        }
        this._socket.send(JSON.stringify(payload))
        this._pingIntervalHandle = setInterval(this.ping.bind(this), 4*60*1000) // Ping at least every 5 minutes to keep the connection open
    }

    private onClose(evt:any) {
        clearInterval(this._pingIntervalHandle)
    }

    private onMessage(evt:any) {
        let data = JSON.parse(evt.data)
        switch(data.type) {
            case "MESSAGE": 
                let payload = JSON.parse(unescape(data?.data?.message))
                if (payload?.type == "reward-redeemed") {
                    console.log("Reward redeemed!")
                    let id = payload?.data?.redemption?.reward?.id ?? null
                    if(id !== null) this.onReward(id, payload?.data)
                    else console.log(payload)
                }
                break
            case "RECONNECT": 
                // Server is doing maintenance or similar and wants us to reconnect
                this._socket.reconnect()
                break
            case "PONG":
                // If a pong response is older than 10 seconds we are recommended to reconnect
                if(Date.now() - this._pingTimestamp > 10000) this._socket.reconnect()
                break
            case "RESPONSE":
                console.log(evt.data);
                break;
            default:
                console.log(`Unhandled message: ${data.type}`);
                break;
        }  
    }

    private ping() {
        let payload = {
            type: "PING"
        }
        this._socket.send(JSON.stringify(payload))
        this._pingTimestamp = Date.now()
    }
}