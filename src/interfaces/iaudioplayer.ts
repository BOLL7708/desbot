/**
 * Settings for the AudioPlayer which can play back local sound files or data URLs.
 */
interface IAudioPlayerConfig {
    /**
     * Configurations for audio playback that can be triggered by automatic rewards or other functions.
     */
    configs: { [key:string]: IAudioAction }
}


// Callbacks
interface IAudioPlayedCallback {
    (nonce: string, status: number): void
}