// Player Summaries
interface ISteamWebApiPlayerSummaries {
    response: {
        players: ISteamWebApiPlayerSummaryData[]
    }
}
interface ISteamWebApiPlayerSummaryData {
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
interface ISteamWebApiGameSchemas {
    game: {
        gameName: string
        gameVersion: string
        availableGameStats: {
            achievements: IStreamWebApiGameSchemaAchievement[]
            stats: IStreamWebApiGameSchemaStat[]
        }
    }
}
interface IStreamWebApiGameSchemaAchievement {
    name: string
    defaultvalue: number
    displayName: string
    hidden: number
    description: string
    icon: string
    icongray: string
}
interface IStreamWebApiGameSchemaStat {
    name: string
    defaultvalue: number
    displayName: string
}

// Player Achievements
interface ISteamWebApiPlayerAchievements {
    playerstats: {
        steamID: string
        gameName: string
        achievements: ISteamWebApiPlayerAchievementData[]
        success: boolean
    }
}
interface ISteamWebApiPlayerAchievementData {
    /**
     * The API name of the achievement
     */
    apiname: string
    /**
     * Whether or not the achievement has been completed.
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