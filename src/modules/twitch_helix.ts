import {
    ITwitchHelixCategoriesResponseData,
    ITwitchHelixChannelRequest, ITwitchHelixChannelResponse,
    ITwitchHelixChannelResponseData,
    ITwitchHelixChatColorResponse,
    ITwitchHelixClipResponse,
    ITwitchHelixGamesResponse,
    ITwitchHelixGamesResponseData, ITwitchHelixRewardConfig, ITwitchHelixRewardResponse,
    ITwitchHelixRewardStates,
    ITwitchHelixRewardUpdate,
    ITwitchHelixUsersResponse,
    ITwitchHelixUsersResponseData
} from '../interfaces/itwitch_helix.js'
import Config from '../statics/config.js'
import Color from '../statics/colors.js'
import {ITwitchTokens} from '../interfaces/itwitch.js'
import Utils from '../base/utils.js'
import Settings, {SettingTwitchRedemption, SettingTwitchRewardPair} from './settings.js'
import {TKeys} from '../_data/!keys.js'

export default class TwitchHelix {
    _baseUrl: string = 'https://api.twitch.tv/helix'
    _userCache: Map<number, ITwitchHelixUsersResponseData> = new Map()
    _userNameToId: Map<string, number> = new Map()
    _gameCache: Map<number, ITwitchHelixGamesResponseData> = new Map()
    _channelUserTokens?: ITwitchTokens
    _channelCache: Map<number, ITwitchHelixChannelResponseData> = new Map()
    _userColorCache: Map<number, string> = new Map()
    static _channelUserId = -1

    constructor() {}

    async init() {
        await Settings.pullSetting<ITwitchTokens>(Settings.TWITCH_CREDENTIALS, 'userName', Config.twitch.channelName).then(tokenData => this._channelUserTokens = tokenData)
        const user = await this.getUserByLogin(Config.twitch.channelName, false)
        TwitchHelix._channelUserId = Utils.toInt(user?.id, -1)
    }

    private getAuthHeaders(): Headers {
        const headers = new Headers()
        headers.append('Authorization', `Bearer ${this._channelUserTokens?.accessToken}`)
        headers.append('client-id', this._channelUserTokens?.clientId ?? '')
        return headers
    }

    /**
     * Will return the user ID if it exists on Twitch.
     * @param idOrLogin The ID or login name as number or string.
     * @param skipCache Will skip cached data and always do the request.
     */
    private async getUserIdFromIdOrLogin(idOrLogin: number|string, skipCache: boolean = false): Promise<number|undefined> {
        let possibleId: number
        let verifiedId = NaN
        if(typeof idOrLogin === 'string') {
            possibleId = parseInt(idOrLogin)
            if(isNaN(possibleId)) {
                const user = await this.getUserByLogin(idOrLogin, skipCache)
                verifiedId = parseInt(user?.id ?? '')
            }
        } else possibleId = idOrLogin
        if(isNaN(verifiedId) && !isNaN(possibleId)) {
            const user = await this.getUserById(possibleId, skipCache)
            verifiedId = parseInt(user?.id ?? '')
        }
        return isNaN(verifiedId) ? undefined : verifiedId
    }
    
    async getUserByLogin(login: string, skipCache: boolean = false):Promise<ITwitchHelixUsersResponseData|undefined> {
        const id = this._userNameToId.get(login)
        if(id && !skipCache && this._userCache.has(id)) return this._userCache.get(id)
        const url = `${this._baseUrl}/users/?login=${login}`
        return this.getUserByUrl(url)
    }

    async getUserById(id: number, skipCache: boolean = false):Promise<ITwitchHelixUsersResponseData|undefined> {
        if(isNaN(id)) {
            Utils.log(`TwitchHelix: Invalid user id when trying to load user: ${id}`, Color.Red)
            return undefined
        }
        if(!skipCache && this._userCache.has(id)) return this._userCache.get(id)
        const url = `${this._baseUrl}/users/?id=${id}`
        return this.getUserByUrl(url)
    }

    private async getUserByUrl(url: string): Promise<ITwitchHelixUsersResponseData|undefined> {
        const response: ITwitchHelixUsersResponse = await (
            await fetch(url, {headers: this.getAuthHeaders()})
        )?.json()
        const result: ITwitchHelixUsersResponseData|undefined = response?.data?.pop()
        if(result) {
            const id = parseInt(result.id)
            if(!isNaN(id)) {
                this._userCache.set(id, result)
                this._userNameToId.set(result.login, id)
            }
        }
        return result
    }

