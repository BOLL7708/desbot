import Data from '../Data.js'
import DataMap from '../DataMap.js'

export class ConfigCleanText extends Data {
    removeBitEmotes: boolean = false
    keepCase: boolean = false
    replaceUserTags: boolean = true
    removeParentheses: boolean = true
    reduceRepeatedCharacters: boolean = true
    replaceBigNumbers: boolean = true
    replaceBigNumbersWith: string = '"big number"'
    replaceBigNumbersWithDigits: number = 7
    replaceLinks: boolean = true
    replaceLinksWith: string = '"link"'
    replaceAmpersandWith: string = 'and'
    removeUnicodeEmojis: boolean = true

    enlist() {
        DataMap.addSubInstance({
            instance: new ConfigCleanText(),
            documentation: {
                removeBitEmotes: 'Removes [word][number] in Twitch cher messages.',
                keepCase: 'Retains case during the transformations.',
                replaceUserTags: 'Will replace @username tags with cleaned/stored usernames.',
                removeParentheses: 'Remove text surrounded in parentheses or brackets: (like this).',
                reduceRepeatedCharacters: 'Will reduce anything with more repeated characters to only two.\n\nExample: loooool -> lool',
                replaceBigNumbers: 'Will replace numbers larger than a set number of digits.',
                replaceBigNumbersWith: 'Will replace the number with this text.',
                replaceBigNumbersWithDigits: 'The least amount of digits a number should have to be replaced.',
                replaceLinks: 'Replace web links.',
                replaceLinksWith: 'Will replace the link with this text.',
                replaceAmpersandWith: 'Will replace the & symbol with the supplied value.',
                removeUnicodeEmojis: 'Removes unicode emojis characters.'
            }
        })
    }
}