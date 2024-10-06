import AbstractOption from './AbstractOption.mts'
import OptionsMap from './OptionsMap.mts'

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