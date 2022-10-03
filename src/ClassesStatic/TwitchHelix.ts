import {
    ITwitchHelixCategoriesResponseData,
    ITwitchHelixChannelRequest,
    ITwitchHelixChannelResponse,
    ITwitchHelixChannelResponseData,
    ITwitchHelixChatColorResponse,
    ITwitchHelixClipResponse,
    ITwitchHelixGamesResponse,
    ITwitchHelixGamesResponseData,
    ITwitchHelixRewardConfig,
    ITwitchHelixRewardResponse,
    ITwitchHelixRewardStates,
    ITwitchHelixRewardUpdate,
    ITwitchHelixUsersResponse,
    ITwitchHelixUsersResponseData
} from '../interfaces/itwitch_helix.js'
import Color from './colors.js'
import Utils from '../widget/utils.js'
import {TKeys} from '../_data/!keys.js'
import {SettingTwitchClient, SettingTwitchRedemption, SettingTwitchTokens} from '../Classes/settings.js'
import DB from './DB.js'

export default class TwitchHelix {
    static _baseUrl: string = 'https://api.twitch.tv/helix'
    static _userCache: Map<number, ITwitchHelixUsersResponseData> = new Map()
    static _userNameToId: Map<string, number> = new Map()
    static _gameCache: Map<number, ITwitchHelixGamesResponseData> = new Map()
    static _channelCache: Map<number, ITwitchHelixChannelResponseData> = new Map()
    static _userColorCache: Map<number, string> = new Map()

    private static async getAuthHeaders(): Promise<Headers> {
        const tokens = await DB.loadSetting(new SettingTwitchTokens(), 'Channel')
        const client = await DB.loadSetting(new SettingTwitchClient(), 'Main')
        const headers = new Headers()
        headers.append('Authorization', `Bearer ${tokens?.accessToken}`)
        headers.append('Client-Id', client?.clientId ?? '')
        return headers
    }
    private static async getUserId(): Promise<number> {
        const tokens = await DB.loadSetting(new SettingTwitchTokens(), 'Channel')
        return tokens?.userId ?? 0
    }

