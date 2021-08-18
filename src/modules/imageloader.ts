class ImageLoader {
    // TODO: Maybe limit cache to 100 images or something? To avoid memory issues.
    static _imageCache: Record<string, string> = {}
    static _canvas: HTMLCanvasElement = document.createElement('canvas')

    private static async getBlob(url:string):Promise<Blob> {
        const response = await fetch(url)
        const blob = await response.blob()
        console.log(`ImageLoader: Loaded remote blob from -> ${url}`)
        return blob
    }

    /**
     * Will load a remote image into a b64 string
     * @param url Url to image
     * @param trimHeader Will remove the format header from b64 string
     * @param callback Will be called after finished loading
     * @param useCache Will load/store cached data
     */
    static async getBase64(url:string, trimHeader:boolean=true, useCache:boolean=true):Promise<string> {
        const cache = (useCache && this._imageCache.hasOwnProperty(url)) 
            ? this._imageCache[url] 
            : null
        if(cache != null) {
            console.log('ImageLoader: Returning cached')
            return new Promise<string>((resolve) => { 
                resolve(trimHeader ? Utils.removeImageHeader(cache) : cache) 
            })
        } else {
            const blob = await this.getBlob(url)
            return new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onloadend = () => {
                    const base64data = reader.result;
                    const imageb64 = base64data.toString()
                    const headerIndex = imageb64.indexOf(',')
                    const header = imageb64.substr(0, headerIndex)
                    console.log(`ImageLoader: base64 header: ${header}`)
                    if(header.indexOf('image/png') == -1) {
                        // Convert to .png through canvas
                        const img = new Image()
                        img.onload = function() {
                            ImageLoader._canvas.width = img.naturalWidth
                            ImageLoader._canvas.height = img.naturalHeight
                            const ctx = ImageLoader._canvas.getContext('2d')
                            ctx.drawImage(img, 0, 0)
                            const pngData = ImageLoader._canvas.toDataURL()
                            ImageLoader._imageCache[url] = pngData
                            console.log(`ImageLoader: Canvas size: ${ImageLoader._canvas.width}x${ImageLoader._canvas.height}`)
                            resolve(trimHeader ? Utils.removeImageHeader(pngData) : pngData)
                        }
                        img.src = imageb64
                    } else {
                        // This works
                        resolve(trimHeader ? Utils.removeImageHeader(imageb64) : imageb64)
                    }
                }
                reader.onerror = reject
                reader.readAsDataURL(blob) 
            })
        }
    }
}