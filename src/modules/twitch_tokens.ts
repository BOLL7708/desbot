class TwitchTokens {
    refresh() {
        this.refreshToken()
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