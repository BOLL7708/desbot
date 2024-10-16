import DataBaseHelper from './DataBaseHelper.mts'
import Utils from '../Utils/Utils.mts'
import {ConfigSteam} from '../../lib/index.mts'
import Color from '../Constants/ColorConstants.mts'
import {SettingSteamGame} from '../../lib/index.mts'

/**
 * These are calls to the Steam Web API to fetch various kinds of data.
 * Keep in mind that the combined rates for these requests should not surpass the rate limit.
 * The current rate limit is 100k calls/24h, as mentioned her: https://steamcommunity.com/dev/apiterms
 */
export default class SteamWebHelper {
    private static _profileTag: string = ''
    static async getPlayerSummary(): Promise<ISteamWebApiPlayerSummaryData|undefined> {
        const config = await DataBaseHelper.loadMain(new ConfigSteam())
        if(config.steamWebApiKey.length == 0) {
            Utils.log(`SteamWebApi: Cannot fetch player summary as API key is not set.`, Color.Red)
            return undefined
        }
        const encodedUrl = await this.getEncodedUrl('ISteamUser/GetPlayerSummaries/v0002')
        const response: ISteamWebApiPlayerSummaries = await fetch(`_proxy.php?url=${encodedUrl}`)
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
        const config = await DataBaseHelper.loadMain(new ConfigSteam())
        if(config.steamWebApiKey.length == 0) {
            Utils.log(`SteamWebApi: Cannot fetch achievements as API key is not set.`, Color.Red)
            return undefined
        }
        const id = Utils.numberFromAppId(appId)
        if(!isNaN(id)) {
            const encodedUrl = await this.getEncodedUrl('ISteamUserStats/GetPlayerAchievements/v0001', id)
            const response = await fetch(`_proxy.php?url=${encodedUrl}`)
            let json: ISteamWebApiPlayerAchievements|undefined = undefined
            try {
                json = await response.json()
            } catch (e) {
                console.warn(`SteamWebApi: Failed to parse achievement JSON for ${appId}`)
            }
            if(json) {
                return json?.playerstats?.achievements ?? undefined
            } else {
                console.warn(`SteamWebApi: Failed to get achievements for ${appId}`)
            }
        }
        return
    }

    static _gameSchemas: Map<number, ISteamWebApiGameSchema> = new Map()
    static async getGameSchema(appId: string): Promise<ISteamWebApiGameSchema|undefined> {
        const config = await DataBaseHelper.loadMain(new ConfigSteam())
        if(config.steamWebApiKey.length == 0) {
            Utils.log(`SteamWebApi: Cannot fetch game schema as API key is not set.`, Color.Red)
            return undefined
        }
        const id = Utils.numberFromAppId(appId)
        if(this._gameSchemas.has(id)) return this._gameSchemas.get(id)
        if(!isNaN(id)) {
            const encodedUrl = await this.getEncodedUrl('ISteamUserStats/GetSchemaForGame/v0002/', id)
            const response = await fetch(`_proxy.php?url=${encodedUrl}`)
            if(response.ok != null) {
                const json: ISteamWebApiGameSchema = await response.json()
                this._gameSchemas.set(id, json)
                if(json.game.gameName) { // Update name in database, also happens in SteamStoreHelper
                    const setting = await DataBaseHelper.loadOrEmpty(new SettingSteamGame(), appId)
                    setting.title = json.game.gameName
                    await DataBaseHelper.save(setting, appId)
                }
                return json
            } else {
                console.warn(`SteamWebApi: Failed to get game schema for ${appId}`)
            }
        } 
        return
    }

