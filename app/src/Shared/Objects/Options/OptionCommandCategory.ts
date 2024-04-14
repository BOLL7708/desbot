import {AbstractOption} from './AbstractOption.js'
import {OptionsMap} from './OptionsMap.js'

export default class OptionCommandCategory extends AbstractOption {
    static readonly Uncategorized = 0
    static readonly Admin = 1000
    static readonly System = 2000
    static readonly Twitch = 3000
    static readonly Steam = 4000
    static readonly SteamVR = 4100
    static readonly TTS = 5000
    static readonly Dictionary = 5100
    static readonly Chat = 6000
    static readonly Links = 6100
    static readonly Utility = 7000
    static readonly Misc = 8000
    static readonly Custom = 9000
}
OptionsMap.addPrototype({
    prototype: OptionCommandCategory,
    description: 'Categories of commands.',
    documentation: {
        Uncategorized: 'Uncategorized commands',
        Admin: 'Admin commands',
        System: 'System commands',
        Twitch: 'Twitch commands',
        Steam: 'Steam commands',
        SteamVR: 'SteamVR commands',
        TTS: 'Text-To-Speech commands',
        Dictionary: 'Dictionary commands',
        Chat: 'Chat commands',
        Links: 'Link commands',
        Utility: 'Utility commands',
        Misc: 'Misc commands',
        Custom: 'Custom commands'
    }
})