    async getChannelByName(channel: string, skipCache: boolean = false):Promise<ITwitchHelixChannelResponseData|undefined> {
        if(channel.length == 0) return undefined
        const user = await this.getUserByLogin(channel, skipCache)
        return this.getChannelById(parseInt(user?.id ?? '0'), skipCache)
    }
    async getChannelById(id: number, skipCache: boolean = false): Promise<ITwitchHelixChannelResponseData|undefined> {
        if(isNaN(id) || id === 0) {
            Utils.log(`TwitchHelix: Invalid channel id when trying to load channel: ${id}`, Color.Red)
            return undefined
        }
        if(!skipCache && this._channelCache.has(id)) return this._channelCache.get(id)
        const url = `${this._baseUrl}/channels/?broadcaster_id=${id}`
        const headers = this.getAuthHeaders()
        const response = <ITwitchHelixChannelResponse> await fetch(url, {headers: headers}).then(res => res.json())
        const result = response?.data?.pop()
        if(result) this._channelCache.set(id, result)
        return result
    }
    /**
     * Rewards is a big can of worms. 
     * 1. Set up all the rewards we want in the config, barebones.
     * 2. Load all current IDs from a settings file.
     * 3. If any reward is missing an ID, create it on Twitch.
     */
    async createReward(createData: ITwitchHelixRewardConfig):Promise<ITwitchHelixRewardResponse> {
        const url = `${this._baseUrl}/channel_points/custom_rewards?broadcaster_id=${TwitchHelix._channelUserId}`
        const headers = this.getAuthHeaders()
        headers.append('Content-Type', 'application/json')
        const request = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(createData)
        }

