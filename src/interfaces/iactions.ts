interface IActionCallback {
    tag: string
    description: string
    call: (user: IActionUser, index?: number, redemptionMessage?: ITwitchPubsubRewardMessage) => void
}

interface IActionsTimeline { [ms: number]: IActions }
interface IActions {
    // TODO: Add array support to everything? Random/Shuffle functionality?

    /**
     * Optional: Used to change SteamVR settings.
     */
    openVR2WS?: IOpenVR2WSSetting|IOpenVR2WSSetting[]

    /**
     * Optional: Used to toggle OBS sources or filters.
     */
    obs?: IObsSourceConfig|IObsSourceConfig[]

    /**
     * Optional: Trigger one or multiple pipe overlays.
     */
    pipe?: IPipeMessagePreset|IPipeMessagePreset[]

    /**
     * Optional: Trigger OBS or VR screenshots.
     */
    screenshots?: IScreenshot

    /**
     * Optional: Trigger Philips Hue lights changes.
     */
    lights?: IPhilipsHueColorConfig|IPhilipsHueColorConfig[]

    /**
     * Optional: Trigger Philips Hue plug changes.
     */
    plugs?: IPhilipsHuePlugConfig

    /**
     * Optional: Trigger audio clips.
     */
    audio?: IAudio

    /**
     * Optional: Trigger the TTS to read a message.
     * 
     * Note: Supplying an array will pick a random one, or if the reward is incrementing, it will pick the matching index.
     */
    speech?: ISpeechConfig

    /**
     * Optional: Show a pop-in message in the browser source for the widget.
     */
    sign?: ISignShowConfig

    /**
     * Optional: Execute a key command in a specific window or trigger a custom URI.
     */
    exec?: IExecConfig

    /**
     * Optional: Load a page in the background.
     * 
     * Note: Supplying an array will pick a random one, or if the reward is incrementing, it will pick the matching index.
     */
    web?: string

    /**
     * Optional: Send a message to a Discord channel, make sure to set a webhook URL in {@link Config.credentials.webhooks} for the same key.
     * 
     * Note: Supplying an array will pick a random one, or if the reward is incrementing, it will pick the matching index.
     */
    discord?: string|string[],

    /**
     * Optional: Send a message to the Twitch chat.
     * 
     * Note: Supplying an array will pick a random one, or if the reward is incrementing, it will pick the matching index.
     */
    chat?: string|string[]

    /**
     * Optional: Send a whisper message to a Twitch user.
     */
    whisper?: IWhisperConfig

    /**
     * Optional: Writes a label to settings.
     */
    label?: ILabelConfig

    /**
     * Optional: Trigger other commands, propagating input.
     */
    commands?: ICommandConfig

    /**
     * Optional: Send remote command to set remote command channel.
     */
    remoteCommand?: string

    /**
     * Optional: Change Twitch reward status, indexed on the key for the reward, set to the enabled state.
     */
    rewardStates?: IRewardStatesConfig
}

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
    userLogin: string
    userName: string
    userTag: string
    userNick: string
    userInput: string
    userNumber: string
    userWord: string
    userBits: string
    userBitsTotal: string
    userSubsTotal: string
    userSubsStreak: string

    gameId: string
    gamePrice: string
    gameLink: string
    gameName: string
    gameInfo: string
    gameDeveloper: string
    gamePublisher: string
    gameBanner: string
    gameRelease: string

    targetLogin: string
    targetName: string
    targetTag: string
    targetNick: string
    targetGame: string
    targetTitle: string
    targetLink: string

    utilRandom: string
}

interface ITTSConfig {

}

interface IWhisperConfig {
    entries: string|string[]
    user: string
}

interface IRewardStatesConfig {
    [key: string]: boolean
}