// Data
export interface IAudioAction { // TODO: Phase this out
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