        return await fetch(url, request)
            .then(res => res.json())
            .catch(error => {
                Utils.log(`TwitchHelix: Error creating reward:${error}`, Color.Red)
            })
    }

    async getRewards():Promise<ITwitchHelixRewardResponse> {
        return this.getReward("")
    }

    async getReward(rewardId: string):Promise<ITwitchHelixRewardResponse> {
        let url = `${this._baseUrl}/channel_points/custom_rewards?broadcaster_id=${TwitchHelix._channelUserId}&only_manageable_rewards=true`
        if(rewardId.length > 0) url += `&id=${rewardId}`
        return await fetch(url, {headers: this.getAuthHeaders()}).then(res => res.json())
    }

    async updateReward(rewardId: string|undefined, updateData: ITwitchHelixRewardUpdate):Promise<ITwitchHelixRewardResponse|null> {
        if(rewardId == null) {
            console.warn("Tried to update reward but the ID is null")
            return new Promise<null>(resolve => resolve(null))
        }
        const url = `${this._baseUrl}/channel_points/custom_rewards?broadcaster_id=${TwitchHelix._channelUserId}&id=${rewardId}`
        const headers = this.getAuthHeaders()
        headers.append('Content-Type', 'application/json')
        const request = {
            method: 'PATCH',
            headers: headers,
            body: JSON.stringify(updateData)
        }
        let response: ITwitchHelixRewardResponse = await fetch(url, request).then(res => res.json())
        if(response.status == 500) { // Retry once if the server broke
            Utils.log(`Failed to update Twitch reward ${rewardId}: ${response.error}(${response.status}) [${response.message}] retrying once.`, Color.OrangeRed)
            response = await fetch(url, request).then(res => res.json())
        }
        if(response.error != undefined) Utils.log(`Failed to update Twitch reward ${rewardId}: ${response.error}(${response.status}) [${response.message}]`, Color.Red)
        return response
    }

    async toggleRewards(rewards: ITwitchHelixRewardStates|TKeys[]): Promise<ITwitchHelixRewardStates> {
        const result: ITwitchHelixRewardStates = {}
        if(Array.isArray(rewards)) {
            for(const key of rewards) {
                const id = await Utils.getRewardId(key)
                if(id) {
                    const reward = await this.getReward(id)
                    const rewardData = reward?.data?.getSpecific(0)
                    const isEnabled = rewardData?.is_enabled ?? null
                    const updated = await this.updateReward(id, {is_enabled: !isEnabled})
                    if(updated !== null ) result[key] = !isEnabled
                }
            }
        } else {
            for(const [key, state] of Object.entries(rewards) as [TKeys, boolean][]) {
                const id = await Utils.getRewardId(key)
                if(id) {
                    const updated = await this.updateReward(id, {is_enabled: state})
                    if(updated !== null) result[key] = state
                }
            }
        }
        return result
    }

    async getClips(count: number = 20, pagination?: string): Promise<ITwitchHelixClipResponse> {
        count = Math.min(100, Math.max(1, count))
        let url = `${this._baseUrl}/clips/?broadcaster_id=${TwitchHelix._channelUserId}&first=${count}`
        const headers = this.getAuthHeaders()
        headers.append('Content-Type', 'application/json')
        const request = {
            headers: headers
        }
        if(pagination != undefined) {
            url += `&after=${pagination}`
        }
        return await fetch(url, request).then(res => res.json())
    }

    async getGameById(id: number, skipCache: boolean = false):Promise<ITwitchHelixGamesResponseData|undefined> {
        if(!skipCache && this._gameCache.has(id)) return this._gameCache.get(id)
        const url = `${this._baseUrl}/games/?id=${id}`
        return this.getGameByUrl(url)
    }

    private async getGameByUrl(url: string):Promise<ITwitchHelixGamesResponseData|undefined> {
        let response: ITwitchHelixGamesResponse = await (await fetch(url, {headers: this.getAuthHeaders()}))?.json()
        const result: ITwitchHelixGamesResponseData|undefined = response?.data.pop()
        if(result) {
            const id = parseInt(result.id)
            if(!isNaN(id)) {
                this._gameCache.set(id,  result)
            }
        }
        return result
    }

    async searchForGame(gameTitle: string, pagination?: string):Promise<ITwitchHelixCategoriesResponseData|null> {
        // https://dev.twitch.tv/docs/api/reference#search-categories
        const url = `https://api.twitch.tv/helix/search/categories?query=${gameTitle}&first=1`
        let headers = {
            Authorization: `Bearer ${this._channelUserTokens?.accessToken}`,
            'Client-Id': this._channelUserTokens?.clientId ?? ''
        }
        let response: ITwitchHelixGamesResponse = await (await fetch(url, {headers: headers}))?.json()
        return response?.data.pop() ?? null
    }

    async updateChannelInformation(channelInformation: ITwitchHelixChannelRequest):Promise<boolean> {
        // https://dev.twitch.tv/docs/api/reference#modify-channel-information
        const url = `https://api.twitch.tv/helix/channels?broadcaster_id=${TwitchHelix._channelUserId}`
        const headers = this.getAuthHeaders()
        headers.append('Content-Type', 'application/json')
        const request = {
            method: 'PATCH',
            headers: headers, 
            body: JSON.stringify(channelInformation)
        }
        const response = await fetch(url, request)
        return response != null && response.status == 204
    }

    async updateRedemption(redemption: SettingTwitchRedemption):Promise<boolean> {
        // https://dev.twitch.tv/docs/api/reference#update-redemption-status
        const rewardPair = await Settings.pullSetting<SettingTwitchRewardPair>(Settings.TWITCH_REWARDS, 'id', redemption.rewardId)
        if(rewardPair) {
            const eventConfig = Utils.getEventConfig(rewardPair.key)
            if(eventConfig && eventConfig.options?.rewardIgnoreClearRedemptionsCommand === true) {
                Utils.log(`Skipping updating redemption for: ${rewardPair.key}`, Color.BlueViolet)
                return false
            }
        }
        const url = `https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${TwitchHelix._channelUserId}&reward_id=${redemption.rewardId}&id=${redemption.redemptionId}`
        const headers = this.getAuthHeaders()
        headers.append('Content-Type', 'application/json')
        const request = {
            method: 'PATCH',
            headers: headers, 
            body: JSON.stringify({status: redemption.status})
        }
        const response = await fetch(url, request)
        return response != null && response.status == 200
    }

    async raidChannel(channelId: string): Promise<boolean> {
        // https://dev.twitch.tv/docs/api/reference#start-a-raid
        const url = `https://api.twitch.tv/helix/raids?from_broadcaster_id=${TwitchHelix._channelUserId}&to_broadcaster_id=${channelId}`
        const headers = this.getAuthHeaders()
        const request = {
            method: 'POST',
            headers: headers
        }
        const response = await fetch(url, request)
        return response != null && response.status == 200
    }

    async cancelRaid(): Promise<boolean> {
        const url = `https://api.twitch.tv/helix/raids?broadcaster_id=${TwitchHelix._channelUserId}`
        const headers = this.getAuthHeaders()
        const request = {
            method: 'DELETE',
            headers: headers
        }
        const response = await fetch(url, request)
        return response != null && response.status == 204
    }

    /**
     * Gets the user color if available, else undefined.
     * @param userIdOrLogin
     * @param skipCache
     */
    async getUserColor(userIdOrLogin: number|string, skipCache: boolean = false): Promise<string|undefined> {
        const userId = await this.getUserIdFromIdOrLogin(userIdOrLogin, skipCache)
        if(userId) {
            if(this._userColorCache.has(userId) && !skipCache) {
                return this._userColorCache.get(userId)
            }
            const url = `https://api.twitch.tv/helix/chat/color?user_id=${userId}`
            const headers = this.getAuthHeaders()
            const request = {
                method: 'GET',
                headers: headers
            }
            const response = await fetch(url, request)
            const json: ITwitchHelixChatColorResponse = await response.json()
            if(json && Array.isArray(json.data) && json.data.length > 0) {
                const colorData = json.data.pop()
                if(colorData && colorData.color.length > 0) {
                    this._userColorCache.set(parseInt(colorData.user_id), colorData.color)
                    return colorData.color
                }
                else Utils.log(`TwitchHelix: Color data was empty for: ${userIdOrLogin}`, Color.Red)
            } else Utils.log(`TwitchHelix: Color response was invalid for: ${userIdOrLogin}`, Color.Red)
        }
        Utils.log(`TwitchHelix: Color request could not get data for: ${userIdOrLogin}`, Color.DarkRed)
        return undefined
    }
}