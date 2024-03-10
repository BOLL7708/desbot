import {ConfigSpeech} from '../Objects/Config/ConfigSpeech.js'
import {IGoogleAudio} from '../Interfaces/igoogle.js'
import DataBaseHelper from './DataBaseHelper.js'
import Utils from './Utils.js'

export default class Dictionary {
    private static SSMLEscapeSymbols: { [x:string]: string } = {
        "\"": "&quot;",
        "'": "&apos;",
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;"
    }
    private static SSMLRegex = new RegExp(Object.keys(Dictionary.SSMLEscapeSymbols).join('|'), 'gi')

    private _config = new ConfigSpeech()
    private _dictionary: Map<string, string> = new Map()
    private _audioDictionary: Map<string, number> = new Map()
    private _audioConfigs: IGoogleAudio[] = []

    constructor() {
        this.init().then()
    }

    private async init() {
        // Load config
        this._config = await DataBaseHelper.loadMain(new ConfigSpeech())

        // Build audio dictionary from Config
        for(const [word, config] of Object.entries(this._config.dictionaryConfig.wordToAudioConfig)) {
            this._audioConfigs.push(config)
            const configIndex = this._audioConfigs.length - 1
            for(const w of word.split('|')) {
                this._audioDictionary.set(w.toLowerCase().trim(), configIndex)
            }
        }
    }


    /**
     * Set the dictionary to use, will append or update the existing entries.
     * This is public for when new words are added at runtime.
     * @param dictionary New entries for the dictionary.
     * @param clearExisting If true, will clear the existing dictionary.
     */
    public set(dictionary?: IDictionaryEntry[], clearExisting = false): void {
        if(clearExisting) this._dictionary.clear()
        if(dictionary) {
            for(const entry of dictionary) {
                if(entry.original && entry.substitute) this._dictionary.set(entry.original, entry.substitute)
            }
        }
    }

    /**
     * Modify a string by replacing words in it with a match from the dictionary.
     * @param text
     * @returns The modified text.
     */
    public apply(text: string): string {
        const injectAudio = this._config.dictionaryConfig.replaceWordsWithAudio

        // Split into words and filter out empty strings in case we had double spaces due to the above.
        const words = text.split(' ').filter(str => {return str.length > 0})
        words.forEach((word, i) => {
            // Ignore these symbols at the start and end of a word
            let wordKey = word.toLowerCase()
            let startSymbol = ''
            let endSymbol = ''

            // Matches using unicode character categories for letters and marks
            // https://unicode.org/reports/tr18/#General_Category_Property
            // https://www.regular-expressions.info/unicode.html
            const regex = /([^\p{Letter}\p{Mark}]*)([\p{Letter}\p{Mark}]+)([^\p{Letter}\p{Mark}]*.*)/u
            const match = wordKey.match(regex)
            if(match != null) {
                startSymbol = match[1]
                wordKey = match[2]
                endSymbol = match[3]
            }
            
            // Word replacement by audio
            let done = false
            if(injectAudio && this._audioDictionary.has(wordKey)) {
                const audioConfigIndex = this._audioDictionary.get(wordKey)
                if(audioConfigIndex !== undefined) {
                    const audioConfig = this._audioConfigs[audioConfigIndex]
                    const replaceWith = this.buildSSMLAudioTag(wordKey, audioConfig)
                    words[i] = `${startSymbol}${replaceWith}${endSymbol}` // Rebuild with replacement word    
                    done = true
                }
            }

            // Word replacement with other word(s)
            if(!done) {
                const full = startSymbol+wordKey+endSymbol
                const head = startSymbol+wordKey
                const tail = wordKey+endSymbol

                let dictionaryEntry: string|undefined = undefined
                if(this._dictionary.has(full)) {
                    dictionaryEntry = this._dictionary.get(full)
                    startSymbol = ''
                    endSymbol = ''
                } else if(this._dictionary.has(head)) {
                    dictionaryEntry = this._dictionary.get(head)
                    startSymbol = ''
                } else if(this._dictionary.has(tail)) {
                    dictionaryEntry = this._dictionary.get(tail)
                    endSymbol = ''
                } else if(this._dictionary.has(wordKey)) {
                    dictionaryEntry = this._dictionary.get(wordKey)
                }
                if(dictionaryEntry) {
                    const replaceWithArr = Utils.splitOnAny(dictionaryEntry, ',;')
                    let replaceWith = ''
                    if(replaceWithArr.length > 0) { // Randomize if we find a list of words
                        replaceWith = Utils.randomFromArray(replaceWithArr)
                    }
                    replaceWith = `${startSymbol}${replaceWith}${endSymbol}` // Rebuild with replacement word
                    if(injectAudio) {
                        replaceWith = this.escapeSymbolsForSSML(replaceWith)
                    }
                    words[i] = replaceWith
                }
            }
        })
        return words.join(' ')
    }

    /**
     * Return a SSML Audio tag for a word and config.
     * @param word 
     * @param config 
     * @returns 
     */
    private buildSSMLAudioTag(word: string, config: IGoogleAudio): string {
        const src = Utils.randomFromArray(config.src)
        let audioTag = `<audio src="${src}"`
        if(config.soundLevelDb != undefined) audioTag += ` soundLevel="${config.soundLevelDb}db"`
        if(config.clipBeginMs != undefined) audioTag += ` clipBegin="${config.clipBeginMs}ms"`
        if(config.clipEndMs != undefined) audioTag += ` clipEnd="${config.clipEndMs}ms"`
        if(config.repeatCount != undefined) audioTag += ` repeatCount="${config.repeatCount}"`
        if(config.repeatDurMs != undefined) audioTag += ` repeatDur="${config.repeatDurMs}ms"`
        if(config.speedPer != undefined) audioTag += ` speed="${config.speedPer}%"`
        audioTag += `>${word}</audio>`
        return audioTag
    }
    
    /**
     * Escape symbols for SSML.  
     * We do this as what we send to Google is now always SSML, to support the text to audio replacement.
     * @link https://cloud.google.com/text-to-speech/docs/ssml
     * @param text 
     * @returns 
     */
    private escapeSymbolsForSSML(text: string): string {
        return text.replace(Dictionary.SSMLRegex, function(matched) { return Dictionary.SSMLEscapeSymbols[matched] })
    }
}

export interface IDictionaryEntry {
    original: string
    substitute: string
}
