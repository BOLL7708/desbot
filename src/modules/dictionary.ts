class Dictionary {
    private _dictionary: Map<string, string> = new Map()
    
    public set(dictionary: IDictionaryEntry[]) {
        if(dictionary != null) {
            dictionary.forEach(pair => {
                if(pair.original && pair.substitute) this._dictionary.set(pair.original, pair.substitute)
            })
        }
    }

    public apply(text: string): string {
        // Attach spaces to some characters as they could be missing and we want to match surrounding words
        let adjustedText = text.replace(/[\-_:;\.,()\[\]~|]/g, function(a, b) { return `${a} ` })

        // Split into words and filter out empty strings in case we had double spaces due to the above.
        const words = adjustedText.split(' ').filter(str => {return str.length > 0}) 
        words.forEach((word, i) => {
            // Ignore these symbols at the start and end of a word
            let wordKey = word.toLowerCase()
            let startSymbol = ''
            let endSymbol = ''

            // Matches using unicode character categories for letters and marks
            const match = wordKey.match(/([^\p{L}\p{M}]*)([\p{L}\p{M}]+)([^\p{L}\p{M}]*)/u)
            if(match != null) {
                startSymbol = match[1]
                wordKey = match[2]
                endSymbol = match[3]
            }
            
            // Actual replacement
            if(this._dictionary.has(wordKey)) {
                let replaceWith = this._dictionary.get(wordKey)
                if(replaceWith && replaceWith.indexOf(',') > -1) { // Randomize if we find a list of words
                    replaceWith = Utils.randomFromArray(replaceWith.split(','))
                }
                words[i] = `${startSymbol}${replaceWith}${endSymbol}` // Rebuild with replacement word
            }
        })
        return words.join(' ')
    }
}