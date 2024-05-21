import AbstractOption from './AbstractOption.js'
import OptionsMap from './OptionsMap.js'

export default class OptionMoveVRSpaceCorrection extends AbstractOption {
    static playSpace = 'PlaySpace'
    static hmd = 'Hmd'
    static hmdYaw = 'HmdYaw'
    static hmdPitch = 'HmdPitch'
}
OptionsMap.addPrototype({
    prototype: OptionMoveVRSpaceCorrection
})