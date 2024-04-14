import {AbstractOption} from './AbstractOption.js'
import {OptionsMap} from './OptionsMap.js'

export class OptionTTSType extends AbstractOption {
    static readonly Said = 100 //
    static readonly Action = 200 // [name] [text]
    static readonly Announcement = 300 // [text]
    static readonly Cheer = 400// [name] cheered: [text]
}
OptionsMap.addPrototype({
    prototype: OptionTTSType,
    description: 'The various forms of TTS speech.',
    documentation: {
        Said: 'Will be read as -> [name] said: [text]',
        Action: 'Will be read as -> [name] [text]',
        Announcement: 'Will be read as -> [text]',
        Cheer: 'Will be read as -> [name] cheered: [text]'
    }
})

export class OptionTTSFunctionType extends AbstractOption {
    static readonly Enable = 100
    static readonly Disable = 101
    static readonly StopCurrent = 110
    static readonly StopAll = 111
    static readonly SetUserEnabled = 200
    static readonly SetUserDisabled = 201
    static readonly SetUserNick = 210
    static readonly GetUserNick = 211
    static readonly ClearUserNick = 212
    static readonly SetUserVoice = 220
    static readonly GetUserVoice = 221
    static readonly SetUserGender = 230
    static readonly SetDictionaryEntry = 300
    static readonly GetDictionaryEntry = 301
}
OptionsMap.addPrototype({
    prototype: OptionTTSFunctionType,
    description: 'The different functions an action can trigger for the TTS system.',
    documentation: {
        Enable: 'Will enable the TTS as a whole.',
        Disable: 'Will disable the TTS as a whole.',
        StopCurrent: 'Will stop the current playback.',
        StopAll: 'Will stop the current playback and empty the queue.',
        SetUserEnabled: 'Enable a user to use the TTS.',
        SetUserDisabled: 'Disable a user from using the TTS.',
        SetUserNick: 'Set a nickname for a user.',
        GetUserNick: 'Get a nickname for a user.',
        ClearUserNick: 'Clear the nickname for a user.',
        SetUserVoice: 'Set the voice for a user.',
        GetUserVoice: 'Get the voice for a user.',
        SetUserGender: 'Set the gender for a user.',
        SetDictionaryEntry: 'Set or update a dictionary entry.',
        GetDictionaryEntry: 'Get a dictionary entry.'
    }
})