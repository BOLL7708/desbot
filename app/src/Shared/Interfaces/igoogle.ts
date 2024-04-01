// Data
export interface IGoogleVoice {
    languageCodes: string[]
    name: string
    ssmlGender: string
    naturalSampleRateHertz: number
}

/**
 * A full config for a SSML audio tag.  
 * See what all the settings do in detail here: https://cloud.google.com/text-to-speech/docs/ssml?authuser=0#attributes_1
 */
export interface IGoogleAudio {
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