class ImageEditor {
    private _canvas: HTMLCanvasElement
    private _ctx: CanvasRenderingContext2D
    constructor() {
        this._canvas = document.createElement('canvas')
        this._ctx = this._canvas.getContext('2d')
    }

    /**
     * Will load an image URL and cache the result using ImageLoader.
     * Do not call this inside ImageLoader, as it could cause an infinite loop.
     * @param url
     * @returns Promise with boolean if image was successfully loaded
     */
    async loadUrl(url: string):Promise<boolean> {
        const imageData = await ImageLoader.getDataUrl(url)
        if(imageData == null) return false
        return this.loadDataUrl(imageData)
    }
    /**
     * Loads an image from a base64 data URL
     * @param dataUrl 
     * @returns 
     */
    async loadDataUrl(dataUrl: string): Promise<boolean> {
        const img = await Utils.makeImage(dataUrl)
        if(img == null) return false
        this._canvas.width = img.naturalWidth
        this._canvas.height = img.naturalHeight
        Utils.log(`ImageEditor: Loaded image with size ${img.naturalWidth}x${img.naturalHeight}`, Color.Green)
        const ctx = this._canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        return true
    }

    getDataUrl(): string {
        return this._canvas.toDataURL()
    }
    getData(): string {
        return Utils.removeImageHeader(this.getDataUrl())
    }

    async drawImage(
        insertedImageData: string, 
        originx: number, 
        originy: number, 
        width: number, 
        height: number
    ): Promise<boolean> {
        const img: HTMLImageElement = await Utils.makeImage(insertedImageData)
        if(img == null) return false
        this._ctx.drawImage(img, originx, originy, width, height)
        return true
    }
}