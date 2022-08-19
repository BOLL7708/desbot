interface IActionCallback {
    tag: string
    description: string
    awaitCall?: boolean
    call: (user: IActionUser, index?: number) => void // Index is used for entries-fields, provided by handler.
}
interface IActionsExecutor {
    timeMs?: number,
    delayMs?: number,
    execute: (user: IActionUser, index?: number) => void
}
interface IActionsMainCallback {
    (user: IActionUser, index?: number): void
}
interface IActions {
    /**
     * Optional: Set this to execute this batch of actions at a specific time in a timeline, overrides `_delayMs`.
     */
    _timeMs?: number
    /**
     * Optional: Set this to execute this batch of actions a set delay after the previous batch, can get overridden by `_timeMs`.
     */
    _delayMs?: number

    /**
     * Optional: Used to change SteamVR settings.
     */
    vrSetting?: IOpenVR2WSSetting

    /**
     * Optional: Used to move the SteamVR play space.
     */
    vrMoveSpace?: IOpenVR2WSMoveSpace

    /**
     * Optional: Used to toggle OBS sources or filters.
     */
    obs?: IObsAction

    /**
     * Optional: Trigger one or multiple pipe overlays.
     */
    pipe?: IPipeAction

    /**
     * Optional: Trigger OBS or VR screenshots.
     */
    screenshots?: IScreenshotAction

    /**
     * Optional: Trigger Philips Hue lights changes.
     */
    lights?: IPhilipsHueColorAction

    /**
     * Optional: Trigger Philips Hue plug changes.
     */
    plugs?: IPhilipsHuePlugAction

    /**
     * Optional: Trigger audio clips.
     */
    audio?: IAudioAction

    /**
     * Optional: Trigger the TTS to read a message.
     */
    speech?: ISpeechAction

    /**
     * Optional: Show a pop-in message in the browser source for the widget.
     */
    sign?: ISignAction

    /**
     * Optional: Execute a key command in a specific window.
     */
    keys?: IPressKeysAction

    /**
     * Optional: Trigger a custom URI.
     */
    uri?: IEntriesAction

    /**
     * Optional: Load a page or pages in the background.
     */
    web?: IEntriesAction

    /**
     * Optional: Send a message to a Discord channel, make sure to set a webhook URL in {@link Config.credentials.DiscordWebhooks} for the same key.
     */
    discord?: IEntriesAction

    /**
     * Optional: Send a message to the Twitch chat.
     */
    chat?: IEntriesAction

    /**
     * Optional: Send a whisper message to a Twitch user.
     */
    whisper?: IWhisperAction

    /**
     * Optional: Writes a label to settings.
     */
    label?: ILabelAction

    /**
     * Optional: Trigger other events, propagating input.
     */
    events?: IEventsAction

    /**
     * Optional: Send remote command to set remote command channel.
     */
    remoteCommand?: IEntriesAction

    /**
     * Optional: Change Twitch reward status, indexed on the key for the reward, set to the enabled state.
     */
    rewardStates?: IRewardStatesAction

    /**
     * Optional: Provide a custom action callback, this can execute any arbitrary code you provide.
     */
    custom?: IActionCallback

    /**
     * Optional: Performs functions in the TTS system.
     */
    tts?: ITTSAction
}

/**
 * Combined Reward and Command result object for shared actions.
 */
interface IActionUser {
    source: EEventSource
    eventKey: string
    id: string
    login: string
    name: string
    input: string
    message: string
    color: string
    isBroadcaster: boolean
    isModerator: boolean
    isVIP: boolean
    isSubscriber: boolean,
    bits: number,
    bitsTotal: number
    rewardCost: number
    commandConfig?: ITwitchActionCommandConfig
    rewardMessage?: ITwitchPubsubRewardMessage
}

interface IEventsAction {
    /**
     * Optional: Command(s) to trigger.
     */
    commandEntries?: string|string[]
    /**
     * Optional: Event(s) to trigger by key, referenced from {@link Keys}.
     */
    keyEntries?: string|string[]
    /**
     * Optional: Set the commands to be triggered at an interval to space things out in time.
     */
    interval?: number
}

interface ITextTags extends ITextTagsCached{
    userLogin: string
    userName: string
    userTag: string
    userNick: string
    userMessage: string
    userInput: string
    userInputHead: string
    userInputRest: string
    userInputTail: string
    userInputNoTags: string
    userInputNumber: string
    userInputTag: string
    userInputWord1: string
    userInputWord2: string
    userInputWord3: string
    userInputWord4: string
    userInputWord5: string
    userBits: string
    userBitsTotal: string
    userSubsTotal: string
    userSubsStreak: string
    userColor: string
    userVoice: string

    targetLogin: string
    targetName: string
    targetTag: string
    targetNick: string
    targetGame: string
    targetTitle: string
    targetLink: string
    targetColor: string
    targetVoice: string

    targetOrUserLogin: string
    targetOrUserName: string
    targetOrUserTag: string
    targetOrUserNick: string
    targetOrUserColor: string
    targetOrUserVoice: string

    gameId: string
    gamePrice: string
    gameLink: string
    gameName: string
    gameInfo: string
    gameDeveloper: string
    gamePublisher: string
    gameBanner: string
    gameRelease: string

    nowDate: string
    nowTime: string
    nowTimeMs: string
    nowDateTime: string
    nowDateTimeMs: string
    nowISO: string

    eventKey: string
    eventCost: string
    eventCount: string
    eventCountPercent: string
    eventGoal: string
    eventLevel: string
    eventLevelNext: string
    eventLevelMax: string
    eventLevelProgress: string
    eventLevelNextProgress: string
}

