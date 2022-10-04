export interface IImageEditorRect {
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

export interface IImageEditorEmote {
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
export interface IImageEditorFontSettings {
    /**
     * The font family of any font that exists on the system.
     */
    family: string
    /**
     * The font size in pixels.
     */
    size: number
    /**
     * Optional: An HTML color, can be a text representation or a hex value, defaults to white.
     */
    color?: string
    /**
     * Optional: Canvas font weight, defaults to `normal`, can have values like `bold` or `300`.
     */
    weight?: string
    /**
     * Optional text outlines. 
     * 
     * The outlines are drawn in the order they are in the array, so the second item is drawn on top of the first item.
     */
    outlines?: IImageEditorOutline[]
    /**
     * Line spacing as a percentage of the font size. 1.0 = 100%
     */
    lineSpacing?: number
}

export interface IImageEditorOutline {
    /**
     * A HTML color, can be a text representation or a hex value.
     */
    color: string|undefined
    /**
     * The width of the outline in pixels.
     */
    width: number
}