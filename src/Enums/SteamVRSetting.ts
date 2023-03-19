import {BaseEnum} from '../Objects/BaseEnum.js'
import {EnumObjectMap} from '../Objects/EnumObjectMap.js'
import {EnumScreenshotType} from './ScreenshotType.js'

export class EnumSteamVRSettingCategory extends BaseEnum {
    static readonly CurrentAppID = ''
    static readonly SteamVR = 'steamvr'
    static readonly Input = 'input'
}
export class EnumSteamVRSettingType extends BaseEnum {
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
EnumObjectMap.addPrototype(
    EnumSteamVRSettingCategory,
    'The setting category, reference steamvr.vrsettings or default.vrsettings to see what is set where.',
    {
        CurrentAppID: 'An empty value which will then be replaced with the currently running title app ID for app specific settings.',
        SteamVR: 'Most system wide settings are set in this category.',
        Input: 'For if you are changing a controller setting.'
    }
)
EnumObjectMap.addPrototype(
    EnumSteamVRSettingType,
    'The setting type, reference steamvr.vrsettings or default.vrsettings to see what can be set.',
    {
        // TODO: For later?
    }
)