interface ITextTagsCached {
    lastDictionaryWord: string
    lastDictionarySubstitute: string
    lastTTSSetNickLogin: string
    lastTTSSetNickSubstitute: string
}

interface IMultiTierEventCounter {
    count: number
    timeoutHandle: number
}

interface ITTSAction {
    function: ETTSFunction
    inputOverride?: string
}

interface IWhisperAction {
    entries: string|string[]
    user: string
}

interface IRewardStatesAction {
    [key: string]: {
        /**
         * Optional: Set to true to enable the reward, false to disable, leave it out to toggle.
         */
        state?: boolean
        /**
         * Optional: Set this to add overrides for this reward for this session, meaning game profiles will not change it anymore.
         */
        override?: boolean
    }
}

// Data
interface IAudioAction {
    /**
     * The web URL, local URL or data URL of one or more audio files.
     */
    srcEntries: string | string[]

    /**
     * Optional: The volume of the audio, the valid range is 0.0 to 1.0.
     */
    volume?: number
    /**
     * Optional: A unique value that is provided to the callback for audio finished playing.
     * 
     * Will be overwritten for automatic rewards, and is used for some functionality in the fixed rewards.
     */
    nonce?: string
    /**
     * Optional: Repeat the playback of this audio this many times.
     */
    repeat?: number
    /**
     * Optional: Channel to play on, it's a separate instance of the audio player, defaults to 0.
     */
    channel?: number
}

/**
 * Send key-presses to a window.
 */
 interface IPressKeysAction {
    /**
     * The title of the window to send the key press to.
     */
    window: string
    /**
     * A list of commands to execute.
     */
    commands: IRunCommandConfig[]
    /**
     * Optional: Seconds before running the command if the optional reset value is provided.
     */
    duration?: number
    /**
     * Optional: Press enter at the end of every command, defaults to `true`.
     *
     * The thinking here is that most console commands need this, but it can be turned off if needed.
     */
    postfixEnterStroke?: boolean
}

interface ISpeechAction {
    entries: string|string[]
    skipDictionary?: boolean
    voiceOfUser?: string
    type?: ETTSType
}

interface ILabelAction {
    fileName: string
    text: string
    append?: boolean
}

interface IObsAction {
    /**
     * The name of the source to affect.
     */
    sourceName: string|string[]
    /**
     * Optional: If we are showing/hiding the source, we need to know which scene(s) it is in.
     */
    sceneNames?: string[]
    /**
     * Optional: Instead of toggling the source, we will toggle a filter on the source, which also means we don't have to provide the scene name(s).
     */
    filterName?: string
    /**
     * Optional: The source/filter will be switch state again after this amount of milliseconds, or provided.
     */
    durationMs?: number
    /**
     * Optional: Define a specific state, true is on/visible and the default.
     */
    state?: boolean
    /**
     * Optional: Set in code to reference the key that triggered it for group toggling.
     */
    key?: string
}

/**
 * Color config using the XY color space.
 * 
 * This can be retrieved from Philips Hue API after setting the color of the lights manually.
 * TODO: Add a function to get this through a chat command?
 */
interface IPhilipsHueColorAction {
    entries: IPhilipsHueBulb|IPhilipsHueBulb[]
    bulbs: number[]
}

/**
 * Configuration for a Philips Hue plug.
 */
interface IPhilipsHuePlugAction {
    /**
     * Id from the Philips Hue bridge
     */
    id: number
    /**
     * What it is reset to
     */
    originalState: boolean
    /**
     * What it is set to when triggered
     */
    triggerState: boolean
    /**
     * Optional: Will switch back to original state if supplied
     */
    duration?: number
}

interface IPipeAction {
    /**
     * Optional: An absolute path to an image or an array of image for random selection.
     * If this is skipped, `imageData` needs to be set instead.
     */
    imagePathEntries?: string|string[]
    /**
     * Optional: Image data (b64) for the image to be displayed.
     * If this is skipped, `imagePath` needs to be set instead.
     */
    imageDataEntries?: string|string[]
    /**
     * The duration for this notification to be displayed in milliseconds.
     */
    durationMs: number
    /**
     * Config for the custom notification, which can be generated with the Editor that comes with OpenVRNotificationPipe. 
     * You can copy the config as JS and paste it in a preset for easy referencing in the config.
     */
    config: IPipeCustomMessage
    /**
     * If your custom notification includes text areas, this is where you add the texts that are to be used for it.
     */
    texts?: string[]
}

interface IScreenshotAction {
    /**
     * Optional: Fill this in if you want to capture an OBS screenshot, 
     * if left out it will default to capture a VR screenshot.
     */
    obsSource?: string
    /**
     * Optional: Add a delay ïn seconds to the screenshot. Use this for a reward that will tell you 
     * want to screenshot, so you have time to frame the shot or strike a pose.
     */
    delay?: number
    /**
     * Optional: Add a count of screenshots if you want to trigger a burst.
     * It will wait for the previous callback before triggering the next shot.
     */
    burstCount?: number
}


/**
 * Configuration for a single Sign pop-in.
 */
interface ISignAction {
    /**
     * The title above the image, takes tags.
     */
    title: string
    /**
     * Optional: The image to display in the Sign pop-in, as web URL, local URL or data URL.
     * 
     * If not provided, the avatar image will be used instead, if available.
     */
    image?: string
    /**
     * The subtitle beneath the image, takes tags.
     */
    subtitle: string
    /**
     * The duration for the Sign to be visible for, in milliseconds.
     */
    durationMs: number
}

/**
 * Generic interface for actions that at the moment just takes strings.
 */
interface IEntriesAction {
    entries: string|string[]
}