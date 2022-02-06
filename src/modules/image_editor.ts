class ImageEditor {
    private _canvas: HTMLCanvasElement
    private _textCanvas: HTMLCanvasElement
    private _ctx: CanvasRenderingContext2D
    private _textCtx: CanvasRenderingContext2D
    constructor() {
        this._canvas = document.createElement('canvas')
        this._textCanvas = document.createElement('canvas')
        this._ctx = this._canvas.getContext('2d')
        this._textCtx = this._textCanvas.getContext('2d')
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
        this._ctx.drawImage(img, 0, 0)
        return true
    }

    /**
     * Will initiate an empty canvas of the given size.
     * @param width 
     * @param height 
     */
    initiateEmptyCanvas(width: number, height: number) {
        this._canvas.width = width
        this._canvas.height = height
        this._ctx.clearRect(0, 0, width, height)
    }

    /*
    ..####...##..##..######..#####...##..##..######.
    .##..##..##..##....##....##..##..##..##....##...
    .##..##..##..##....##....#####...##..##....##...
    .##..##..##..##....##....##......##..##....##...
    ..####....####.....##....##.......####.....##...
    */
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
        outlines: IImageEditorOutline[] = []
    ): Promise<boolean> {
        const img: HTMLImageElement = await Utils.makeImage(imageData)
        if(img == null) return false

        const maxBorderWidth = outlines.reduce((a,b)=>a.width>b.width?a:b).width ?? 0;
        this._ctx.save()
        const x = rect.x + maxBorderWidth
        const y = rect.y + maxBorderWidth
        const w = rect.w - maxBorderWidth*2
        const h = rect.h - maxBorderWidth*2
        this._ctx.beginPath()
        if(radius > 0) { // Will use quadratic corners at a radius
            this.constructRoundedRectangle(this._ctx, {x, y, w, h}, radius)
        } else if (radius < 0) { // Will make it an ellipse
            this._ctx.ellipse(x+w/2, y+h/2, w/2, h/2, 0, 0, 2 * Math.PI)
        } else { // Rectangle
            this._ctx.rect(x, y, w, h)
        }
        this._ctx.closePath()
        if(maxBorderWidth > 0) { // Outline
            for(const outline of outlines) {
                this._ctx.strokeStyle = outline.color
                this._ctx.lineWidth = outline.width*2
                this._ctx.stroke()                
            }

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
        const weight = font.weight ?? 'normal'
        const fontStyle = `${weight} ${font.size}px ${font.family}`
        this._ctx.font = fontStyle
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

    private constructRoundedRectangle(context: CanvasRenderingContext2D, rect: IImageEditorRect, cornerRadius: number) {
        context.beginPath()
        context.moveTo(rect.x + cornerRadius, rect.y)
        context.lineTo(rect.x + rect.w - cornerRadius, rect.y)
        context.quadraticCurveTo(rect.x + rect.w, rect.y, rect.x + rect.w, rect.y + cornerRadius)
        context.lineTo(rect.x + rect.w, rect.y + rect.h - cornerRadius)
        context.quadraticCurveTo(rect.x + rect.w, rect.y + rect.h, rect.x + rect.w - cornerRadius, rect.y + rect.h)
        context.lineTo(rect.x + cornerRadius, rect.y + rect.h)
        context.quadraticCurveTo(rect.x, rect.y + rect.h, rect.x, rect.y + rect.h - cornerRadius)
        context.lineTo(rect.x, rect.y + cornerRadius)
        context.quadraticCurveTo(rect.x, rect.y, rect.x + cornerRadius, rect.y)
        context.closePath()
    }

    drawBackground(rect: IImageEditorRect, cornerRadius: number, color: string) {
        this.constructRoundedRectangle(this._ctx, rect, cornerRadius)
        this._ctx.fillStyle = color
        this._ctx.fill()
    }

    /**
     * Will construct a Twitch message on the text canvas including Twitch and unicode emojis.
     * Initially based on: https://github.com/jeppevinkel/twitch-logger/blob/48f6feb4ed4d3085c089acafb02bf5357a07d895/src/modules/emoteCanvas.ts#L5
     * - Extended to have ellipsizing of both lines and the whole text box.
     * - Fixed a bug where it gets the wrong word length from unicode emojis.
     * @param messageData What comes from chat callbacks
     * @param rect Where the text should be contained
     * @param font Font settings
     */
    async buildTwitchText(messageData: ITwitchMessageData, rect: IImageEditorRect, font: IImageEditorFontSettings): Promise<ITwitchTextResult> {
        // Setup
        this._textCanvas.width = rect.w
        this._textCanvas.height = rect.h
        this._textCtx.textBaseline = 'bottom'
        const weight = font.weight ?? 'normal'
        const fontStyle = `${weight} ${font.size}px ${font.family}`
        this._textCtx.font = fontStyle
        this._textCtx.fillStyle = font.color ?? 'white'
        
        // Init text vars
        const messageContent = messageData.text.split('\n').join(' ') // Probably redundant but just in case?
        const words = messageContent.split(' ')
        const wordSpacing = this._textCtx.measureText(' ').width

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
        let x = 0;
        let y = 0 + font.size
        let outOfSpace = false
        for (const word of words) {
            const isEmote = nextEmote?.start == charIndex
            let wordToWrite = word
            
            // Line break
            // TODO: should also break too long words? Hard to know where to break though, or ellipsize.
            let wordWidthPx = isEmote ? emoteSize : this._textCtx.measureText(word).width;
            if (x + wordWidthPx >= rect.w) { // There is overflow
                let ellipsize: boolean = false
                if(x != 0) { // There is already text on this line
                    const newY = emoteSize * (lineIndex + 2) // 2: from first line + current line
                    if(newY > rect.h) { // There is no space for the next line
                        outOfSpace = true
                        ellipsize = true
                    } else {
                        y = newY
                        lineIndex++
                        x = 0
                    }
                    if(wordWidthPx > rect.h) {
                        ellipsize = true
                    }
                } else ellipsize = true
                
                // We need to ellipsize this word
                if(ellipsize) {
                    let splitCount = 0
                    while(x + wordWidthPx >= rect.w) {
                        splitCount++
                        wordToWrite = word.slice(0, Math.floor(word.length/splitCount))+'…'
                        wordWidthPx = this._textCtx.measureText(wordToWrite).width
                    }
                }
            }

            // Draw
            if (isEmote) {
                // Emote
                const imageData = await ImageLoader.getDataUrl(nextEmote.url)
                const img = await Utils.makeImage(imageData)
                this._textCtx.drawImage(img, x, y - emoteSize, emoteSize, emoteSize);
                if (emotes.length) nextEmote = emotes.shift();   
                x += wordWidthPx + wordSpacing;
                charIndex += word.length + 1;
            } else {
                // Outlines (under fill text)
                if(font.outlines != undefined) {
                    for(const outline of font.outlines) {
                        this._textCtx.lineWidth = outline.width*2 // Only half will be visible.
                        this._textCtx.strokeStyle = outline.color
                        this._textCtx.strokeText(wordToWrite, x, y)
                    }
                }

                // Text
                this._textCtx.fillText(wordToWrite, x, y);
                x += wordWidthPx + wordSpacing;
                charIndex += [...word].length + 1;
            }
            if(outOfSpace) break // We can't fit any more
        }

        return {
            firstRowWidth: x,
            rowsDrawn: lineIndex + 1,
            pixelHeight: y,
            ellipsized: outOfSpace
        }
    }

    drawBuiltTwitchText(rect: IImageEditorRect) {
        this._ctx.drawImage(this._textCanvas, rect.x, rect.y)
    }
}

interface ITwitchTextResult {
    firstRowWidth: number
    rowsDrawn: number
    pixelHeight: number
    ellipsized: boolean
}