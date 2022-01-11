class TwitchTokens {
    async refreshToken() {
        // Load tokens from settings, and if they don't exist use the ones in Secure, which should be added for the first run.
        let channelTokenData = await Settings.pullSetting(Settings.TWITCH_TOKENS, 'username', Config.twitch.channelName)
        if(channelTokenData == null) channelTokenData = {
            username: Config.twitch.channelName, 
            access_token: Config.credentials.TwitchChannelAccessToken, 
            refresh_token: Config.credentials.TwitchChannelRefreshToken, 
            updated: ''
        }
        await this.refresh(channelTokenData)
        if(Config.twitch.channelName.toLowerCase() != Config.twitch.chatbotName.toLowerCase()) {
            let chatbotTokenData = await Settings.pullSetting(Settings.TWITCH_TOKENS, 'username', Config.twitch.chatbotName)
            if(chatbotTokenData == null) chatbotTokenData = {
                username: Config.twitch.chatbotName, 
                access_token: Config.credentials.TwitchChatbotAccessToken, 
                refresh_token: Config.credentials.TwitchChatbotRefreshToken, 
                updated: ''
            }
            await this.refresh(chatbotTokenData)
        }
    }

    private async refresh(data: ITwitchTokens) {
        return fetch('https://id.twitch.tv/oauth2/token', {
            method: 'post',
            body: new URLSearchParams({
                'grant_type': 'refresh_token',
                'refresh_token': data.refresh_token,
                'client_id': Config.credentials.TwitchClientID,
                'client_secret': Config.credentials.TwitchClientSecret
            })
        }).then((response) => response.json()
        ).then(async json => {
            if (!json.error && !(json.status >= 300)) {
                let tokenData = {
                    username: data.username,
                    access_token: json.access_token,
                    refresh_token: json.refresh_token,
                    updated: new Date().toLocaleString("sv")
                }
                await Settings.pushSetting(Settings.TWITCH_TOKENS, 'username', tokenData).then(success => {
                    if(success) console.log(`Successfully refreshed tokens for ${data.username} and wrote them to disk`);
                    else console.error(`Failed to save tokens for ${data.username} to disk`);
                })
            } else {
                console.error(`Failed to refresh tokens for ${data.username}: ${json.status} -> ${json.error}`);
            }
        })
    }
}