/**
 * These are calls to the Steam Web API to fetch various kinds of data. 
 * Keep in mind that the combined rates for these requests should not surpass the rate limit.
 * The current rate limit is 100k calls/24h, as mentioned her: https://steamcommunity.com/dev/apiterms
 */
class SteamWebApi {
    private static _profileTag: string
    static async getPlayerSummary(): Promise<ISteamWebApiPlayerSummaryData|undefined> {
        const encodedUrl = this.getEncodedUrl('ISteamUser/GetPlayerSummaries/v0002')
        const response: ISteamWebApiPlayerSummaries = await fetch(`./proxy.php?url=${encodedUrl}`)
            .then(response => response.json())
        if(response != null) {
            const player = response.response.players[0] ?? null
            if(player) {
                // Remove trailing slash and pop off the tag.
                this._profileTag = player.profileurl.replace(/\/$/, '').split('/').pop() ?? ''
            }
            return player
        } else {
            console.warn(`SteamWebApi: Failed to get player summary`)
        }
        return
    }
    static async getProfileTag(): Promise<string> {
        if(!this._profileTag) await this.getPlayerSummary()
        return new Promise((resolve, reject) => { resolve(this._profileTag) })
    }

    // TODO: Check to see if we have full response definitions in the online docs and create interfaces.
    static async getAchievements(appId: string): Promise<ISteamWebApiPlayerAchievementData[]|undefined> {
        const id = Utils.numberFromAppId(appId)
        if(!isNaN(id)) {
            const encodedUrl = this.getEncodedUrl('ISteamUserStats/GetPlayerAchievements/v0001', id)
            const response: ISteamWebApiPlayerAchievements = await fetch(`./proxy.php?url=${encodedUrl}`)
                .then(response => response.json())
            if(response != null) {
                return response.playerstats.achievements ?? []
            } else {
                console.warn(`SteamWebApi: Failed to get achievements for ${appId}`)
            }
        }
        return
    }

    static _gameSchemas: Map<number, ISteamWebApiGameSchema> = new Map()
    static async getGameSchema(appId: string): Promise<ISteamWebApiGameSchema|undefined> {
        const id = Utils.numberFromAppId(appId)
        if(this._gameSchemas.has(id)) return this._gameSchemas.get(id)
        if(!isNaN(id)) {
            const encodedUrl = this.getEncodedUrl('ISteamUserStats/GetSchemaForGame/v0002/', id)
            const response: ISteamWebApiGameSchema = await fetch(`./proxy.php?url=${encodedUrl}`)
                .then(response => response.json())
            if(response != null) {
                this._gameSchemas.set(id,  response)
                return response
            } else {
                console.warn(`SteamWebApi: Failed to get game schema for ${appId}`)
            }
        } 
        return
    }

    static _globalAchievementStats: Map<number, IStreamWebApiGlobalAchievementData[]> = new Map()
    static async getGlobalAchievementStats(appId: string): Promise<IStreamWebApiGlobalAchievementData[]|undefined> {
        const id = Utils.numberFromAppId(appId)
        if(this._globalAchievementStats.has(id)) return this._globalAchievementStats.get(id)
        if(!isNaN(id)) {
            const encodedUrl = this.getEncodedUrl('ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/', id)
            const response: IStreamWebApiGlobalAchievementStats = await fetch(`./proxy.php?url=${encodedUrl}`)
                .then(response => response.json())
            if(response != null) {
                const achievements = response.achievementpercentages?.achievements ?? []
                this._globalAchievementStats.set(id, achievements)
                return achievements
            } else {
                console.warn(`SteamWebApi: Failed to get game schema for ${appId}`)
            }
        } 
        return
    }

    private static getEncodedUrl(interfaceMethodVersion: string, appId?: number): string {
        var urlObj = new URL(`https://api.steampowered.com/${interfaceMethodVersion}`)
        urlObj.searchParams.append('key', Config.credentials.SteamWebAPIKey)
        urlObj.searchParams.append('steamid', Config.credentials.SteamUserID)
        urlObj.searchParams.append('steamids', Config.credentials.SteamUserID)
        if(appId) urlObj.searchParams.append('appid', appId.toString())
        if(appId) urlObj.searchParams.append('gameid', appId.toString())
        return btoa(urlObj.toString())
    }
}