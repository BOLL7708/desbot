class SteamStore {
    static _gameCache: Record<number, any> = {}
    static async getGameMeta(appId: string):Promise<ISteamGameData> {
        const id = parseInt(appId?.split('.').pop())
        if(!isNaN(id)) {
            if(this._gameCache[id]) return this._gameCache[id]
            const encodedUrl = btoa(`https://store.steampowered.com/api/appdetails?appids=${id}`)
            const response: ISteamGameResponse = await fetch(`./proxy.php?url=${encodedUrl}`)
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

    static getPrice(data: ISteamGameData): string {
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
}