    static _globalAchievementStats: Map<number, IStreamWebApiGlobalAchievementData[]> = new Map()
    static async getGlobalAchievementStats(appId: string): Promise<IStreamWebApiGlobalAchievementData[]|undefined> {
        const config = await DataBaseHelper.loadMain(new ConfigSteam())
        if(config.steamWebApiKey.length == 0) {
            Utils.log(`SteamWebApi: Cannot fetch global achievements stats as API key is not set.`, Color.Red)
            return undefined
        }
        const id = Utils.numberFromAppId(appId)
        if(this._globalAchievementStats.has(id)) return this._globalAchievementStats.get(id)
        if(!isNaN(id)) {
            const encodedUrl = await this.getEncodedUrl('ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/', id)
            const response: IStreamWebApiGlobalAchievementStats = await fetch(`_proxy.php?url=${encodedUrl}`)
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

    private static async getEncodedUrl(interfaceMethodVersion: string, appId?: number): Promise<string> {
        const config = await DataBaseHelper.loadMain(new ConfigSteam())
        const urlObj = new URL(`https://api.steampowered.com/${interfaceMethodVersion}`)
        urlObj.searchParams.append('key', config.steamWebApiKey)
        urlObj.searchParams.append('steamid', config.steamUserId)
        urlObj.searchParams.append('steamids', config.steamUserId)
        if(appId) urlObj.searchParams.append('appid', appId.toString())
        if(appId) urlObj.searchParams.append('gameid', appId.toString())
        return btoa(urlObj.toString())
    }
}

// settings
export interface ISteamWebApiSettingAchievement {
    key: string
    state: string // A number but is parsed out to string
}

// Responses

// Player Summaries
export interface ISteamWebApiPlayerSummaries {
    response: {
        players: ISteamWebApiPlayerSummaryData[]
    }
}
export interface ISteamWebApiPlayerSummaryData {
    /**
     * 64bit SteamID of the user
     */
    steamid: string
    /**
     * This represents whether the profile is visible or not, and if it is visible, why you are allowed to see it. Note that because this WebAPI does not use authentication, there are only two possible values returned: 1 - the profile is not visible to you (Private, Friends Only, etc), 3 - the profile is "Public", and the data is visible. Mike Blaszczak's post on Steam forums says, "The community visibility state this API returns is different than the privacy state. It's the effective visibility state from the account making the request to the account being viewed given the requesting account's relationship to the viewed account."
     */
    communityvisibilitystate: number
    /**
     * If set, indicates the user has a community profile configured (will be set to '1')
     */
    profilestate: number
    /**
     * The player's persona name (display name)
     */
    personaname: string
    /**
     * If set, indicates the profile allows public comments.
     */
    commentpermission: number
    /**
     * The full URL of the player's Steam Community profile.
     */
    profileurl: string
    /**
     * The full URL of the player's 32x32px avatar. If the user hasn't configured an avatar, this will be the default ? avatar.
     */
    avatar: string
    /**
     * The full URL of the player's 64x64px avatar. If the user hasn't configured an avatar, this will be the default ? avatar.
     */
    avatarmedium: string
    /**
     * The full URL of the player's 184x184px avatar. If the user hasn't configured an avatar, this will be the default ? avatar.
     */
    avatarfull: string
    avatarhash: string
    /**
     * The last time the user was online, in unix time.
     */
    lastlogoff: number
    /**
     * The user's current status. 0 - Offline, 1 - Online, 2 - Busy, 3 - Away, 4 - Snooze, 5 - looking to trade, 6 - looking to play. If the player's profile is private, this will always be "0", except is the user has set their status to looking to trade or looking to play, because a bug makes those status appear even if the profile is private.
     */

    // Below this are private properties that needs authentication to access.

    personastate: number
    /**
     * The player's "Real Name", if they have set it.
     */
    realname: string
    /**
     * The player's primary group, as configured in their Steam Community profile.
     */
    primaryclanid: string
    /**
     * The time the player's account was created.
     */
    timecreated: number
    personastateflags: number
    /**
     * If the user is currently in-game, this will be the name of the game they are playing. This may be the name of a non-Steam game shortcut.
     */
    gameextrainfo: string
    /**
     * If the user is currently in-game, this value will be returned and set to the gameid of that game.
     */
    gameid: string
    /**
     * The ip and port of the game server the user is currently playing on, if they are playing on-line in a game using Steam matchmaking. Otherwise will be set to "0.0.0.0:0".
     */
    loccountrycode: string
    /**
     * If set on the user's Steam Community profile, The user's state of residence
     */
    gameserverip?: any
    /**
     * If set on the user's Steam Community profile, The user's country of residence, 2-character ISO country code
     */
    locstatecode?: any
    /**
     * An internal code indicating the user's city of residence. A future update will provide this data in a more useful way.
     * steam_location gem/package makes player location data readable for output.
     * An updated readable list can be found at quer's steam location
     * Getting locstatecode and loccityid, can now be done from https://steamcommunity.com/actions/QueryLocations/<loccountrycode>/<locstatecode>/
     */
    loccityid?: any
}

// Game Schemas

/**
 * https://partner.steamgames.com/doc/webapi/ISteamUserStats#GetSchemaForGame
 */
export interface ISteamWebApiGameSchema {
    game: {
        gameName: string
        gameVersion: string
        availableGameStats: {
            achievements: IStreamWebApiGameSchemaAchievement[]
            stats: IStreamWebApiGameSchemaStat[]
        }
    }
}
export interface IStreamWebApiGameSchemaAchievement {
    name: string
    defaultvalue: number
    displayName: string
    hidden: number
    description: string
    icon: string
    icongray: string
}
export interface IStreamWebApiGameSchemaStat {
    name: string
    defaultvalue: number
    displayName: string
}

// Player Achievements
export interface ISteamWebApiPlayerAchievements {
    playerstats: {
        steamID: string
        gameName: string
        achievements: ISteamWebApiPlayerAchievementData[]
        success: boolean
    }
}
export interface ISteamWebApiPlayerAchievementData {
    /**
     * The API name of the achievement
     */
    apiname: string
    /**
     * Whether the achievement has been completed.
     */
    achieved: number
    /**
     * Date when the achievement was unlocked.
     */
    unlocktime: number
    /**
     * Optional: Localized achievement name
     */
    name?: string
    /**
     * Optional: Localized description of the achievement
     */
    description?: string
}

// Global Achievements
export interface IStreamWebApiGlobalAchievementStats {
    achievementpercentages: {
        achievements: IStreamWebApiGlobalAchievementData[]
    }
}
export interface IStreamWebApiGlobalAchievementData {
    name: string
    percent: number
}