import Utils from '../base/utils.js'
import Config from '../statics/config.js'
import Color from '../statics/colors.js'
import Settings from './settings.js'
import {ITwitchTokens} from '../interfaces/itwitch.js'

export default class TwitchTokens {
    /**
     * Load existing tokens for channel and chatbot (if different) and refresh them.
     */
    async refreshToken() {
        let channelTokenData = await Settings.pullSetting<ITwitchTokens>(Settings.TWITCH_CREDENTIALS, 'userName', Config.twitch.channelName)
        if(channelTokenData) await this.refresh(channelTokenData)
        else Utils.log(`TwitchTokens: No tokens for channel: ${Config.twitch.channelName} in _settings, load login.php to set them.`, Color.Purple)
        if(Config.twitch.channelName.toLowerCase() != Config.twitch.chatbotName.toLowerCase()) {
            let chatbotTokenData = await Settings.pullSetting<ITwitchTokens>(Settings.TWITCH_CREDENTIALS, 'userName', Config.twitch.chatbotName)
            if(chatbotTokenData) await this.refresh(chatbotTokenData)
            else Utils.log(`TwitchTokens: No tokens for chat bot: ${Config.twitch.channelName} in _settings, load login.php to set them.`, Color.Purple)
        } 
    }

    private async refresh(data: ITwitchTokens) {
        return fetch('https://id.twitch.tv/oauth2/token', {
            method: 'post',
            body: new URLSearchParams({
                'grant_type': 'refresh_token',
                'refresh_token': data.refreshToken,
                'client_id': data.clientId,
                'client_secret': data.clientSecret
            })
        }).then((response) => response.json()
        ).then(async json => {
            if (!json.error && !(json.status >= 300)) {
                let tokenData: ITwitchTokens = {
                    userName: data.userName,
                    accessToken: json.access_token,
                    refreshToken: json.refresh_token,
                    updated: new Date().toLocaleString("sv"),
                    clientId: data.clientId,
                    clientSecret: data.clientSecret
                }
                await Settings.pushSetting(Settings.TWITCH_CREDENTIALS, 'userName', tokenData).then(success => {
                    if(success) console.log(`Successfully refreshed tokens for ${data.userName} and wrote them to disk`);
                    else console.error(`Failed to save tokens for ${data.userName} to disk`);
                })
            } else {
                console.error(`Failed to refresh tokens for ${data.userName}: ${json.status} -> ${json.error}`);
            }
        })
    }
}