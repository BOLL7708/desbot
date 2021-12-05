class TwitchTokens {
    async refreshToken() {
        // TODO: Refres hall tokens in the settings, but also add support for multiple tokens.
        let config:ITwitchConfig = Config.twitch
        let tokenData:ITwitchTokens[] = await Settings.getFullSettings(Settings.TWITCH_TOKENS)
        
        for await (let data of tokenData) {
            await fetch('https://id.twitch.tv/oauth2/token', {
                method: 'post',
                body: new URLSearchParams({
                    'grant_type': 'refresh_token',
                    'refresh_token': data.refresh_token,
                    'client_id': config.clientId,
                    'client_secret': config.clientSecret
                })
            }).then((response) => response.json()
            ).then(async json => {
                if (!json.error && !(json.status >= 300)) {
                    let tokenData = {
                        username: data.username,
                        access_token: json.access_token,
                        refresh_token: json.refresh_token,
                        updated: new Date().toLocaleString("swe")
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
}