import {Option} from './Option.js'
import {OptionsMap} from './OptionsMap.js'
import {OptionScreenshotType} from './OptionScreenshotType.js'

export class OptionSteamVRSettingCategory extends Option {
    static readonly CurrentAppID = ''
    static readonly SteamVR = 'steamvr'
    static readonly Input = 'input'
}
export class OptionSteamVRSettingType extends Option {
    static readonly WorldScale = 'worldScale'
    static readonly MirrorViewEye = 'mirrorViewEye'
    static readonly KnucklesLeftThumbstickRotation = 'leftThumbstickRotation_knuckles'
    static readonly KnucklesRightThumbstickRotation = 'rightThumbstickRotation_knuckles'
    static readonly HMDAnalogGain = 'analogGain'
    static readonly HMDRefreshRate = 'preferredRefreshRate'
    static readonly HMDDisplayGainRed = 'hmdDisplayColorGainR'
    static readonly HMDDisplayGainGreen = 'hmdDisplayColorGainG'
    static readonly HMDDisplayGainBlue = 'hmdDisplayColorGainB'
}
OptionsMap.addPrototype(
    OptionSteamVRSettingCategory,
    'The setting category, reference steamvr.vrsettings or default.vrsettings to see what is set where.',
    {
        CurrentAppID: 'An empty value which will then be replaced with the currently running title app ID for app specific settings.',
        SteamVR: 'Most system wide settings are set in this category.',
        Input: 'For if you are changing a controller setting.'
    }
)
OptionsMap.addPrototype(
    OptionSteamVRSettingType,
    'The setting type, reference steamvr.vrsettings or default.vrsettings to see what can be set.',
    {
        // TODO: For later?
    }
)
