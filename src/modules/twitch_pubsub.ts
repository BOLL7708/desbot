class TwitchPubsub {
    private _rewards: IPubsubReward[] = []
    private _socket: WebSockets
    private _config:ITwitchConfig = Config.instance.twitch;
    private _pingIntervalHandle: number
    private _pingTimestamp: number

    registerAward(pubsubReward: IPubsubReward) {
        this._rewards.push(pubsubReward)
    }
    
    private onReward(id, data) {
        let reward = this._rewards.find(reward => id == reward.id)
        if(reward != null) reward.callback(data)
        else console.warn(`Reward not found: ${id}`)
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
        this.refreshToken()
    }

    private onOpen(evt:any) {
        Settings.pullSetting(Settings.TWITCH_TOKENS, 'type', 'tokens').then(tokenData => {
            let payload = {
                type: "LISTEN",
                nonce: "7708",
                data: {
                    topics: [`channel-points-channel-v1.${this._config.userId}`], // ID should come from Helix user request (huh?)
                    auth_token: tokenData.access_token
                }
            }
            this._socket.send(JSON.stringify(payload))
            this._pingIntervalHandle = setInterval(this.ping.bind(this), 4*60*1000) // Ping at least every 5 minutes to keep the connection open
        })
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
                console.log(evt.data)
                break;
            default:
                console.log(`Unhandled message: ${data.type}`)
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

    private async refreshToken() {
        let config = Config.instance.twitch
        let tokenData:ITwitchTokens = await Settings.pullSetting(Settings.TWITCH_TOKENS, 'type', 'tokens')
        fetch('https://id.twitch.tv/oauth2/token', {
            method: 'post',
            body: new URLSearchParams({
                'grant_type': 'refresh_token',
                'refresh_token': tokenData.refresh_token,
                'client_id': config.clientId,
                'client_secret': config.clientSecret
            })
        }).then((response) => response.json()).then(json => {
            if (!json.error && !(json.status >= 300)) {
                let tokenData = {
                    type: 'tokens',
                    access_token: json.access_token,
                    refresh_token: json.refresh_token,
                    updated: new Date().toLocaleString("swe")
                }
                Settings.pushSetting(Settings.TWITCH_TOKENS, 'type', tokenData).then(success => {
                    if(success) console.log('Successfully refreshed and wrote tokens to disk');
                    else console.error('Failed to save tokens to disk');
                })
            } else {
                console.error(`Failed to refresh tokens: ${json.status} -> ${json.error}`);
            }
            return json.access_token;
        });
    }
}