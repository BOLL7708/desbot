class Dictionary {
    private static SSMLEscapeSymbols: { [x:string]: string } = {
        "\"": "&quot;",
        "'": "&apos;",
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;"
    }
    private static SSMLRegex = new RegExp(Object.keys(Dictionary.SSMLEscapeSymbols).join('|'), 'gi')

    private _dictionary: Map<string, string> = new Map()
    private _audioDictionary: Map<string, number> = new Map()
    private _audioConfigs: IGoogleAudio[] = []

    constructor() {
        // Build audio dictionary from Config
        for(const entry of Object.entries(Config.google.dictionaryConfig.wordToAudioConfig)) {
            const word = entry[0]
            const config = entry[1]
            this._audioConfigs.push(config)
            const configIndex = this._audioConfigs.length - 1
            for(const w of word.split('|')) {
                this._audioDictionary.set(w.toLowerCase().trim(), configIndex)
            }
        }
    }
    
    /**
     * Set the dicitionary to use.  
     * This is public for when new words are added at runtime.
     * @param dictionary
     */
    public set(dictionary: IDictionaryEntry[]) {
        if(dictionary != null) {
            dictionary.forEach(pair => {
                if(pair.original && pair.substitute) this._dictionary.set(pair.original, pair.substitute)
            })
        }
    }

    /**
     * Modify a string by replacing words in it with a match from the dictionary.
     * @param text
     * @returns The modified text.
     */
    public apply(text: string): string {
        const injectAudio = Config.google.dictionaryConfig.replaceWordsWithAudio

        // Add spaces after groups of symbols before word character, to make sure words are split up on space.
        let adjustedText = text.replace(
            /(\s*)([^\p{L}\p{M}\s]+)([\p{L}\p{M}]){1}/gu, 
            function(full, whiteSpace, symbols, letter) {
                if(whiteSpace.length > 0) return full // It's already separated from the prior word
                else if(symbols == "'") return full // It's likely an English abbreviated word combination
                else if(symbols.lastIndexOf('<') == (symbols.length -1)) return ` ${symbols}${letter}`
                else return `${symbols} ${letter}`
            }
        )

        // Split into words and filter out empty strings in case we had double spaces due to the above.
        const words = adjustedText.split(' ').filter(str => {return str.length > 0}) 
        words.forEach((word, i) => {
            // Ignore these symbols at the start and end of a word
            let wordKey = word.toLowerCase()
            let startSymbol = ''
            let endSymbol = ''

            // Matches using unicode character categories for letters and marks
            // https://unicode.org/reports/tr18/#General_Category_Property
            const match = wordKey.match(/([^\p{L}\p{M}]*)([\p{L}\p{M}]+)([^\p{L}\p{M}]*)/u)
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
            if(!done && this._dictionary.has(wordKey)) {
                Utils.log("${i} DOING WORD REPLACEMENT FOR " + word, Color.DarkOrange)
                let replaceWith = this._dictionary.get(wordKey)
                if(replaceWith && replaceWith.indexOf(',') > -1) { // Randomize if we find a list of words
                    replaceWith = Utils.randomFromArray(replaceWith.split(','))
                }
                replaceWith = `${startSymbol}${replaceWith}${endSymbol}` // Rebuild with replacement word
                if(injectAudio) {
                    replaceWith = this.escapeSymbolsForSSML(replaceWith)
                }
                words[i] = replaceWith
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