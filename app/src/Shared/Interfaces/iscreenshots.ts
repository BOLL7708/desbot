/**
 * Reference data about a screenshot that is cached from triggering it until it is completed.
 */
 export interface IScreenshotRequestData {
    /**
     * Key for the event that triggered the screenshot.
     */
    eventKey: string
    /**
     * Twitch user ID for the redeemer.
     */
    userId: number
    /**
     * Twitch username for the redeemer.
     */
    userName: string
    /**
     * Input from the Twitch reward redemption.
     */
    userInput: string
}
