/**
 * Combined Reward and Command result object for shared actions.
 */
interface IActionUser {
    id: string
    login: string
    name: string
    input: string
    color: string
    isBroadcaster: boolean
    isModerator: boolean
    isVIP: boolean
    isSubscriber: boolean
}

interface ICommandConfig {
    /**
     * The command or commands to trigger, you can reference things in {@link Keys} here.
     */
    commands: string|string[]
    /**
     * Optional: Set the commands to be triggered at an interval to space things out in time.
     */
    interval?: number
}