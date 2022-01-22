// Config
interface IGoogleConfig {
    speakerTimeoutMs: number
    randomizeVoice: boolean
    randomizeVoiceLanguageFilter: string
    defaultVoice: string
    speakingRateOverride: number|undefined // 1.0 = 100%, Normally speech is faster the longer it is, this sets it to one fixed speed.
    skipSaid: boolean // Will skip the 'user' and 'said' text in "[user] said [text]" so it's only the clean text.
}

// Data
interface IGoogleVoice {
    languageCodes: string[]
    name: string
    ssmlGender: string
    naturalSampleRateHertz: number
}