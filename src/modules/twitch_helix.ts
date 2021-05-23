class TwitchHelix {
    _baseUrl: string = 'https://api.twitch.tv/helix'
    _tokens: ITwitchTokens

    constructor() {
        Settings.pullSetting(Settings.TWITCH_TOKENS, 'type', 'tokens')
            .then(tokenData => this._tokens = tokenData)
    }
    
    async getUser(id: number) {
        let url = `${this._baseUrl}/users/?id=${id}`
        let headers = {
            Authorization: `Bearer ${this._tokens.access_token}`,
            'Client-Id': Config.instance.twitch.clientId
        }
        let response: ITwitchHelixUsersResponse = await (await fetch(url, {headers: headers}))?.json()
        let result: ITwitchHelixUsersResponseData = response?.data.find(d => parseInt(d.id) == id)
        return result
    }
}