class TwitchHelix {
    _baseUrl: string = 'https://api.twitch.tv/helix'
    _tokens: ITwitchTokens
    _userCache: Record<number, ITwitchHelixUsersResponseData> = {}

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
}