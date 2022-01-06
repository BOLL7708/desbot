class ImageLoader {
    // TODO: Maybe limit cache to 100 images or something? To avoid memory issues.
    static _imageCache: Record<string, string> = {}

    private static async getBlob(url:string):Promise<Blob> {
        const response = await fetch(url)
        const blob = await response.blob()
        console.log(`ImageLoader: Loaded remote blob from -> ${url}`)
        return blob
    }

    /**
     * Will load a remote image into a b64 string
     * @param url Url to image
     * @param callback Will be called after finished loading
     * @param useCache Will load/store cached data
     */
    static async getDataUrl(url:string, useCache:boolean=true):Promise<string> {
        const cache = (useCache && this._imageCache.hasOwnProperty(url)) 
            ? this._imageCache[url] 
            : null
        if(cache != null) {
            console.log('ImageLoader: Returning cached')
            return new Promise<string>((resolve) => { 
                resolve(cache) 
            })
        } else {
            const blob = await this.getBlob(url)
            return new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onloadend = async() => {
                    const base64data = reader.result;
                    const imageb64 = base64data.toString()
                    const headerIndex = imageb64.indexOf(',')
                    const header = imageb64.substring(0, headerIndex)
                    console.log(`ImageLoader: base64 header: ${header}`)
                    if(header.indexOf('image/png') == -1) {
                        // Convert to .png
                        const imageEditor = new ImageEditor()
                        const success = await imageEditor.loadDataUrl(imageb64)
                        if(success) {
                            const pngData = imageEditor.getDataUrl()
                            ImageLoader._imageCache[url] = pngData
                            resolve(pngData)
                        } else {
                            reject(new Error('ImageLoader: Failed to convert to png'))
                        }
                    } else {
                        // This works
                        resolve(imageb64)
                    }
                }
                reader.onerror = reject
                reader.readAsDataURL(blob) 
            })
        }
    }
}