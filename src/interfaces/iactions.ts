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
    isSubscriber: boolean,
    bits: number,
    bitsTotal: number
}

interface ICommandConfig {
    /**
     * The command or commands to trigger, you can reference things in {@link Keys} here.
     */
    entries: string|string[]
    /**
     * Optional: Set the commands to be triggered at an interval to space things out in time.
     */
    interval?: number
}

interface ITextTags {
    userName: string
    userTag: string
    userNick: string
    userInput: string
    userNumber: string
    userWord: string
    userBits: string
    userBitsTotal: string

    gameId: string
    gamePrice: string
    gameLink: string
    gameName: string
    gameInfo: string
    gameDeveloper: string
    gamePublisher: string
    gameBanner: string
    gameRelease: string

    targetName: string
    targetTag: string
    targetNick: string
    targetGame: string
    targetTitle: string
    targetLink: string
}