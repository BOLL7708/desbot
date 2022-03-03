/**
 * Settings for the AudioPlayer which can play back local sound files or data URLs.
 */
interface IAudioPlayerConfig {
    /**
     * Configurations for audio playback that can be triggered by automatic rewards or other functions.
     */
    configs: { [key:string]: IAudio }
}

// Data
interface IAudio {
    /**
     * The web URL, local URL or data URL of the audio file to play.
     * 
     * If an array of URLs is provided, a random URL out of those will be used.
     */
    src: string | string[]
    /**
     * Optional: The volume of the audio, the valid range is 0.0 to 1.0.
     */
    volume?: number
    /**
     * Optional: A unique value that is provided to the callback for audio finished playing.
     * 
     * Not really used for automatic rewards, but for some functionality in the `MainController`.
     */
    nonce?: string
    /**
     * Optional: Repeat the playback of this audio this many times.
     */
    repeat?: number
}

// Callbacks
interface IAudioPlayedCallback {
    (nonce: string, status: number): void
}