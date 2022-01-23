/**
 * These are settings for the Google Text-to-Speech API.
 */
interface IGoogleConfig {
    /**
     * This is the amount of time between two utterances that can pass before a person's name will be said again.
     */
    speakerTimeoutMs: number
    
    /**
     * Turn this on to give new users a random voice.
     */
    randomizeVoice: boolean
    
    /**
     * Random voices will be selected fom this pattern, it is matched from the start of the voice name. 
     * It will default to only randomize among Wavenet voices, because they sound the best. See examples:
     * - `en-` for English
     * - `en-GB-` for English (Great Britain)
     * - `en-US-Wavenet-F` for English (United States) with a specific Voice Model
     */
    randomizeVoiceLanguageFilter: string
    
    /**
     * This will be used if randomization is turned off, it's a voice name from Google's list of [TTS voices](https://cloud.google.com/text-to-speech/docs/voices).
     */
    defaultVoice: string
    
    /**
     * Normally speech is faster the longer it is, this sets it to one fixed speed. 1.0 = 100% speed.
     * 
     * Note: Extreme values will distort the voice.
     */
    speakingRateOverride: number|undefined
    
    /**
     * Will skip the 'user' and 'said' text in "[user] said [text]" so it's only the clean text.
     */
    skipSaid: boolean
}

// Data
interface IGoogleVoice {
    languageCodes: string[]
    name: string
    ssmlGender: string
    naturalSampleRateHertz: number
}