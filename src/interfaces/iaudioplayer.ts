// Config
interface IAudioPlayerConfig {
    configs: IAudioPlayerRewardConfigs
}
interface IAudioPlayerRewardConfigs {
    [key:string]: IAudio
}

// Data
interface IAudio {
    src: string | string[] // Will randomize if array
    volume?: number
    nonce?: string
}

// Callbacks
interface IAudioPlayedCallback {
    (nonce: string, status: number): void
}