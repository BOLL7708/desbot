interface IImageEditorRect {
    x: number
    y: number
    w: number
    h: number
}

interface IImageEditorEmote {
    start: number,
    end: number,
    url: string
}

interface IImageEditorFontSettings {
    family: string
    size: number
    color?: string
    outlines?: IImageEditorFontOutline[]
    lineSpacing?: number
}

interface IImageEditorFontOutline {
    color: string
    width: number
}