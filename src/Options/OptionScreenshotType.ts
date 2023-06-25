import {Option} from './Option.js'
import {OptionsMap} from './OptionsMap.js'

export class OptionScreenshotType extends Option {
    static readonly SuperScreenShotterVR = 100
    static readonly OBSSource = 200
}
OptionsMap.addPrototype(
    OptionScreenshotType,
    'The type of screenshot to capture.',
    {
        SuperScreenShotterVR: 'Will trigger a screenshot by SuperScreenShotterVR of the currently running VR game.',
        OBSSource: 'Will trigger a screenshot in OBS of a specific source.'
    }
)