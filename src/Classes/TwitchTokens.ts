import Utils from './Utils.js'
import Config from './Config.js'
import Color from './ColorConstants.js'
import DataBaseHelper from './DataBaseHelper.js'
import {SettingTwitchClient, SettingTwitchTokens} from './SettingObjects.js'

export default class TwitchTokens {
    /**
     * Load existing tokens for channel and chatbot (if different) and refresh them.
     */
    async refreshToken() {
        let channelTokenData = await DataBaseHelper.load(new SettingTwitchTokens(), 'Channel')
        if(channelTokenData) await this.refresh(channelTokenData, 'Channel')
        else Utils.log(`TwitchTokens: No tokens for Channel user, load editor to login.`, Color.Purple)
        let chatbotTokenData = await DataBaseHelper.load(new SettingTwitchTokens(), 'Chatbot')
        if(chatbotTokenData) await this.refresh(chatbotTokenData, 'Chatbot')
        else Utils.log(`TwitchTokens: No tokens for Chatbot user, load editor to login.`, Color.Purple)
    }

    private async refresh(data: SettingTwitchTokens, key: string) {
        const clientData = await DataBaseHelper.load(new SettingTwitchClient(), 'Main')
        const response = await fetch('https://id.twitch.tv/oauth2/token', {
            method: 'post',
            body: new URLSearchParams({
                'grant_type': 'refresh_token',
                'refresh_token': data.refreshToken,
                'client_id': clientData?.clientId ?? '',
                'client_secret': clientData?.clientSecret ?? ''
            })
        })
        const json = await response.json()
        if (!json.error && !(json.status >= 300)) {
            data.accessToken = json.access_token
            data.refreshToken = json.refresh_token
            const success = await DataBaseHelper.save(data, key)
            if(success) console.log(`Successfully refreshed tokens for ${key} and stored them.`);
            else console.error(`Failed to save tokens for ${key}.`);
        } else {
            console.error(`Failed to refresh tokens for ${key}: ${json.status} -> ${json.error}`);
        }
    }
}