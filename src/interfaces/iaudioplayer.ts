// Config
interface IAudioPlayerConfig {
    configs: IAudioPlayerConfigs
}
interface IAudioPlayerConfigs {
    [key:string]: IAudio
}

// Data
interface IAudio {
    src: string | string[] // Will randomize if array
    volume?: number
    nonce?: string
    repeat?: number
}

// Callbacks
interface IAudioPlayedCallback {
    (nonce: string, status: number): void
}