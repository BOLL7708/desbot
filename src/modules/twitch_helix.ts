class TwitchHelix {
    _baseUrl: string = 'https://api.twitch.tv/helix'
    _tokens: ITwitchTokens
    _userCache: Record<number, ITwitchHelixUsersResponseData> = {}
    _userNameToId: Record<string, number> = {}
    _userId = Config.twitch.userId
    _gameCache: Record<number, ITwitchHelixGamesResponseData> = {}

    constructor() {}

    async init() {
        return Settings.pullSetting(Settings.TWITCH_TOKENS, 'username', Config.twitch.botName).then(tokenData => this._tokens = tokenData)
    }
    
    async getUserByLogin(login: string, skipCache: boolean = false):Promise<ITwitchHelixUsersResponseData|null> {
        const id = this._userNameToId[login] ?? null;
        if(id != null && !skipCache && this._userCache[id] != null) return this._userCache[id]
        let url = `${this._baseUrl}/users/?login=${login}`
        return this.getUserByUrl(url)
    }

    async getUserById(id: number, skipCache: boolean = false):Promise<ITwitchHelixUsersResponseData|null> {
        if(!skipCache && this._userCache[id] != null) return this._userCache[id]
        let url = `${this._baseUrl}/users/?id=${id}`
        return this.getUserByUrl(url)
    }

    private async getUserByUrl(url: string):Promise<ITwitchHelixUsersResponseData|null> {
        let headers = {
            Authorization: `Bearer ${this._tokens.access_token}`,
            'Client-Id': Config.twitch.clientId
        }
        let response: ITwitchHelixUsersResponse = await (await fetch(url, {headers: headers}))?.json()
        let result: ITwitchHelixUsersResponseData = response?.data.pop()
        if(result != null) {
            const id = parseInt(result.id)
            if(id != NaN) {
                this._userCache[id] = result
                this._userNameToId[result.login] = id
            }
        }
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
            'Client-Id': Config.twitch.clientId,
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
            'Client-Id': Config.twitch.clientId,
        }
        let response: ITwitchHelixRewardResponse = await fetch(url, {headers: headers}).then(res => res.json())
        return response
    }

    async updateReward(rewardId: string, updateData: ITwitchHelixRewardUpdate):Promise<ITwitchHelixRewardResponse> {
        let url = `${this._baseUrl}/channel_points/custom_rewards?broadcaster_id=${this._userId}&id=${rewardId}`
        let headers = {
            Authorization: `Bearer ${this._tokens.access_token}`,
            'Client-Id': Config.twitch.clientId,
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

    async getClips(count: number = 20, pagination?: string) {
        count = Math.min(100, Math.max(1, count))
        let url = `${this._baseUrl}/clips/?broadcaster_id=${this._userId}&first=${count}`
        let headers = {
            Authorization: `Bearer ${this._tokens.access_token}`,
            'Client-Id': Config.twitch.clientId,
            'Content-Type': 'application/json'
        }

        let request = {
            method: 'GET',
            headers: headers
        }
        if(pagination != undefined) {
            url += `&after=${pagination}`
        }
        
        let response: ITwitchHelixClipResponse = await fetch(url, request).then(res => res.json())        
        return response
    }

    async getGameById(id: number, skipCache: boolean = false):Promise<ITwitchHelixGamesResponseData|null> {
        if(!skipCache && this._gameCache[id] != null) return this._gameCache[id]
        let url = `${this._baseUrl}/games/?id=${id}`
        return this.getGameByUrl(url)
    }

    private async getGameByUrl(url: string):Promise<ITwitchHelixGamesResponseData|null> {
        let headers = {
            Authorization: `Bearer ${this._tokens.access_token}`,
            'Client-Id': Config.twitch.clientId
        }
        let response: ITwitchHelixGamesResponse = await (await fetch(url, {headers: headers}))?.json()
        let result: ITwitchHelixGamesResponseData = response?.data.pop()
        if(result != null) {
            const id = parseInt(result.id)
            if(id != NaN) {
                this._gameCache[id] = result
            }
        }
        return result
    }
}