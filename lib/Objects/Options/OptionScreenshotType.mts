import {AbstractOption} from './AbstractOption.mts'
import {OptionsMap} from './OptionsMap.mts'

export class OptionScreenshotType extends AbstractOption {
    static readonly VRElseOBS = 0
    static readonly SuperScreenShotterVR = 100
    static readonly OBSSource = 200
}
OptionsMap.addPrototype({
    prototype: OptionScreenshotType,
    description: 'The type of screenshot to capture.',
    documentation: {
        SuperScreenShotterVR: 'Will trigger a screenshot with SuperScreenShotterVR of the currently running VR game.',
        OBSSource: 'Will trigger a screenshot in OBS of a specific source.',
        VRElseOBS: 'Will trigger a screenshot with SuperScreenShotterVR if VR is on, otherwise OBS will be used.'
    }
})