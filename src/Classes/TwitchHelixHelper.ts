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
    ITwitchHelixRewardUpdate,
    ITwitchHelixRoleResponse,
    ITwitchHelixUsersResponse,
    ITwitchHelixUsersResponseData
} from '../Interfaces/itwitch_helix.js'
import Color from './ColorConstants.js'
import Utils from './Utils.js'
import DataBaseHelper from './DataBaseHelper.js'
import {SettingTwitchClient, SettingTwitchRedemption, SettingTwitchTokens} from '../Objects/Setting/SettingTwitch.js'
import {ITwitchEventSubSubscriptionPayload} from '../Interfaces/itwitch_eventsub.js'
import {SettingUser} from '../Objects/Setting/SettingUser.js'
import {ActionSystemRewardState} from '../Objects/Action/ActionSystem.js'
import {OptionTwitchRewardUsable, OptionTwitchRewardVisible} from '../Options/OptionTwitch.js'
import {PresetReward} from '../Objects/Preset/PresetReward.js'
import {TriggerReward} from '../Objects/Trigger/TriggerReward.js'
import {EventDefault} from '../Objects/Event/EventDefault.js'
import {TriggerRelay} from '../Objects/Trigger/TriggerRelay.js'
import EventHelper from './EventHelper.js'
import {DataUtils} from '../Objects/DataUtils.js'

export default class TwitchHelixHelper {
    static _baseUrl: string = 'https://api.twitch.tv/helix'
    static _userCache: Map<number, ITwitchHelixUsersResponseData> = new Map()
    static _userNameToId: Map<string, number> = new Map()
    static _gameCache: Map<number, ITwitchHelixGamesResponseData> = new Map()
    static _channelCache: Map<number, ITwitchHelixChannelResponseData> = new Map()
    static _userColorCache: Map<number, string> = new Map()
    static _channelVIPCache: Map<number, boolean> = new Map()
    static _channelModeratorCache: Map<number, boolean> = new Map()

