interface ISteamGameResponse {
    [key:number]:{
        data: ISteamGameData
        success: boolean
    }
}
interface ISteamGameData {
    about_the_game?: string
    achievements?: any
    background?: string
    categories?: any
    content_descriptors?: any
    detailed_description?: string
    developers?: string[]
    dlc?: number[]
    genres?: any
    linux_requirements?: any
    mac_requirements?: any
    metacritic?: any
    movies?: any
    name?: string
    package_groups?: any
    packages?: number[]
    pc_requirements?: any
    platforms?: any
    price_overview?: any
    publishers?: string[]
    recommendations?: any
    release_date?: any
    required_age?: number
    reviews?: string
    screenshots?: any
    short_description?: string
    steam_appid?: number
    support_info?: any
    supported_languages?: string
    type?: string
    website?: string
    [x:string]:any
}