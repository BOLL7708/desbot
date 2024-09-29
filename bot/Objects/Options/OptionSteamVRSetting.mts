import AbstractOption from './AbstractOption.mts'
import OptionsMap from './OptionsMap.mts'

export class OptionSteamVRSettingType extends AbstractOption {
    static readonly None = ''
    static readonly WorldScale = '|worldScale|1'
    static readonly MirrorViewEye = 'steamvr|mirrorViewEye|4'
    static readonly KnucklesLeftThumbstickRotation = 'input|leftThumbstickRotation_knuckles|0'
    static readonly KnucklesRightThumbstickRotation = 'input|rightThumbstickRotation_knuckles|0'
    static readonly HMDAnalogGain = 'steamvr|analogGain|1.30'
    static readonly HMDRefreshRate = 'steamvr|preferredRefreshRate|120'
    static readonly HMDDisplayGainRed = 'steamvr|hmdDisplayColorGainR|1.0'
    static readonly HMDDisplayGainGreen = 'steamvr|hmdDisplayColorGainG|1.0'
    static readonly HMDDisplayGainBlue = 'steamvr|hmdDisplayColorGainB|1.0'
}

OptionsMap.addPrototype({
    prototype: OptionSteamVRSettingType,
    description: 'The setting type, reference steamvr.vrsettings or default.vrsettings to see what can be set.',
    documentation: {
        None: 'No setting preset chosen.',
        WorldScale: 'The world scale of the currently running game.',
        MirrorViewEye: 'The eye to use for the VR View, this currently does not actually work, sorry!',
        KnucklesLeftThumbstickRotation: 'The rotation of the thumbstick of the left Valve Index controller.',
        KnucklesRightThumbstickRotation: 'The rotation of the thumbstick of the right Valve Index controller.',
        HMDAnalogGain: 'The hardware brightness of the display panel in the headset.',
        HMDRefreshRate: 'The refresh rate of the display panel in the headset.',
        HMDDisplayGainRed: 'The red gain of the image in the headset.',
        HMDDisplayGainGreen: 'The green gain of the image in the headset.',
        HMDDisplayGainBlue: 'The blue gain of the image in the headset.'
    }
})
