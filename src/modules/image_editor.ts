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
        imageData: string, 
        rect: IImageEditorRect,
        radius: number = 0,
        borderWidth: number = 0,
        borderColor: string = Color.Black
    ): Promise<boolean> {
        const img: HTMLImageElement = await Utils.makeImage(imageData)
        if(img == null) return false
        this._ctx.save()
        const x = rect.x + borderWidth
        const y = rect.y + borderWidth
        const w = rect.w - borderWidth*2
        const h = rect.h - borderWidth*2
        this._ctx.beginPath()
        if(radius > 0) { // Will use quadratic corners at a radius
            this._ctx.moveTo(x+radius, y);
            this._ctx.lineTo(x+w-radius, y);
            this._ctx.quadraticCurveTo(x+w, y, x+w, y+radius);
            this._ctx.lineTo(x+w, y+h-radius);
            this._ctx.quadraticCurveTo(x+w, y+h, x+w-radius, y+h);
            this._ctx.lineTo(x+radius, y+h);
            this._ctx.quadraticCurveTo(x, y+h, x, y+h-radius);
            this._ctx.lineTo(x, y+radius);
            this._ctx.quadraticCurveTo(x, y, x+radius, y);            
        } else if (radius < 0) { // Will make it an ellipse
            this._ctx.ellipse(x+w/2, y+h/2, w/2, h/2, 0, 0, 2 * Math.PI)
        } else { // Rectangle
            this._ctx.rect(x, y, w, h)
        }
        this._ctx.closePath()
        if(borderWidth > 0) { // Outline
            this._ctx.strokeStyle = borderColor
            this._ctx.lineWidth = borderWidth*2
            this._ctx.stroke()
            this._ctx.globalCompositeOperation = 'destination-out'
            this._ctx.fillStyle = Color.Black
            this._ctx.fill()
            this._ctx.globalCompositeOperation = 'source-over'
        }
        this._ctx.clip()
        this._ctx.drawImage(img, x, y, w, h)
        this._ctx.restore()
        return true
    }

    async drawText(
        text: string,
        rect: IImageEditorRect,
        font: IImageEditorFontSettings
    ) {
        // Setup
        this._ctx.textBaseline = 'bottom'
        this._ctx.font = `${font.size}px ${font.family}`
        this._ctx.fillStyle = font.color ?? 'white'

        // Init text vars
        text = text.split('\n').join(' ')
        while(text.length > 1 && this._ctx.measureText(text).width > rect.w) {
            text = text.substring(0, text.length - 3) + '…'
        }

        // Outlines (under fill text)
        if(font.outlines != undefined) {
            for(const outline of font.outlines) {
                this._ctx.lineWidth = outline.width*2 // Only half will be visible.
                this._ctx.strokeStyle = outline.color
                this._ctx.strokeText(text, rect.x, rect.y + rect.h)
            }
        }
        this._ctx.fillText(text, rect.x, rect.y + rect.h)
    }

    /**
     * Will draw a Twitch message on the canvas including Twitch and unicode emojis.
     * Initially based on: https://github.com/jeppevinkel/twitch-logger/blob/48f6feb4ed4d3085c089acafb02bf5357a07d895/src/modules/emoteCanvas.ts#L5
     * - Extended to have ellipsizing of both lines and the whole text box.
     * - Fixed a bug where it gets the wrong word length from unicode emojis.
     * @param messageData What comes from chat callbacks
     * @param rect Where the text should be contained
     * @param fontSize Size in pixels
     * @param fontFamily Font family name
     * @param fontColor Font color
     */
    async drawTwitchText(
        messageData: ITwitchMessageData,
        rect: IImageEditorRect,
        font: IImageEditorFontSettings
    ) {
        // Setup
        this._ctx.textBaseline = 'bottom'
        this._ctx.font = `${font.size}px ${font.family}`
        this._ctx.fillStyle = font.color ?? 'white'
        
        // Init text vars
        const messageContent = messageData.text.split('\n').join(' ') // Probably redundant but just in case?
        const words = messageContent.split(' ')
        const wordSpacing = this._ctx.measureText(' ').width

        // Prepare emote data
        const emotes: IImageEditorEmote[] = []
        for(const emote of messageData.emotes ?? []) {
            const url = `https://static-cdn.jtvnw.net/emoticons/v1/${emote.id}/3.0` // Does 3.0 resolution exist for all emotes? Looks nice at least.
            for(const pos of emote.positions) {
                emotes.push({
                    start: pos.start,
                    end: pos.end,
                    url: url
                })
            }
        }
        emotes.sort((a, b) => a.start - b.start)
        
        const emoteSize = font.size*(font.lineSpacing ?? 1.1)
        let nextEmote = emotes.shift();
        let charIndex = 0;
        let lineIndex = 0;
        let x = rect.x;
        let y = rect.y + font.size
        let outOfSpace = false
        for (const word of words) {
            const isEmote = nextEmote?.start == charIndex
            let wordToWrite = word
            
            // Line break
            // TODO: should also break too long words? Hard to know where to break though, or ellipsize.
            let wordWidthPx = isEmote ? emoteSize : this._ctx.measureText(word).width;
            if (x + wordWidthPx >= rect.x + rect.w) { // There is overflow
                let ellipsize: boolean = false
                if(x != rect.x) { // There is already text on this line
                    const newY = rect.y + emoteSize * (lineIndex + 2) // 2: from first line + current line
                    if(newY > rect.y + rect.h) { // There is no space for the next line
                        outOfSpace = true
                        ellipsize = true
                    } else {
                        y = newY
                        lineIndex++
                        x = rect.x
                    }
                    if(wordWidthPx > rect.w) {
                        ellipsize = true
                    }
                } else ellipsize = true
                
                // We need to ellipsize this word
                if(ellipsize) {
                    let splitCount = 0
                    while(x + wordWidthPx >= rect.x + rect.w) {
                        splitCount++
                        wordToWrite = word.slice(0, Math.floor(word.length/splitCount))+'…'
                        wordWidthPx = this._ctx.measureText(wordToWrite).width
                    }
                }
            }

            // Draw
            if (isEmote) {
                // Emote
                const imageData = await ImageLoader.getDataUrl(nextEmote.url)
                const img = await Utils.makeImage(imageData)
                this._ctx.drawImage(img, x, y - emoteSize, emoteSize, emoteSize);
                if (emotes.length) nextEmote = emotes.shift();   
                x += wordWidthPx + wordSpacing;
                charIndex += word.length + 1;
            } else {
                // Outlines (under fill text)
                if(font.outlines != undefined) {
                    for(const outline of font.outlines) {
                        this._ctx.lineWidth = outline.width*2 // Only half will be visible.
                        this._ctx.strokeStyle = outline.color
                        this._ctx.strokeText(wordToWrite, rect.x, rect.y + rect.h)
                    }
                }

                // Text
                this._ctx.fillText(wordToWrite, x, y);
                x += wordWidthPx + wordSpacing;
                charIndex += [...word].length + 1;
            }
            if(outOfSpace) break // We can't fit any more
        }
    }
}