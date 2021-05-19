/** GOOGLE */
interface IGoogleConfig {
    apiKey: string
    speakerTimeoutMs: number
}
interface IGoogleVoice {
    languageCodes: string[]
    name: string
    ssmlGender: string
    naturalSampleRateHertz: number
}
