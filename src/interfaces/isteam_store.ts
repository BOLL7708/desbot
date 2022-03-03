interface ISteamStoreGameResponse {
    [key:number]:{
        data: ISteamStoreGameData
        success: boolean
    }
}
interface ISteamStoreGameData {
    about_the_game?: string
    achievements?: {
        highlighted: [{
            name: string,
            path: string
        }],
        total: number
    }
    background?: string
    categories?: [{
        id: number,
        description: string
    }]
    content_descriptors?: any // TODO
    detailed_description?: string
    developers?: string[]
    dlc?: number[]
    genres?: [{
        id: string,
        description: string
    }]
    header_image?: string
    is_free?: boolean
    legal_notice?: string
    linux_requirements?: any // TODO
    mac_requirements?: any // TODO
    metacritic?: any // TODO
    movies?: [{
        highlight: boolean,
        id: number,
        mp4: {
            480: string,
            max: string
        },
        name: string,
        thumbnail: string,
        webm: {
            480: string,
            max: string
        }
    }]
    name?: string
    package_groups?: [{
        description: string,
        display_type: number,
        is_recurring_subscription: string,
        name: string,
        save_text: string,
        selection_text: string,
        subs: [{
            can_get_free_license: string,
            is_free_license: boolean,
            option_description: string,
            option_text: string,
            packageid: number,
            percent_savings: number,
            percent_savings_text: string,
            price_in_cents_with_discount: number
        }],
        title: string
    }]
    packages?: number[]
    pc_requirements?: {
        minimum: string,
        recommended: string
    }
    platforms?: {
        linux?: boolean,
        mac?: boolean,
        windows?: boolean
    }
    price_overview?: {
        currency: string,
        discount_percent: number,
        final: number,
        final_formatted: string,
        initial: number,
        initial_formatted: string
    }
    publishers?: string[]
    recommendations?: {
        total: number
    }
    release_date?: {
        coming_soon: boolean,
        date: string
    }
    required_age?: number
    reviews?: string
    screenshots?: [{
        id: number,
        path_full: string,
        path_thumbnail: string
    }]
    short_description?: string
    steam_appid?: number
    support_info?: {
        email: string,
        url: string
    }
    supported_languages?: string
    type?: string
    website?: string
    [x:string]:any
}