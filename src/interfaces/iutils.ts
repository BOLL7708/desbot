interface ICleanTextConfig {
    /**
     * Removes [word][number] in Twitch cher messages.
     */
    removeBitEmotes: boolean
    
    /**
     * Retains case during the transformations.
     */
    keepCase: boolean
    
    /**
     * Will replace @username tags with cleaned/stored usernames.
     */
    replaceUserTags: boolean

    /**
     * Remove text surrounded in parentheses or brackets: (like this).
     */
    removeParentheses: boolean

    /**
     * Will reduce anything with more repeated characters to only two.
     * 
     * Example: loooool -> lool
     */
    reduceRepeatedCharacters: boolean

    /**
     * Will replace numbers larger than a set number of digits.
     */
    replaceBigNumbers: boolean
    /**
     * Optional: Will replace the number with this text.
     */
    replaceBigNumbersWith?: string
    /**
     * Optional: The least amount of digits a number should have to be replaced.
     */
    replaceBigNumbersWithDigits?: number

    /**
     * Replace web links.
     */
    replaceLinks: boolean
    /**
     * Optional: Will replace the link with this text.
     */
    replaceLinksWith?: string

    /**
     * Removes unicode emojis characters.
     */
    removeUnicodeEmojis: boolean
}