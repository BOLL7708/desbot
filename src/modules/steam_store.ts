class SteamStore {
    static _gameCache: Record<number, ISteamStoreGameData> = {}
    static async getGameMeta(appId: string):Promise<ISteamStoreGameData> {
        const id = Utils.numberFromAppId(appId)
        if(!isNaN(id)) {
            if(this._gameCache[id]) return this._gameCache[id]
            const encodedUrl = btoa(`https://store.steampowered.com/api/appdetails?appids=${id}`)
            const response: ISteamStoreGameResponse = await fetch(`./proxy.php?url=${encodedUrl}`)
                .then(response => response.json())
            if(response != null) {
                const data = response[id]?.data
                if(data) {
                    this._gameCache[id] = data
                    return data
                }
            }
        } return null
    }

    static getPrice(data: ISteamStoreGameData): string {
        if(data == null) return 'Invalid Game'
        const currencies = {
            "EUR": "€",
            "USD": "$",
            "GBP": "£"
        }
        const isFree: boolean = data.is_free ?? false
        const price: number = isFree ? 0 : data.price_overview.final ?? -1
        const currencyStr: string = isFree ? '' : data.price_overview.currency ?? ''
        const discount: number = isFree ? 0 : data.price_overview.discount_percent ?? 0
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