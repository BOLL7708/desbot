import {Option} from './Option.js'
import {OptionsMap} from './OptionsMap.js'

export class OptionScreenshotFileType extends Option {
    static readonly PNG = 'png'
    static readonly JPG = 'jpg'
}
OptionsMap.addPrototype({
    prototype: OptionScreenshotFileType,
    description: 'File type for OBS screenshots.',
    documentation: {
        PNG: 'Portable Network Graphics',
        JPG: 'JPEG'
    }
})