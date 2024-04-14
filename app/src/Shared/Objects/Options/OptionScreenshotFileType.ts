import {AbstractOption} from './AbstractOption.js'
import {OptionsMap} from './OptionsMap.js'

export class OptionScreenshotFileType extends AbstractOption {
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