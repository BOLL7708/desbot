class TwitchHelix {
    _baseUrl: string = 'https://api.twitch.tv/helix'
    _tokens: ITwitchTokens
    _userCache: Record<number, ITwitchHelixUsersResponseData> = {}
    _userId = Config.instance.twitch.userId

    constructor() {
        Settings.pullSetting(Settings.TWITCH_TOKENS, 'type', 'tokens')
            .then(tokenData => this._tokens = tokenData)
    }
    
    async getUser(id: number, skipCache: boolean = false) {
        if(!skipCache && this._userCache[id] != null) return this._userCache[id]
        let url = `${this._baseUrl}/users/?id=${id}`
        let headers = {
            Authorization: `Bearer ${this._tokens.access_token}`,
            'Client-Id': Config.instance.twitch.clientId
        }
        let response: ITwitchHelixUsersResponse = await (await fetch(url, {headers: headers}))?.json()
        let result: ITwitchHelixUsersResponseData = response?.data.find(d => parseInt(d.id) == id)
        if(result != null) this._userCache[id] = result
        return result
    }

    /**
     * Rewards is a big can of worms. 
     * 1. Set up all the rewards we want in the config, barebones.
     * 2. Load all current IDs from a settings file.
     * 3. If any reward is missing an ID, create it on Twitch.
     * 
     */
    async createReward(createData: ITwitchHelixRewardConfig):Promise<ITwitchHelixRewardResponse> {
        let url = `${this._baseUrl}/channel_points/custom_rewards?broadcaster_id=${this._userId}`
        let headers = {
            Authorization: `Bearer ${this._tokens.access_token}`,
            'Client-Id': Config.instance.twitch.clientId,
            'Content-Type': 'application/json'
        }
        let request = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(createData)
        }

        let response: ITwitchHelixRewardResponse = await fetch(url, request).then(res => res.json())
        return response
    }

    async getRewards():Promise<ITwitchHelixRewardResponse> {
        return this.getReward("")
    }

    async getReward(rewardId: string):Promise<ITwitchHelixRewardResponse> {
        let url = `${this._baseUrl}/channel_points/custom_rewards?broadcaster_id=${this._userId}&only_manageable_rewards=true`
        if(rewardId.length > 0) url += `&id=${rewardId}`
        let headers = {
            Authorization: `Bearer ${this._tokens.access_token}`,
            'Client-Id': Config.instance.twitch.clientId,
        }
        let response: ITwitchHelixRewardResponse = await fetch(url, {headers: headers}).then(res => res.json())
        return response
    }

    async updateReward(rewardId: string, updateData: ITwitchHelixRewardUpdate):Promise<ITwitchHelixRewardResponse> {
        let url = `${this._baseUrl}/channel_points/custom_rewards?broadcaster_id=${this._userId}&id=${rewardId}`
        let headers = {
            Authorization: `Bearer ${this._tokens.access_token}`,
            'Client-Id': Config.instance.twitch.clientId,
            'Content-Type': 'application/json'
        }
        let request = {
            method: 'PATCH',
            headers: headers,
            body: JSON.stringify(updateData)
        }

        let response: ITwitchHelixRewardResponse = await fetch(url, request).then(res => res.json())
        return response
    }

    async toggleRewards(kvp: Record<string, boolean>) {
        for(const key in kvp) {
            const pair:ITwitchRewardPair = await Settings.pullSetting(Settings.TWITCH_REWARDS, 'key', key)
            if(pair?.id != undefined) {
                this.updateReward(pair.id, {is_enabled: kvp[key]})
            }
        }
    }
}