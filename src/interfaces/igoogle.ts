// Config
interface IGoogleConfig {
    apiKey: string
    speakerTimeoutMs: number
    randomizeVoice: boolean
    defaultVoice: string
}

// Data
interface IGoogleVoice {
    languageCodes: string[]
    name: string
    ssmlGender: string
    naturalSampleRateHertz: number
}