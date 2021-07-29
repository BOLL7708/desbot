class ImageLoader {
    // TODO: Maybe limit cache to 100 images or something? To avoid memory issues.
    static imageCache: Record<string, Blob> = {}

    static async getBlob(url:string, useCache:boolean=true):Promise<Blob> {
        const cache = (useCache && this.imageCache.hasOwnProperty(url)) 
            ? this.imageCache[url] 
            : null
        if(cache != null) {
            console.log("Returning blob cache...")
            return new Promise<Blob>((resolve) => { resolve(cache) })
        } else {
            const response = await fetch(url)
            const blob = await response.blob()
            if(blob != null && blob.size > 0) this.imageCache[url] = blob
            console.log("Returning loaded blob...")
            return blob
        }
    }

    /**
     * Will load a remote image into a b64 string
     * @param url Url to image
     * @param trimHeader Will remove the format header from b64 string
     * @param callback Will be called after finished loading
     * @param useCache Will load/store cached data
     */
    static async getBase64(url:string, trimHeader:boolean=true, useCache:boolean=true):Promise<string> {
        const blob = await this.getBlob(url, useCache)
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64data = reader.result;
                const imageb64 = base64data.toString()
                if(trimHeader) resolve(imageb64.substr(imageb64.indexOf(',')+1))
                else resolve(imageb64)
            }
            reader.onerror = reject
            reader.readAsDataURL(blob) 
        })
    }
}