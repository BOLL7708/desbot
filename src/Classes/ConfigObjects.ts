import BaseDataObject, {BaseDataObjectMap} from './BaseDataObject.js'
import {IStringDictionary} from '../Interfaces/igeneral.js'

/*
 * TODO: For config classes to make sense, we should flatten them as much as possible.
 *  Make sub-dictionaries surface level and then have the editor split on capital letter.
 *  This means { data: { other: 1, more: 2 } } will be { dataOther: 1, dataMore: 2 }.
 *  The exception is when the array or dictionary fits an arbitrary number of items,
 *  then we should make them contain sub-classes, and the editor can add more instances.
 */

export default class ConfigObjects extends BaseDataObjectMap {
    constructor() {
        super()
        // this.addInstance(new ConfigExample())
        this.addMainInstance(
            new ConfigOpenVR2WS(),
            'Get things like currently played SteamVR game and change SteamVR settings with OpenVR2WS.',
            {
                port: 'The port that is set in the OpenVR2WS application.'
            }
        )
        this.addMainInstance(
            new ConfigDiscord(),
            'Settings for sending things to Discord channels.',
            {
                prefixCheer: 'Prefix added to cheer messages in the log.\n\nNote: This prefix should include a trailing space if you want it to be separated from the message.',
                prefixReward: 'Prefix added to reward messages in the log.\n\nNote: This prefix should include a trailing space if you want it to be separated from the message.',
                screenshotEmbedColorManual: 'Embed highlight color for manual screenshots.\n\nNote: This has to be a hex color to work with Discord.',
                screenshotEmbedColorRemote: 'Default embed highlight color for redeemed screenshots, will use the user color instead if they have spoken at least once.\n\nNote: This has to be a hex color to work with Discord.'
            }
        )
        this.addMainInstance(
            new ConfigSign(),
            'The sign can display a graphic with title and subtitle as a pop-in in the widget browser source.',
            {
                direction: 'From which side the Sign appears: `left, right, top, bottom`',
                enabled: 'Set if the Sign is enabled at all.',
                fontColor: 'Font color of the titles in the Sign, can be an HTML color or a hex value.',
                fontFamily: 'Font family of the titles in the Sign, can be any font that exists on the system.',
                fontSize: 'Font size of the titles in the Sign, in pixels.',
                sizeHeight: 'The full height of the sign pop-in.',
                sizeWidth: 'The full width of the sign pop-in.',
                transitionDurationMs: 'Amount of time it takes for the Sign to appear, in milliseconds.'
            }
        )
        this.addMainInstance(
            new ConfigRelay(),
            'Settings to connect to the WSRelay accessory application.',
            {
                port: 'The port that is set in the WSRelay application.',
                streamDeckChannel: 'The channel to use for the Stream Deck plugin. (WIP)'
            }
        )
        this.addMainInstance(
            new ConfigPhilipsHue(),
            'Control Philips Hue lights or sockets.',
            {
                serverPath: 'Local IP address of the Philips Hue bridge, start with the protocol: http://'
            }
        )
        this.addMainInstance(
            new ConfigExample(),
            'Test config for deeper structures.',
            {
                singleValue: 'Hello!',
                arrayOfStrings: 'Just strings derp.',
                dictionaryOfStrings: 'Just strings with keys',
                arrayOfSubClasses: 'A cake!',
                dictionaryWithSubClasses: 'Oh my...',
                singleInstance: 'A single instance yeah!',
            },
            {
                arrayOfStrings: 'string',
                dictionaryOfStrings: 'string',
                arrayOfSubClasses: new ConfigExampleSub().constructor.name,
                dictionaryWithSubClasses: new ConfigExampleSub().constructor.name
            }
        )
        this.addSubInstance(
            new ConfigExampleSub(),
            {
                subClassValue: 'Just a subclass value yeah?',
                subClassArray: 'An array of numbers yo!'
            },
            {
                subClassArray: 'number'
            }
        )
        this.addMainInstance(
            new ConfigSpeech(),
            'These are settings for the Google Text-to-Speech API.',
            {
                speakerTimeoutMs: 'This is the amount of time between two utterances that can pass before a person\'s name will be said again.',
                randomizeVoice: 'Turn this on to give new users a random voice.',
                randomizeVoiceLanguageFilter: 'Random voices will be selected fom this pattern, it is matched from the start of the voice name.\nIt will default to only randomize among non-standard voices, to get the best sounding ones. See examples:\n* "en-" for English\n* "en-GB-" for English (Great Britain)\n* "en-US-Wavenet-F" for English (United States) with a specific Voice Model',
                defaultVoice: 'This will be used if randomization is turned off, it\'s a voice name from Google\'s list of [TTS voices](https://cloud.google.com/text-to-speech/docs/voices).',
                speakingRateOverride: 'Normally speech is faster the longer it is, this sets it to one fixed speed. 1.0 = 100% speed.\n\nNote: Extreme values will distort the voice output.',
                skipSaid: 'Will skip the "user" and "said" text in "[user] said [text]" so it\'s only the clean text.',
                cleanTextConfig: 'Configuration for cleaning the text before it is spoken.',
                dictionaryConfig: 'Configuration for the dictionary that replaces words.'
            },
            {}
        )
        this.addSubInstance(
            new ConfigCleanText(),
            {
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
                removeUnicodeEmojis: 'Removes unicode emojis characters.'
            },
            {}
        )
        this.addSubInstance(
            new ConfigSpeechDictionary(),
            {
                skipForAnnouncements: 'Will skip applying the dictionary to strings spoken as announcements, i.e. bot texts and reward strings.',
                replaceWordsWithAudio: 'This will convert the text to SSML, and replace words set in wordToAudioConfig.\nDue to how the TTS system works, these audio files needs to be hosted on a secure public host.',
                wordToAudioConfig: 'Word replacement configuration. Replace specific words with audio files. The audio files cannot be local, they need to be hosted on a webserver with https.\n\nThe key part is the word to be replaced, join multiple words with | to match multiples, e.g. "ha|haha|hahaha"'
            },
            {
                wordToAudioConfig: new ConfigSpeechWordToAudio().constructor.name
            }
        )
        this.addSubInstance(
            new ConfigSpeechWordToAudio(),
            {},
            {},
        )
    }
}

