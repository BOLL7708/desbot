// Config
interface IAudioPlayerConfig {
    [key:string]: IAudio
}

// Data
interface IAudio {
    src: string | string[] // Will randomize if array
    nonce?: string
}