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
}