import {Option} from './Option.js'
import {OptionsMap} from './OptionsMap.js'

export class OptionScreenshotFileType extends Option {
    static readonly PNG = 'png'
    static readonly JPG = 'jpg'
}
OptionsMap.addPrototype(
    OptionScreenshotFileType,
    'File type for OBS screenshots.',
    {
        PNG: 'Portable Network Graphics',
        JPG: 'JPEG'
    }
)