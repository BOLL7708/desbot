import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'
import {PresetOBSSource} from '../Preset/OBS.js'
import {EnumScreenshotType} from '../../Enums/ScreenshotType.js'

export class ActionScreenshot extends BaseDataObject {
    screenshotType = EnumScreenshotType.SuperScreenShotterVR
    sourcePreset: number|PresetOBSSource = 0
    delay: number = 0
}

DataObjectMap.addRootInstance(
    new ActionScreenshot(),
    'Trigger OBS or VR screenshots.',
    {
        screenshotType: 'The type of screenshot, OBS screenshots need the source preset to be set.',
        sourcePreset: 'Set this if you are capturing an OBS screenshot.',
        delay: 'A delay in seconds before triggering the screenshot.'
    },
    {
        screenshotType: EnumScreenshotType.ref(),
        sourcePreset: PresetOBSSource.refId()
    }
)