import {BaseEnum} from '../Objects/BaseEnum.js'
import {EnumObjectMap} from '../Objects/EnumObjectMap.js'

export class EnumScreenshotFileType extends BaseEnum {
    static readonly PNG = 'png'
    static readonly JPG = 'jpg'
}
EnumObjectMap.addPrototype(
    EnumScreenshotFileType,
    'File type for OBS screenshots.',
    {
        PNG: 'Portable Network Graphics',
        JPG: 'JPEG'
    }
)