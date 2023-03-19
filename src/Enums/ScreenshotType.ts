import {BaseEnum} from '../Objects/BaseEnum.js'
import {EnumObjectMap} from '../Objects/EnumObjectMap.js'

export class EnumScreenshotType extends BaseEnum {
    static readonly SuperScreenShotterVR = 100
    static readonly OBSSource = 200
}
EnumObjectMap.addPrototype(
    EnumScreenshotType,
    'The type of screenshot to capture.',
    {
        SuperScreenShotterVR: 'Will trigger a screenshot by SuperScreenShotterVR of the currently running VR game.',
        OBSSource: 'Will trigger a screenshot in OBS of a specific source.'
    }
)