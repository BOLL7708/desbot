import {AbstractOption} from './AbstractOption.mts'
import {OptionsMap} from './OptionsMap.mts'

export class OptionMoveVRSpaceCorrection extends AbstractOption {
    static playSpace = 'PlaySpace'
    static hmd = 'Hmd'
    static hmdYaw = 'HmdYaw'
    static hmdPitch = 'HmdPitch'
}
OptionsMap.addPrototype({
    prototype: OptionMoveVRSpaceCorrection,
    description: 'The correction applied to the origin.',
    documentation: {
        playSpace: 'The play space, allows X, Y and Z to be aligned to the place space.',
        hmd: 'The HMD, will angle the offsets to your absolute headset orientation.',
        hmdYaw: 'The HMD yaw, useful to angle offsets along the horizontal direction you are looking.',
        hmdPitch: 'The HMD pitch, will angle the offsets vertically with your headset.'
    }
})