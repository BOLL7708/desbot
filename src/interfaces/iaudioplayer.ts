/**
 * Settings for the AudioPlayer which can play back local sound files or data URLs.
 */
interface IAudioPlayerConfig {
    /**
     * Configurations for audio playback that are triggered by string matches.
     */
    configs: { [key:string]: IAudioAction }
}


// Callbacks
interface IAudioPlayedCallback {
    (nonce: string, status: number): void
}