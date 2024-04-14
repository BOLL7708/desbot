import AbstractData from '../AbstractData.js'
import {ConfigCleanText} from './ConfigCleanText.js'
import DataMap from '../DataMap.js'
import {IDictionary} from '../../../Interfaces/igeneral.js'

export class ConfigSpeech extends AbstractData {
    googleApiKey: string = ''
    speakerTimeoutMs: number = 10000
    randomizeVoice: boolean = true
    randomizeVoiceLanguageFilter: string = 'en-'
    defaultVoice: string = 'en-gb-wavenet-d'
    speakingRateOverride: number = -1
    skipSaid: boolean = false
    cleanTextConfig = new ConfigCleanText()
    dictionaryConfig = new ConfigSpeechDictionary()

    enlist() {
        DataMap.addRootInstance({
            instance: new ConfigSpeech(),
            description: 'These are settings for the Google Text-to-Speech API.\nGo here for more details: https://cloud.google.com/text-to-speech/docs/before-you-begin',
            documentation: {
                googleApiKey: 'API key for the Google Cloud Platform: Text To Speech API.',
                speakerTimeoutMs: 'This is the amount of time between two utterances that can pass before a person\'s name will be said again.',
                randomizeVoice: 'Turn this on to give new users a random voice.',
                randomizeVoiceLanguageFilter: 'Random voices will be selected fom this pattern, it is matched from the start of the voice name.\nIt will default to only randomize among non-standard voices, to get the best sounding ones. See examples:\n* "en-" for English\n* "en-GB-" for English (Great Britain)\n* "en-US-Wavenet-F" for English (United States) with a specific Voice Model',
                defaultVoice: 'This will be used if randomization is turned off, it\'s a voice name from Google\'s list of [TTS voices](https://cloud.google.com/text-to-speech/docs/voices).',
                speakingRateOverride: 'Normally speech is faster the longer it is, this sets it to one fixed speed. 1.0 = 100% speed.\n\nNote: Extreme values will distort the voice output.',
                skipSaid: 'Will skip the "user" and "said" text in "[user] said [text]" so it\'s only the clean text.',
                cleanTextConfig: 'Configuration for cleaning the text before it is spoken.',
                dictionaryConfig: 'Configuration for the dictionary that replaces words.'
            },
            types: {
                googleApiKey: 'string|secret'
            }
        })
    }
}
export class ConfigSpeechDictionary extends AbstractData {
    skipForAnnouncements: boolean = true
    replaceWordsWithAudio: boolean = true
    wordToAudioConfig: IDictionary<ConfigSpeechWordToAudio> = {}

    enlist() {
        DataMap.addSubInstance({
            instance: new ConfigSpeechDictionary(),
            documentation: {
                skipForAnnouncements: 'Will skip applying the dictionary to strings spoken as announcements, i.e. bot texts and reward strings.',
                replaceWordsWithAudio: 'This will convert the text to SSML, and replace words set in wordToAudioConfig.\nDue to how the TTS system works, these audio files needs to be hosted on a secure public host.',
                wordToAudioConfig: 'Word replacement configuration. Replace specific words with audio files. The audio files cannot be local, they need to be hosted on a webserver with https.\n\nThe key part is the word to be replaced, join multiple words with | to match multiples, e.g. "ha|haha|hahaha"'
            },
            types: {
                wordToAudioConfig: ConfigSpeechWordToAudio.ref.build()
            }
        })
    }
}
export class ConfigSpeechWordToAudio extends AbstractData {
    src: string[] = []

    enlist() {
        DataMap.addSubInstance({
            instance: new ConfigSpeechWordToAudio(),
            types: {
                src: 'string'
            }
        })
    }
}