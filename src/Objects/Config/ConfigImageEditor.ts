import Data from '../Data.js'
import DataMap from '../DataMap.js'

export class  ConfigImageEditorRect extends Data {
    x: number = 0
    y: number = 0
    w: number = 0
    h: number = 0

    enlist() {
        DataMap.addSubInstance(
            new ConfigImageEditorRect(),
            {
                x: 'Horizontal position.',
                y: 'Vertical position.',
                w: 'Width.',
                h: 'Height.'
            }
        )
    }
}
/**
 * Font settings for text to be drawn on the canvas.
 */
export class ConfigImageEditorFontSettings extends Data {
    family: string = ''
    size: number = 0
    color: string = ''
    weight: string = ''
    outlines: ConfigImageEditorOutline[] = []
    lineSpacing: number = 0

    enlist() {
        DataMap.addSubInstance(
            new ConfigImageEditorFontSettings(),
            {
                family: 'The font family of any font that exists on the system.',
                size: 'The font size in pixels.',
                color: 'Optional: An HTML color, can be a text representation or a hex value, defaults to white.',
                weight: 'Optional: Canvas font weight, defaults to `normal`, can have values like `bold` or `300`.',
                outlines: 'Optional text outlines.\nThe outlines are drawn in the order they are in the array, so the second item is drawn on top of the first item.',
                lineSpacing: 'Line spacing as a percentage of the font size. 1.0 = 100%'
            },{
                outlines: ConfigImageEditorOutline.ref()
            }
        )
    }
}
export class ConfigImageEditorOutline extends Data {
    color: string = ''
    width: number = 0

    enlist() {
        DataMap.addSubInstance(
            new ConfigImageEditorOutline(),
            {
                color: 'A HTML color, can be a text representation or a hex value. Leave empty to use Twitch user color if available.',
                width: 'The width of the outline in pixels.'
            }
        )
    }
}