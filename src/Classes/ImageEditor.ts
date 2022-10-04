import Utils from '../ClassesStatic/Utils.js'
import {ITwitchMessageData} from '../Interfaces/itwitch.js'
import Color from '../ClassesStatic/colors.js'
import {IImageEditorFontSettings, IImageEditorOutline, IImageEditorRect} from '../Interfaces/iimage_editor.js'
import ImageLoader from './ImageLoader.js'

export default class ImageEditor {
    private _canvas: HTMLCanvasElement
    private _textCanvas: HTMLCanvasElement
    private _ctx: CanvasRenderingContext2D|null
    private _textCtx: CanvasRenderingContext2D|null
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
        this._ctx?.drawImage(img, 0, 0)
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
        this._ctx?.clearRect(0, 0, width, height)
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
        const img: HTMLImageElement|null = await Utils.makeImage(imageData)
        if(img == null) return false

        const maxBorderWidth = outlines.length == 0 ? 0 : outlines.reduce((a,b)=>a.width>b.width?a:b).width ?? 0;
        this._ctx?.save()
        const x = rect.x + maxBorderWidth
        const y = rect.y + maxBorderWidth
        const w = rect.w - maxBorderWidth*2
        const h = rect.h - maxBorderWidth*2
        this._ctx?.beginPath()
        if(radius > 0) { // Will use quadratic corners at a radius
            this.constructRoundedRectangle(this._ctx, {x, y, w, h}, radius)
        } else if (radius < 0) { // Will make it an ellipse
            this._ctx?.ellipse(x+w/2, y+h/2, w/2, h/2, 0, 0, 2 * Math.PI)
        } else { // Rectangle
            this._ctx?.rect(x, y, w, h)
        }
        this._ctx?.closePath()
        if(maxBorderWidth > 0) { // Outline
            for(const outline of outlines) {
                if(this._ctx) {
                    this._ctx.strokeStyle = outline.color ?? ''
                    this._ctx.lineWidth = outline.width*2
                    this._ctx.stroke()                
                }
            }
            if(this._ctx) {
                this._ctx.globalCompositeOperation = 'destination-out'
                this._ctx.fillStyle = Color.Black
                this._ctx.fill()
                this._ctx.globalCompositeOperation = 'source-over'
            }                                                
        }
        this._ctx?.clip()
        this._ctx?.drawImage(img, x, y, w, h)
        this._ctx?.restore()
        return true
    }

    async drawText(
        text: string,
        rect: IImageEditorRect,
        font: IImageEditorFontSettings
    ) {
        if(!this._ctx) return console.warn(`ImageEditor: No context to draw text`)
        // Setup
        this._ctx.textBaseline = 'middle'
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
        const y = rect.y + rect.h/2
        if(font.outlines != undefined) {
            for(const outline of font.outlines) {
                this._ctx.lineWidth = outline.width*2 // Only half will be visible.
                this._ctx.strokeStyle = outline.color ?? ''
                this._ctx.strokeText(text, rect.x, y)
            }
        }
        this._ctx.fillText(text, rect.x, y)
    }

    private constructRoundedRectangle(context: CanvasRenderingContext2D|null, rect: IImageEditorRect, cornerRadius: number, margin: number = 0) {
        if(!context) return console.warn(`ImageEditor: No context to draw rounded rectangle`)
        const rectClone = Utils.clone(rect)
        rectClone.x += margin
        rectClone.y += margin
        rectClone.w -= margin*2
        rectClone.h -= margin*2
        context.beginPath()
        context.moveTo(rectClone.x + cornerRadius, rectClone.y)
        context.lineTo(rectClone.x + rectClone.w - cornerRadius, rectClone.y)
        context.quadraticCurveTo(rectClone.x + rectClone.w, rectClone.y, rectClone.x + rectClone.w, rectClone.y + cornerRadius)
        context.lineTo(rectClone.x + rectClone.w, rectClone.y + rectClone.h - cornerRadius)
        context.quadraticCurveTo(rectClone.x + rectClone.w, rectClone.y + rectClone.h, rectClone.x + rectClone.w - cornerRadius, rectClone.y + rectClone.h)
        context.lineTo(rectClone.x + cornerRadius, rectClone.y + rectClone.h)
        context.quadraticCurveTo(rectClone.x, rectClone.y + rectClone.h, rectClone.x, rectClone.y + rectClone.h - cornerRadius)
        context.lineTo(rectClone.x, rectClone.y + cornerRadius)
        context.quadraticCurveTo(rectClone.x, rectClone.y, rectClone.x + cornerRadius, rectClone.y)
        context.closePath()
    }

    /**
     * Draw the background grahphics for the custom notification.
     * @param rect 
     * @param cornerRadius 
     * @param color 
     * @param outline 
     */
    drawBackground(rect: IImageEditorRect, cornerRadius: number, color: string, outline?: IImageEditorOutline) {
        this.constructRoundedRectangle(this._ctx, rect, cornerRadius, outline ? outline.width/2 : 0)
        if(outline != undefined) {
            if(this._ctx) {
                this._ctx.strokeStyle = outline?.color ?? Color.Black
                this._ctx.lineWidth = outline?.width ?? 0
                this._ctx.stroke()
            }
        }
        if(this._ctx) this._ctx.fillStyle = color
        this._ctx?.fill()
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
        if(!this._textCtx) {
            return new Promise<ITwitchTextResult>((resolve, reject) => {
                reject(new Error(`ImageEditor: No context to draw Twitch text`))
            })
        }

        // Return values
        const result: ITwitchTextResult = {
            firstRowWidth: 0,
            rowsDrawn: 1,
            pixelHeight: 0,
            ellipsized: false,
            writtenChars: 0
        }

        // Canvas Setup
        const outlineMarginPx = font.outlines && font.outlines.length >= 1 ? font.outlines[0].width : 0
        this._textCanvas.width = rect.w
        this._textCanvas.height = rect.h
        this._textCtx.textBaseline = 'top'
        const weight = font.weight ?? 'normal'
        const fontStyle = `${weight} ${font.size}px ${font.family}`
        this._textCtx.font = fontStyle
        this._textCtx.fillStyle = font.color ?? 'white'
        const wordSpacingPx = this._textCtx.measureText(' ').width // TODO: Multiply with scale factor from config
        const ellipsisWidthPx = this._textCtx.measureText('…').width
        const lineHeightPx = font.size*(font.lineSpacing ?? 1.1) 
        const emoteSizePx = lineHeightPx // TODO: Allow a scale factor for the actual drawing?

        // Generate emote data set
        const emotes: Map<number, string> = new Map()
        let emoteCount = 0
        for(const emote of messageData.emotes ?? []) {
			// Using full resolution emojis appears to have murdered memory usage or something?
            const url = `https://static-cdn.jtvnw.net/emoticons/v1/${emote.id}/` // Does 3.0 resolution exist for all emotes? Looks nice at least.
            for(const pos of emote.positions) {
                emoteCount++
                emotes.set(pos.start, url)
            }
        }

        // Generate text data set
        interface ImageEditorTwitchWord {
            text: string
            length: number
            widthPx: number
            emoteUrl?: string
        }
        let totalLength = 0
        const words: ImageEditorTwitchWord[] = messageData.text.split(' ').map(word => {
            const emoteUrl = emotes.get(totalLength)
            totalLength += word.length + 1
            return <ImageEditorTwitchWord>{
                text: word,
                length: word.length,
                widthPx: emoteUrl != undefined 
                    ? emoteSizePx
                    : (this._textCtx
                        ? this._textCtx.measureText(word).width
                        : 0),
                emoteUrl: emoteUrl
            }
        })

        /*
         * We have the words array of interfaces.
         * This should allow us to draw the full text.
         * Inlcuding Twitch emote support.
         */
        
        // Prep drawing
        const emoteRes = emoteCount <= 3  
            ? '3.0' 
            : emoteCount <= 6 
                ? '2.0' 
                : '1.0'
        let wordPosX = outlineMarginPx
        let wordPosY = 0
        let isLastLine = false
        for(let i=0; i<words.length; i++) {
            const word = words[i]
            const nextWord = words[i+1] ?? null

            // Shorten a word if it's bigger than the box
            const textSpacePx = rect.w - outlineMarginPx*2
            if(word.widthPx >= textSpacePx) {
                while(word.widthPx+ellipsisWidthPx >= textSpacePx) {
                    word.text = word.text.substring(0, Math.floor(word.text.length/2))
                    word.widthPx = this._textCtx.measureText(word.text).width
                }
                word.text += '…'
                word.length++
                word.widthPx += ellipsisWidthPx
            }

            // Check what fits, and act on it
            const fitBase = rect.w - wordPosX - word.widthPx - outlineMarginPx
            const wordFits = fitBase >= 0
            const wordFitsWithEllipsis = fitBase - ellipsisWidthPx >= 0
            const nextWordFits = nextWord != undefined 
                ? rect.w - wordPosX - word.widthPx - wordSpacingPx - nextWord.widthPx >= 0
                : true
            if(isLastLine) { // If last line, we ellipsise
                if(!wordFits || !nextWordFits) {
                    word.text = wordFitsWithEllipsis ? word.text+'…' : '…'
                    word.widthPx = ellipsisWidthPx
                    result.ellipsized = true
                }
            } else { // If not last line, we switch to next line
                if(!wordFits) {
                    wordPosY += lineHeightPx
                    wordPosX = outlineMarginPx
                    isLastLine = rect.h - (wordPosY + lineHeightPx * 2) < 0
                    result.rowsDrawn++
                }
            }
            // TODO: Check somewhere if X was already zero and the word does not fit, we should truncate it.

            // Draw
            if (word.emoteUrl != undefined) {
                // Emote
                const imageData = await ImageLoader.getDataUrl(`${word.emoteUrl}/${emoteRes}`)
                const img = await Utils.makeImage(imageData) // TODO: Make this cached?
                if(img) this._textCtx.drawImage(img, wordPosX, wordPosY, word.widthPx, word.widthPx)
                else console.warn(`ImageEditor: Failed to load emote ${word.emoteUrl}`)
                wordPosX += word.widthPx + ((nextWord?.emoteUrl != undefined) ? 0 : wordSpacingPx) // Makes neighbor emotes cozy close together                
            } else {
                // Outlines (under fill text)
                if(font.outlines != undefined) {
                    for(const outline of font.outlines) {
                        this._textCtx.lineWidth = outline.width*2 // Only half will be visible.
                        this._textCtx.strokeStyle = outline.color ?? 'black'
                        this._textCtx.strokeText(word.text, wordPosX, wordPosY)
                    }
                }

                // Text
                this._textCtx.fillText(word.text, wordPosX, wordPosY)
                result.writtenChars += word.length+1
                wordPosX += word.widthPx + wordSpacingPx
            }
            if(result.ellipsized) break // We can't fit any more words.
        }
        
        result.firstRowWidth = wordPosX
        result.pixelHeight = wordPosY + lineHeightPx
        return result
    }

    drawBuiltTwitchText(rect: IImageEditorRect) {
        this._ctx?.drawImage(this._textCanvas, rect.x, rect.y)
    }
}

interface ITwitchTextResult {
    firstRowWidth: number
    rowsDrawn: number
    pixelHeight: number
    ellipsized: boolean
    writtenChars: number
}