// Config
interface IGoogleConfig {
    apiKey: string
    speakerTimeoutMs: number
    randomizeVoice: boolean
    randomizeVoiceLanguageFilter: string
    defaultVoice: string
    doNotSpeak: string[]
}

// Data
interface IGoogleVoice {
    languageCodes: string[]
    name: string
    ssmlGender: string
    naturalSampleRateHertz: number
}