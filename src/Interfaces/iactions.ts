export interface ITextTags extends ITextTagsCached{
    userId: string
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

    targetId: string
    targetLogin: string
    targetName: string
    targetTag: string
    targetNick: string
    targetGame: string
    targetTitle: string
    targetLink: string
    targetColor: string
    targetVoice: string

    targetOrUserId: string
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
    eventGoalShort: string

    eventLevel: string
    eventLevelNext: string
    eventLevelMax: string
    eventLevelProgress: string
    eventLevelNextProgress: string
}

export interface ITextTagsCached {
    lastDictionaryWord: string
    lastDictionarySubstitute: string
    lastTTSSetNickLogin: string
    lastTTSSetNickSubstitute: string
}

export interface IMultiTierEventCounter {
    count: number
    timeoutHandle: number
}

export interface IRewardStatesConfig {
    /**
     * Optional: Set to true to enable the reward, false to disable, leave it out to toggle.
     */
    state?: boolean
    /**
     * Optional: Set this to add overrides for this reward for this session, meaning game profiles will not change it anymore.
     */
    override?: boolean
}

// Data
export interface IAudioAction {
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

export type TRunType =
    'keys'
    | 'mouse'

/**
 * Configuration for a single Sign pop-in.
 */
export interface ISignAction {
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