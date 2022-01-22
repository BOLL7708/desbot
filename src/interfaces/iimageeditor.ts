interface IImageEditorRect {
    /**
     * Horizontal position.
     */
    x: number
    /**
     * Vertical position.
     */
    y: number
    /**
     * Width.
     */
    w: number
    /**
     * Height.
     */
    h: number
}

interface IImageEditorEmote {
    /**
     * Character index in the string where the emote string starts.
     */
    start: number,
    /**
     * Character index in the string where the emote string ends.
     */
    end: number,
    /**
     * URL to the emote image.
     */
    url: string
}

/**
 * Font settings for text to be drawn on the canvas.
 */
interface IImageEditorFontSettings {
    /**
     * The font family of any font that exists on the system.
     */
    family: string
    /**
     * The font size in pixels.
     */
    size: number
    /**
     * An HTML color, can be a text representation or a hex value.
     */
    color?: string
    /**
     * Optional text outlines. 
     * 
     * The outlines are drawn in the order they are in the array, so the second item is drawn on top of the first item.
     */
    outlines?: IImageEditorFontOutline[]
    /**
     * Line spacing as a percentage of the font size. 1.0 = 100%
     */
    lineSpacing?: number
}

interface IImageEditorFontOutline {
    /**
     * An HTML color, can be a text representation or a hex value.
     */
    color: string
    /**
     * The width of the outline in pixels.
     */
    width: number
}