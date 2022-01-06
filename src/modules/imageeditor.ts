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
        rect: IRect
    ): Promise<boolean> {
        const img: HTMLImageElement = await Utils.makeImage(imageData)
        if(img == null) return false
        this._ctx.drawImage(img, rect.x, rect.y, rect.w, rect.h)
        return true
    }

    async drawText(
        text: string,
        rect: IRect,
        fontSize: number,
        fontFamily: string,
        fontColor: string
    ) {
        // Setup
        this._ctx.font = `${fontSize}px ${fontFamily}`
        this._ctx.fillStyle = fontColor
        this._ctx.textBaseline = 'bottom'
0
        // Init text vars
        text = text.split('\n').join(' ')
        while(text.length > 1 && this._ctx.measureText(text).width > rect.w) {
            text = text.substring(0, text.length - 3) + '…'
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
        rect: IRect,
        fontSize: number,
        fontFamily: string,
        fontColor: string
    ) {
        // Setup
        this._ctx.font = `${fontSize}px ${fontFamily}`
        this._ctx.fillStyle = fontColor
        this._ctx.textBaseline = 'bottom'
        
        // Init text vars
        const messageContent = messageData.text.split('\n').join(' ') // Probably redundant but just in case?
        const words = messageContent.split(' ')
        const wordSpacing = this._ctx.measureText(' ').width

        // Prepare emote data
        const emotes: IEmote[] = []
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
        
        const emoteSize: number = fontSize
        let nextEmote = emotes.shift();   
        let charIndex = 0;
        let lineIndex = 0;
        let x = rect.x;
        let y = rect.y + emoteSize
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
                    const newY = rect.y + emoteSize + (emoteSize * 1.05) * (lineIndex + 1)
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
                // Text
                this._ctx.fillText(wordToWrite, x, y);
                x += wordWidthPx + wordSpacing;
                charIndex += [...word].length + 1;
            }
            if(outOfSpace) break // We can't fit any more
        }
    }
}