import {IAudioAction} from './iactions.js'

/**
 * Settings for the AudioPlayer which can play back local sound files or data URLs.
 */
export interface IAudioPlayerConfig {
    /**
     * Configurations for audio playback that are triggered by string matches.
     */
    configs: { [key:string]: IAudioAction }
}


// Callbacks
export interface IAudioPlayedCallback {
    (nonce: string, status: number): void
}