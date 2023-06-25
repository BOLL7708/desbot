import Data from '../Data.js'
import DataMap from '../DataMap.js'
import {PresetOBSSource} from '../Preset/PresetOBS.js'
import {OptionScreenshotType} from '../../Options/OptionScreenshotType.js'

export class ActionScreenshot extends Data {
    screenshot_use = OptionScreenshotType.SuperScreenShotterVR
    sourcePreset: number|PresetOBSSource = 0
    delay: number = 0

    enlist() {
        DataMap.addRootInstance(
            new ActionScreenshot(),
            'Trigger OBS or VR screenshots.',
            {
                screenshot_use: 'The type of screenshot, OBS screenshots need the source preset to be set.',
                sourcePreset: 'Set this if you are capturing an OBS screenshot.',
                delay: 'A delay in seconds before triggering the screenshot.'
            },
            {
                screenshot_use: OptionScreenshotType.ref(),
                sourcePreset: PresetOBSSource.refId()
            }
        )
    }
}