    /**
     * Will return the user ID if it exists on Twitch.
     * @param idOrLogin The ID or login name as number or string.
     * @param skipCache Will skip cached data and always do the request.
     */
    private static async getUserIdFromIdOrLogin(idOrLogin: number|string, skipCache: boolean = false): Promise<number|undefined> {
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
    
    static async getUserByLogin(login: string, skipCache: boolean = false):Promise<ITwitchHelixUsersResponseData|undefined> {
        if(login.length == 0) {
            Utils.log(`TwitchHelix: Tried to lookup empty login name.`, Color.Red)
            return undefined
        }
        const id = this._userNameToId.get(login)
        if(id && !skipCache && this._userCache.has(id)) return this._userCache.get(id)
        const url = `${this._baseUrl}/users/?login=${login}`
        return this.getUserByUrl(url)
    }

    static async getUserById(id: number, skipCache: boolean = false):Promise<ITwitchHelixUsersResponseData|undefined> {
        if(isNaN(id)) {
            Utils.log(`TwitchHelix: Invalid user id when trying to load user: ${id}`, Color.Red)
            return undefined
        }
        if(!skipCache && this._userCache.has(id)) return this._userCache.get(id)
        const url = `${this._baseUrl}/users/?id=${id}`
        return this.getUserByUrl(url)
    }

    private static async getUserByUrl(url: string): Promise<ITwitchHelixUsersResponseData|undefined> {
        const response: ITwitchHelixUsersResponse = await (
            await fetch(url, {headers: await this.getAuthHeaders()})
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

    static async getChannelByName(channel: string, skipCache: boolean = false):Promise<ITwitchHelixChannelResponseData|undefined> {
        if(channel.length == 0) return undefined
        const user = await this.getUserByLogin(channel, skipCache)
        return this.getChannelById(parseInt(user?.id ?? '0'), skipCache)
    }
    static async getChannelById(id: number, skipCache: boolean = false): Promise<ITwitchHelixChannelResponseData|undefined> {
        if(isNaN(id) || id === 0) {
            Utils.log(`TwitchHelix: Invalid channel id when trying to load channel: ${id}`, Color.Red)
            return undefined
        }
        if(!skipCache && this._channelCache.has(id)) return this._channelCache.get(id)
        const url = `${this._baseUrl}/channels/?broadcaster_id=${id}`
        const headers = await this.getAuthHeaders()
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
    static async createReward(createData: ITwitchHelixRewardConfig):Promise<ITwitchHelixRewardResponse> {
        const url = `${this._baseUrl}/channel_points/custom_rewards?broadcaster_id=${await this.getUserId()}`
        const headers = await this.getAuthHeaders()
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

    static async getRewards():Promise<ITwitchHelixRewardResponse> {
        return this.getReward("")
    }

    static async getReward(rewardId: string):Promise<ITwitchHelixRewardResponse> {
        let url = `${this._baseUrl}/channel_points/custom_rewards?broadcaster_id=${await this.getUserId()}&only_manageable_rewards=true`
        if(rewardId.length > 0) url += `&id=${rewardId}`
        return await fetch(url, {headers: await this.getAuthHeaders()}).then(res => res.json())
    }

    static async updateReward(rewardId: string|undefined, updateData: ITwitchHelixRewardUpdate):Promise<ITwitchHelixRewardResponse|null> {
        if(rewardId == null) {
            console.warn("Tried to update reward but the ID is null")
            return new Promise<null>(resolve => resolve(null))
        }
        const url = `${this._baseUrl}/channel_points/custom_rewards?broadcaster_id=${await this.getUserId()}&id=${rewardId}`
        const headers = await this.getAuthHeaders()
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

    static async toggleRewards(rewards: ITwitchHelixRewardStates|TKeys[]): Promise<ITwitchHelixRewardStates> {
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

    static async getClips(count: number = 20, pagination?: string): Promise<ITwitchHelixClipResponse> {
        count = Math.min(100, Math.max(1, count))
        let url = `${this._baseUrl}/clips/?broadcaster_id=${await this.getUserId()}&first=${count}`
        const headers = await this.getAuthHeaders()
        headers.append('Content-Type', 'application/json')
        const request = {
            headers: headers
        }
        if(pagination != undefined) {
            url += `&after=${pagination}`
        }
        return await fetch(url, request).then(res => res.json())
    }

    static async getGameById(id: number, skipCache: boolean = false):Promise<ITwitchHelixGamesResponseData|undefined> {
        if(!skipCache && this._gameCache.has(id)) return this._gameCache.get(id)
        const url = `${this._baseUrl}/games/?id=${id}`
        return this.getGameByUrl(url)
    }

    private static async getGameByUrl(url: string):Promise<ITwitchHelixGamesResponseData|undefined> {
        let response: ITwitchHelixGamesResponse = await (await fetch(url, {headers: await this.getAuthHeaders()}))?.json()
        const result: ITwitchHelixGamesResponseData|undefined = response?.data.pop()
        if(result) {
            const id = parseInt(result.id)
            if(!isNaN(id)) {
                this._gameCache.set(id,  result)
            }
        }
        return result
    }

    static async searchForGame(gameTitle: string, pagination?: string):Promise<ITwitchHelixCategoriesResponseData|null> {
        // https://dev.twitch.tv/docs/api/reference#search-categories
        const url = `https://api.twitch.tv/helix/search/categories?query=${gameTitle}&first=1`
        const headers = await this.getAuthHeaders()
        let response: ITwitchHelixGamesResponse = await (await fetch(url, {headers: headers}))?.json()
        return response?.data.pop() ?? null
    }

    static async updateChannelInformation(channelInformation: ITwitchHelixChannelRequest):Promise<boolean> {
        // https://dev.twitch.tv/docs/api/reference#modify-channel-information
        const url = `https://api.twitch.tv/helix/channels?broadcaster_id=${await this.getUserId()}`
        const headers = await this.getAuthHeaders()
        headers.append('Content-Type', 'application/json')
        const request = {
            method: 'PATCH',
            headers: headers, 
            body: JSON.stringify(channelInformation)
        }
        const response = await fetch(url, request)
        return response != null && response.status == 204
    }

    static async updateRedemption(redemptionId: string, redemption: SettingTwitchRedemption):Promise<boolean> {
        // https://dev.twitch.tv/docs/api/reference#update-redemption-status
        const rewardPairs = await Utils.getRewardPairs()
        const rewardPair = rewardPairs.find((pair)=>{ return pair.id === redemption.rewardId })
        if(rewardPair) {
            const eventConfig = Utils.getEventConfig(rewardPair.key)
            if(eventConfig && eventConfig.options?.rewardIgnoreClearRedemptionsCommand === true) {
                Utils.log(`Skipping updating redemption for: ${rewardPair.key}`, Color.BlueViolet)
                return false
            }
        }

        const url = `https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${await this.getUserId()}&reward_id=${redemption.rewardId}&id=${redemptionId}`
        const headers = await this.getAuthHeaders()
        headers.append('Content-Type', 'application/json')
        const request = {
            method: 'PATCH',
            headers: headers, 
            body: JSON.stringify({status: redemption.status})
        }
        const response = await fetch(url, request)
        return response != null && response.status == 200
    }

    static async raidChannel(channelId: string): Promise<boolean> {
        // https://dev.twitch.tv/docs/api/reference#start-a-raid
        const url = `https://api.twitch.tv/helix/raids?from_broadcaster_id=${await this.getUserId()}&to_broadcaster_id=${channelId}`
        const headers = await this.getAuthHeaders()
        const request = {
            method: 'POST',
            headers: headers
        }
        const response = await fetch(url, request)
        return response != null && response.status == 200
    }

    static async cancelRaid(): Promise<boolean> {
        const url = `https://api.twitch.tv/helix/raids?broadcaster_id=${await this.getUserId()}`
        const headers = await this.getAuthHeaders()
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
    static async getUserColor(userIdOrLogin: number|string, skipCache: boolean = false): Promise<string|undefined> {
        const userId = await this.getUserIdFromIdOrLogin(userIdOrLogin, skipCache)
        if(userId) {
            if(this._userColorCache.has(userId) && !skipCache) {
                return this._userColorCache.get(userId)
            }
            const url = `https://api.twitch.tv/helix/chat/color?user_id=${userId}`
            const headers = await this.getAuthHeaders()
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