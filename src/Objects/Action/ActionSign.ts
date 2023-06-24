import BaseDataObject from '../BaseDataObject.js'
import DataObjectMap from '../DataObjectMap.js'

export class ActionSign extends BaseDataObject{
    title: string = ''
    imageSrc: string = ''
    subtitle: string = ''
    durationMs: number = 5000

    register() {
        DataObjectMap.addRootInstance(
            new ActionSign(),
            'Show a pop-in message in the browser source for the widget.',
            {
                title: 'The title above the image, takes tags.',
                imageSrc: 'The image to display in the Sign pop-in, as web URL, local URL or data URL.\n\nIf left empty the avatar image will be used instead, if available.',
                subtitle: 'The subtitle beneath the image, takes tags.',
                durationMs: 'The duration for the Sign to be visible for, in milliseconds.'
            },
            {
                imageSrc: 'string|file'
            }
        )
    }
}