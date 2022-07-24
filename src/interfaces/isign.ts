/**
 * The sign can display a graphic with title and subtitle as a pop-in in the widget browser source.
 */
interface ISignConfig {
    /**
     * Set if the Sign is enabled at all.
     */
    enabled: boolean
    /**
     * The full width of the sign pop-in.
     */
    width: number
    /**
     * The full height of the sign pop-in.
     */
    height: number
    /**
     * Amount of time it takes for the Sign to appear, in milliseconds.
     */
    transitionDurationMs: number
    /**
     * Font family of the titles in the Sign, can be any font that exists on the system.
     */
    fontFamily: string
    /**
     * Font color of the titles in the Sign, can be an HTML color or a hex value.
     */
    fontColor: string
    /**
     * Font size of the titles in the Sign, in pixels.
     */
    fontSize: string
    /**
     * From which side the Sign appears: `left, right, top, bottom`
     */
    direction: string
}