    private static async getAuthHeaders(addJsonHeader: boolean = false): Promise<Headers> {
        const tokens = await DataBaseHelper.load(new SettingTwitchTokens(), 'Channel')
        const client = await DataBaseHelper.load(new SettingTwitchClient(), 'Main')
        const headers = new Headers()
        headers.append('Authorization', `Bearer ${tokens?.accessToken}`)
        headers.append('Client-Id', client?.clientId ?? '')
        if(addJsonHeader) headers.append('Content-Type', 'application/json')
        return headers
    }
    static async getBroadcasterUserId(): Promise<number> {
        const tokens = await DataBaseHelper.load(new SettingTwitchTokens(), 'Channel')
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

    static async getUserById(id: number|string, skipCache: boolean = false):Promise<ITwitchHelixUsersResponseData|undefined> {
        if(typeof id === 'string') id = parseInt(id)
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
                const user = await DataBaseHelper.loadOrEmpty(new SettingUser(), id.toString())
                user.userName = result.login
                user.displayName = result.display_name
                await DataBaseHelper.save(user, id.toString())
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
        const url = `${this._baseUrl}/channel_points/custom_rewards?broadcaster_id=${await this.getBroadcasterUserId()}`
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
        let url = `${this._baseUrl}/channel_points/custom_rewards?broadcaster_id=${await this.getBroadcasterUserId()}&only_manageable_rewards=true`
        if(rewardId.length > 0) url += `&id=${rewardId}`
        return await fetch(url, {headers: await this.getAuthHeaders()}).then(res => res.json())
    }

    static async updateReward(eventKey: string|undefined, presetOrData: PresetReward|ITwitchHelixRewardUpdate):Promise<ITwitchHelixRewardResponse|null> {
        const updateData: ITwitchHelixRewardUpdate = presetOrData // Map preset to data
        if(eventKey == null) {
            console.warn("Tried to update reward but the ID is null")
            return new Promise<null>(resolve => resolve(null))
        }
        const url = `${this._baseUrl}/channel_points/custom_rewards?broadcaster_id=${await this.getBroadcasterUserId()}&id=${eventKey}`
        const headers = await this.getAuthHeaders()
        headers.append('Content-Type', 'application/json')
        const request = {
            method: 'PATCH',
            headers: headers,
            body: JSON.stringify(updateData)
        }
        let response: ITwitchHelixRewardResponse = await fetch(url, request).then(res => res.json())
        if(response.status == 500) { // Retry once if the server broke
            Utils.log(`Failed to update Twitch reward ${eventKey}: ${response.error}(${response.status}) [${response.message}] retrying once.`, Color.OrangeRed)
            response = await fetch(url, request).then(res => res.json())
        }
        if(response.error != undefined) Utils.log(`Failed to update Twitch reward ${eventKey}: ${response.error}(${response.status}) [${response.message}]`, Color.Red)
        return response
    }

    static async updateRewards(allEvents: {[key: string]: EventDefault}|undefined) {
        let updatedRewardCount = 0
        let skippedRewardCount = 0
        let failedRewardCount = 0
        for(const [key, eventItem] of Object.entries(allEvents ?? {})) {
            if(!eventItem.options.rewardOptions.ignoreUpdateCommand) {
                const triggers = DataUtils.ensureValues(eventItem.triggers) ?? []
                for (const trigger of triggers) {
                    if (trigger.__getClass() == TriggerReward.ref.build()) {
                        const triggerReward = (trigger as TriggerReward)
                        const rewardID = DataUtils.ensureValue(triggerReward.rewardID)
                        const rewardPresets = DataUtils.ensureValues(triggerReward.rewardEntries) ?? []
                        if (rewardID && rewardPresets.length) {
                            const preset = rewardPresets[0] as PresetReward
                            const response = await TwitchHelixHelper.updateReward(rewardID, preset)
                            if (response?.data) {
                                const success = response?.data[0]?.id == rewardID
                                if(success) updatedRewardCount++
                                else failedRewardCount++
                                Utils.logWithBold(`Reward <${key}> updated: <${success ? 'OK' : 'ERR'}>`, success ? Color.Green : Color.Red)
                                /*
                                // TODO: Figure this out
                                // If update was successful, also reset incremental setting as the reward should have been reset.
                                if(Array.isArray(rewardSetup)) {
                                    const reset = new SettingIncrementingCounter()
                                    await DataBaseHelper.save(reset, pair.key)
                                }
                                // TODO: Also reset accumulating counters here?!
                                */
                            } else {
                                failedRewardCount++
                                Utils.logWithBold(`Reward for <${key}> update unsuccessful: ${response?.error}`, Color.Red)
                            }
                        }
                    }
                }
            } else {
                skippedRewardCount++
                Utils.logWithBold(`Reward for <${key}> update skipped or unavailable.`, Color.Purple)
            }
        }
        return {
            updated: updatedRewardCount,
            skipped: skippedRewardCount,
            failed: failedRewardCount
        }
    }

    static async toggleRewards(rewards: ActionSystemRewardState[]): Promise<ActionSystemRewardState[]> {
        const result: ActionSystemRewardState[] = []
        for(const reward of rewards) {
            const id = DataUtils.ensureValue(reward.reward)
            if(id) {
                // Set flags depending on matching options
                const updated = await this.updateReward(
                    id,
                    {
                        is_enabled: reward.reward_visible === OptionTwitchRewardVisible.Visible,
                        is_paused: reward.reward_usable === OptionTwitchRewardUsable.Disabled
                    }
                )
                if(updated !== null) result.push(reward)
            }
        }
        return result
    }

    static async getClips(count: number = 20, pagination?: string): Promise<ITwitchHelixClipResponse> {
        count = Math.min(100, Math.max(1, count))
        let url = `${this._baseUrl}/clips/?broadcaster_id=${await this.getBroadcasterUserId()}&first=${count}`
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
        const url = `https://api.twitch.tv/helix/channels?broadcaster_id=${await this.getBroadcasterUserId()}`
        const request = {
            method: 'PATCH',
            headers: await this.getAuthHeaders(true),
            body: JSON.stringify(channelInformation)
        }
        const response = await fetch(url, request)
        return response != null && response.status == 204
    }

    /**
     * Update a Twitch redemption.
     * @param redemptionId
     * @param redemption
     * @return Boolean if succeeded or failed, null if not found.
     */
    static async updateRedemption(redemptionId: string, redemption: SettingTwitchRedemption):Promise<boolean|null> {
        // https://dev.twitch.tv/docs/api/reference#update-redemption-status
        const rewardEvents = await EventHelper.getAllEventsWithTriggersOfType(new TriggerReward(), redemption.rewardId)
        const events = Object.fromEntries(
            Object.entries(rewardEvents).filter(
                ([key, ev]) => { return ev.options.rewardOptions.ignoreClearRedemptionsCommand }
            )
        )
        if(Object.keys(events).length > 0) {
            Utils.log(`Skipping updating redemption for: ${Object.keys(events).join(', ')}`, Color.BlueViolet)
            return false
        }

        const url = `https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${await this.getBroadcasterUserId()}&reward_id=${redemption.rewardId}&id=${redemptionId}`
        const headers = await this.getAuthHeaders()
        headers.append('Content-Type', 'application/json')
        const request = {
            method: 'PATCH',
            headers: headers, 
            body: JSON.stringify({status: redemption.status})
        }
        const response = await fetch(url, request)
        return response?.status == 200
            ? true
            : response?.status == 404
                ? null
                : false
    }

    static async raidChannel(channelId: string): Promise<boolean> {
        // https://dev.twitch.tv/docs/api/reference#start-a-raid
        const url = `https://api.twitch.tv/helix/raids?from_broadcaster_id=${await this.getBroadcasterUserId()}&to_broadcaster_id=${channelId}`
        const headers = await this.getAuthHeaders()
        const request = {
            method: 'POST',
            headers: headers
        }
        const response = await fetch(url, request)
        return response != null && response.status == 200
    }

    static async cancelRaid(): Promise<boolean> {
        const url = `https://api.twitch.tv/helix/raids?broadcaster_id=${await this.getBroadcasterUserId()}`
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

    // region Moderators
    static async isUserModerator(userId: number, skipCache: boolean = false): Promise<boolean> {
        if(!skipCache && this._channelModeratorCache.has(userId)) return this._channelModeratorCache.get(userId) ?? false
        let url = `https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=${await this.getBroadcasterUserId()}`
        if(userId) url += `&user_id=${userId}`
        const request = {
            headers: await this.getAuthHeaders()
        }
        const response = await fetch(url, request)
        if(response.ok) {
            const result = await response.json() as unknown as ITwitchHelixRoleResponse
            const hasRole = result.data.length == 1 && result.data[0].user_id == userId.toString()
            this._channelModeratorCache.set(userId, hasRole)
            return hasRole
        } else {
            return false
        }
    }
    static async makeUserModerator(userId: number): Promise<boolean> {
        const url = `https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=${await this.getBroadcasterUserId()}&user_id=${userId}`
        const request = {
            method: 'POST',
            headers: await this.getAuthHeaders()
        }
        const response = await fetch(url, request)
        if(response.ok) this._channelModeratorCache.set(userId, true)
        return response.ok
    }
    static async removeUserModerator(userId: number): Promise<boolean> {
        const url = `https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=${await this.getBroadcasterUserId()}&user_id=${userId}`
        const request = {
            method: 'DELETE',
            headers: await this.getAuthHeaders()
        }
        const response = await fetch(url, request)
        if(response.ok) this._channelModeratorCache.set(userId, false)
        return response.ok
    }
    // endregion

    // region VIPs
    static async isUserVIP(userId: number, skipCache: boolean = false): Promise<boolean> {
        if(!skipCache && this._channelVIPCache.has(userId)) return this._channelVIPCache.get(userId) ?? false
        let url = `https://api.twitch.tv/helix/channels/vips?broadcaster_id=${await this.getBroadcasterUserId()}&user_id=${userId}`
        const request = {
            headers: await this.getAuthHeaders()
        }
        const response = await fetch(url, request)
        if(response.ok) {
            const result = await response.json() as unknown as ITwitchHelixRoleResponse
            const hasRole = result.data.length == 1 && result.data[0].user_id == userId.toString()
            this._channelVIPCache.set(userId, hasRole)
            return hasRole
        } else {
            return false
        }
    }
    static async makeUserVIP(userId: number): Promise<boolean> {
        const url = `https://api.twitch.tv/helix/channels/vips?broadcaster_id=${await this.getBroadcasterUserId()}&user_id=${userId}`
        const request = {
            method: 'POST',
            headers: await this.getAuthHeaders()
        }
        const response = await fetch(url, request)
        if(response.ok) this._channelVIPCache.set(userId, true)
        return response.ok
    }
    static async removeUserVIP(userId: number): Promise<boolean> {
        const url = `https://api.twitch.tv/helix/channels/vips?broadcaster_id=${await this.getBroadcasterUserId()}&user_id=${userId}`
        const request = {
            method: 'DELETE',
            headers: await this.getAuthHeaders()
        }
        const response = await fetch(url, request)
        if(response.ok) this._channelVIPCache.set(userId, false)
        return response.ok
    }
    // endregion

    // region EventSub Subscriptions
    static async subscribeToEventSub(body: ITwitchEventSubSubscriptionPayload): Promise<boolean> {
        const url = `https://api.twitch.tv/helix/eventsub/subscriptions`
        const request = {
            method: 'POST',
            headers: await this.getAuthHeaders(true),
            body: JSON.stringify(body)
        }
        const response = await fetch(url, request)
        return response.ok
    }
    // endregion

    static async loadNamesForUsersWhoLackThem() {
        // region Chat
        const userSettings = await DataBaseHelper.loadAll(new SettingUser()) ?? {}
        for(const [key, setting] of Object.entries(userSettings)) {
            if(setting.userName.length && setting.displayName.length) continue
            await TwitchHelixHelper.getUserById(key) // This will automatically update the object in the database
        }
    }
}