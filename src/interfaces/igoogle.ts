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

    /**
     * Configuration for cleaning the text before it is spoken.
     */
    cleanTextConfig: ICleanTextConfig

    dictionaryConfig: {
        /**
        * Will skip applying the dictionary to strings spoken as announcements, i.e. bot texts and reward strings.
        */
        skipForAnnouncements: boolean,

        /**
         * This will convert the text to SSML, and replace words set in wordToAudioConfig.
         * Due to how the TTS system works, these audio files needs to be hosted on a secure public host.
         */
        replaceWordsWithAudio: boolean

        /**
         * Word replacement configuration. Replace specific words with audio files. The audio files cannot be local, they need to be hosted on a webserver with https.
         * 
         * The key part is the word to be replaced, join multiple words with | to match multiples, e.g. "ha|haha|hahaha"
         */
        wordToAudioConfig: { [x:string]: IGoogleAudio }
    }
}

// Data
interface IGoogleVoice {
    languageCodes: string[]
    name: string
    ssmlGender: string
    naturalSampleRateHertz: number
}

/**
 * A full config for a SSML audio tag.  
 * See what all the settings do in detail here: https://cloud.google.com/text-to-speech/docs/ssml?authuser=0#attributes_1
 */
interface IGoogleAudio {
    /**
     * The full URL to the audio file.  
     * This needs to be .wav (deprecated but works?) .mp3 or .ogg.  
     * The file needs to be served off a secure host, SSL, https://.
     * 
     * An array will be randomized from, but all the same words in a sentece will get the same audio.
     */
    src: string|string[]
    /**
     * Remove time from the start of the audio file, in milliseconds.
     */
    clipBeginMs?: number
    /**
     * Where to stop playback in milliseconds, the value is time from the beginning of the audio file.
     */
    clipEndMs?: number
    /**
     * Playback speed of the audio file.  
     * Percentage of normal speed, denoted by `%` after the number.  
     * The range is 50% - 200%.
     */
    speedPer?: number
    /**
     * Repeat the audio file this many times.  
     * Ranges between 1 and 10, 0 is invalid and is seen as not set.
     */
    repeatCount?: number
    /**
     * Limit the possible playback duration.  
     * Number of second or milliseconds, denoted by `s` or `ms` after the number.
     */
    repeatDurMs?: number
    /**
     * Adjust the volume in decibels, default is +0db.  
     * Ranges between -40db to +40db, not sure if it's actually working though.
     */
    soundLevelDb?: number
}

interface ISpeechConfig {
    entries: string|string[]
    voiceOfUser?: string
    type?: TTSType
}