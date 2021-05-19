// Config
interface IGoogleConfig {
    apiKey: string
    speakerTimeoutMs: number
}

// Data
interface IGoogleVoice {
    languageCodes: string[]
    name: string
    ssmlGender: string
    naturalSampleRateHertz: number
}