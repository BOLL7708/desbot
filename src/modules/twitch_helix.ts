class TwitchHelix {
    _baseUrl: string = 'https://api.twitch.tv/helix'
    _userCache: Record<number, ITwitchHelixUsersResponseData> = {}
    _userNameToId: Record<string, number> = {}
    _gameCache: Record<number, ITwitchHelixGamesResponseData> = {}
    _channelUserTokens: ITwitchTokens
    static _channelUserId = -1

    constructor() {}

    async init() {
        await Settings.pullSetting(Settings.TWITCH_TOKENS, 'username', Config.twitch.channelName).then(tokenData => this._channelUserTokens = tokenData)
        const user = await this.getUserByLogin(Config.twitch.channelName, false)
        TwitchHelix._channelUserId = parseInt(user.id)
    }
    
    async getUserByLogin(login: string, skipCache: boolean = false):Promise<ITwitchHelixUsersResponseData|null> {
        const id = this._userNameToId[login] ?? null;
        if(id != null && !skipCache && this._userCache[id] != null) return this._userCache[id]
        const url = `${this._baseUrl}/users/?login=${login}`
        return this.getUserByUrl(url)
    }

    async getUserById(id: number, skipCache: boolean = false):Promise<ITwitchHelixUsersResponseData|null> {
        if(!skipCache && this._userCache[id] != null) return this._userCache[id]
        const url = `${this._baseUrl}/users/?id=${id}`
        return this.getUserByUrl(url)
    }

    private async getUserByUrl(url: string):Promise<ITwitchHelixUsersResponseData|null> {
        const headers = {
            Authorization: `Bearer ${this._channelUserTokens.access_token}`,
            'Client-Id': Config.twitch.clientId
        }
        const response: ITwitchHelixUsersResponse = await (await fetch(url, {headers: headers}))?.json()
        const result: ITwitchHelixUsersResponseData = response?.data.pop()
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
     */
    async createReward(createData: ITwitchHelixRewardConfig):Promise<ITwitchHelixRewardResponse> {
        let url = `${this._baseUrl}/channel_points/custom_rewards?broadcaster_id=${TwitchHelix._channelUserId}`
        const headers = {
            Authorization: `Bearer ${this._channelUserTokens.access_token}`,
            'Client-Id': Config.twitch.clientId,
            'Content-Type': 'application/json'
        }
        const request = {
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
        let url = `${this._baseUrl}/channel_points/custom_rewards?broadcaster_id=${TwitchHelix._channelUserId}&only_manageable_rewards=true`
        if(rewardId.length > 0) url += `&id=${rewardId}`
        const headers = {
            Authorization: `Bearer ${this._channelUserTokens.access_token}`,
            'Client-Id': Config.twitch.clientId,
        }
        const response: ITwitchHelixRewardResponse = await fetch(url, {headers: headers}).then(res => res.json())
        return response
    }

    async updateReward(rewardId: string|null, updateData: ITwitchHelixRewardUpdate):Promise<ITwitchHelixRewardResponse|null> {
        if(rewardId == null) {
            console.warn("Tried to update reward but the ID is null")
            return new Promise<null>(resolve => resolve(null))
        }
        const url = `${this._baseUrl}/channel_points/custom_rewards?broadcaster_id=${TwitchHelix._channelUserId}&id=${rewardId}`
        const headers = {
            Authorization: `Bearer ${this._channelUserTokens.access_token}`,
            'Client-Id': Config.twitch.clientId,
            'Content-Type': 'application/json'
        }
        const request = {
            method: 'PATCH',
            headers: headers,
            body: JSON.stringify(updateData)
        }
        let response: ITwitchHelixRewardResponse = await fetch(url, request).then(res => res.json())
        if(response.error != undefined) Utils.log(`Failed to update Twitch reward ${rewardId}: ${response.error}(${response.status}) -> ${response.message}`, Color.Red)
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
        let url = `${this._baseUrl}/clips/?broadcaster_id=${TwitchHelix._channelUserId}&first=${count}`
        const headers = {
            Authorization: `Bearer ${this._channelUserTokens.access_token}`,
            'Client-Id': Config.twitch.clientId,
            'Content-Type': 'application/json'
        }
        const request = {
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
        const url = `${this._baseUrl}/games/?id=${id}`
        return this.getGameByUrl(url)
    }

    private async getGameByUrl(url: string):Promise<ITwitchHelixGamesResponseData|null> {
        let headers = {
            Authorization: `Bearer ${this._channelUserTokens.access_token}`,
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

    async searchForGame(gameTitle: string, pagination?: string):Promise<ITwitchHelixCategoriesResponseData|null> {
        // https://dev.twitch.tv/docs/api/reference#search-categories
        const url = `https://api.twitch.tv/helix/search/categories?query=${gameTitle}&first=1`
        let headers = {
            Authorization: `Bearer ${this._channelUserTokens.access_token}`,
            'Client-Id': Config.twitch.clientId
        }
        let response: ITwitchHelixGamesResponse = await (await fetch(url, {headers: headers}))?.json()
        let result: ITwitchHelixGamesResponseData = response?.data.pop()
        return result        
    }

    async updateChannelInformation(channelInformation: ITwitchHelixChannelRequest):Promise<boolean> {
        // https://dev.twitch.tv/docs/api/reference#modify-channel-information
        const url = `https://api.twitch.tv/helix/channels?broadcaster_id=${TwitchHelix._channelUserId}`
        const headers = {
            Authorization: `Bearer ${this._channelUserTokens.access_token}`,
            'Client-Id': Config.twitch.clientId,
            'Content-Type': 'application/json'
        }
        const request = {
            method: 'PATCH',
            headers: headers, 
            body: JSON.stringify(channelInformation)
        }
        const response = await fetch(url, request)
        const success = response != null && response.status == 204
        return success
    }
}