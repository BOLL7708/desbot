import Utils from '../Utils/Utils.js'
import DataBaseHelper from './DataBaseHelper.js'
import {SettingSteamGame} from '../Objects/Data/Setting/SettingSteam.js'

export default class SteamStoreHelper {
    static _gameCache: Map<number, ISteamStoreGameData> = new Map()
    static async getGameMeta(appId: string):Promise<ISteamStoreGameData|undefined> {
        const id = Utils.numberFromAppId(appId)
        if(!isNaN(id)) {
            if(this._gameCache.has(id)) return this._gameCache.get(id)
            const encodedUrl = btoa(`https://store.steampowered.com/api/appdetails?appids=${id}`)
            const response: ISteamStoreGameResponse = await fetch(`_proxy.php?url=${encodedUrl}`)
                .then(response => response.json())
            if(response != null) {
                const data = response[id]?.data
                if(data) {
                    if(data.name) { // Update name in database, also happens in SteamWebHelper
                        const setting = await DataBaseHelper.loadOrEmpty(new SettingSteamGame(), appId)
                        setting.title = data.name
                        await DataBaseHelper.save(setting, appId)
                    }
                    this._gameCache.set(id, data)
                    return data
                }
            }
        } 
        return
    }

    static getPrice(data: ISteamStoreGameData|undefined): string {
        if(!data) return 'N/A'
        const currencies: { [x: string]: string } = {
            'EUR': '€',
            'USD': '$',
            'GBP': '£',
            'KRW': '₩'
        }
        const isFree: boolean = data.is_free ?? false
        const price: number = isFree ? 0 : data.price_overview?.final ?? -1
        const currencyStr: string = isFree ? '' : data.price_overview?.currency ?? ''
        const discount: number = isFree ? 0 : data.price_overview?.discount_percent ?? 0
        const currency: string = currencies[currencyStr] ?? ''
        const discountStr: string = discount > 0 ? ` (${discount}%)` : ''
        return isFree ? 'Free'
            : price < 0 ? 'No price' 
            : `${currency}${price/100}${discountStr}`
    }

    static getStoreURL(appId: string|number): string {
        if(typeof appId === 'string') appId = Utils.numberFromAppId(appId)
        return `https://store.steampowered.com/app/${appId}`
    }
    static getAchievementsURL(appId: string|number, profileTag?: string): string {
        if(typeof appId === 'string') appId = Utils.numberFromAppId(appId)
        if(profileTag) return `https://steamcommunity.com/id/${profileTag}/stats/appid/${appId}/achievements`
        else return `https://steamcommunity.com/stats/${appId}/achievements`        
    }
}

export interface ISteamStoreGameResponse {
    [key:number]:{
        data: ISteamStoreGameData
        success: boolean
    }
}
export interface ISteamStoreGameData {
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