export class ConfigExample extends BaseDataObject {
    public singleInstance = new ConfigExampleSub()
    public singleValue = ''
    public arrayOfStrings: string[] = [
        'one', 'two', 'three'
    ]
    public dictionaryOfStrings: IStringDictionary = {
        hello: 'Testing!',
        bye: 'More tests'
    }
    public arrayOfSubClasses: ConfigExampleSub[] = [
        new ConfigExampleSub(),
        new ConfigExampleSub()
    ]
    // TODO: Needs to add interface to add elements to dictionary
    public dictionaryWithSubClasses: { [key:string]: ConfigExampleSub } = {
        dictionaryEntry1: new ConfigExampleSub(),
        dictionaryEntry2: new ConfigExampleSub()
    }
}

export class ConfigExampleSub extends BaseDataObject {
    public subClassValue: string = 'A value'
    public subClassArray: number[] = [1,2,3]
}

export class ConfigOpenVR2WS extends BaseDataObject {
    port: number = 7708
}

export class ConfigDiscord extends BaseDataObject {
    prefixCheer: string = '*Cheer*: '
    prefixReward: string = '*Reward*: '
    screenshotEmbedColorManual: string = '#FFFFFF'
    screenshotEmbedColorRemote: string = '#000000'
}

export class ConfigSign extends BaseDataObject {
    direction: string = 'left'
    enabled: boolean = true
    fontColor: string = '#FFFFFF'
    fontFamily: string = 'Arial'
    fontSize: string = '150%'
    sizeHeight: number = 300
    sizeWidth: number = 240
    transitionDurationMs: number = 500
}

export class ConfigRelay extends BaseDataObject {
    port: number = 7788
    streamDeckChannel: string = 'streaming_widget'
}

export class ConfigPhilipsHue extends BaseDataObject {
    serverPath: string = 'http://'
}

export class ConfigSpeech extends BaseDataObject {
    speakerTimeoutMs: number = 10000
    randomizeVoice: boolean = true
    randomizeVoiceLanguageFilter: string = 'en-'
    defaultVoice: string = 'en-gb-wavenet-d'
    speakingRateOverride: number = -1
    skipSaid: boolean = false
    cleanTextConfig = new ConfigCleanText()
    dictionaryConfig = new ConfigSpeechDictionary()
}
export class ConfigCleanText extends BaseDataObject {
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
    removeUnicodeEmojis: boolean = true
}
export class ConfigSpeechDictionary extends BaseDataObject {
    skipForAnnouncements: boolean = true
    replaceWordsWithAudio: boolean = true
    wordToAudioConfig: { [key:string]: ConfigSpeechWordToAudio } = {}
}
export class ConfigSpeechWordToAudio extends BaseDataObject {
    src: string[] = []
}