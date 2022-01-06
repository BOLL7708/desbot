class ImageEditor {

    static _pngCanvas: HTMLCanvasElement = document.createElement('canvas')
    /**
     * Convert to .png through canvas
     */ 
    static async convertToPng(imageb64: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = function() {
                ImageEditor._pngCanvas.width = img.naturalWidth
                ImageEditor._pngCanvas.height = img.naturalHeight
                const ctx = ImageEditor._pngCanvas.getContext('2d')
                ctx.drawImage(img, 0, 0)
                const pngData = ImageEditor._pngCanvas.toDataURL()
                resolve(pngData)
            }
            img.src = imageb64
        })
    }

    static async putImageInImage(
        backgroundImageData: string, 
        insertedImageData: string, 
        originx: number, 
        originy: number, 
        width: number, 
        height: number
    ): Promise<string> {
        const canvas: HTMLCanvasElement = document.createElement('canvas')
        const backgroundImg: HTMLImageElement = await Utils.makeImage(backgroundImageData)
        const profileImg: HTMLImageElement = await Utils.makeImage(insertedImageData)
        canvas.width = backgroundImg.naturalWidth
        canvas.height = backgroundImg.naturalHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(backgroundImg, 0, 0)
        ctx.drawImage(profileImg, originx, originy, width, height)
        return canvas.toDataURL()
    }
}