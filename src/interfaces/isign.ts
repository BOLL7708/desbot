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

/**
 * Configuration for a single Sign pop-in.
 */
interface ISignShowConfig {
    /**
     * Optional: The title above the image, if not used will display the username if available.
     */
    title?: string
    /**
     * Optional: The image to display in the Sign pop-in, as web URL, local URL or data URL.
     * 
     * If not provided, the avatar image will be used instead, if available.
     */
    image?: string
    /**
     * Optional: The subtitle beneath the image, if not used will display the username if available.
     */
    subtitle?: string
    /**
     * The duration for the Sign to be visible for, in milliseconds.
     */
    durationMs: number
}