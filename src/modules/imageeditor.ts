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
}