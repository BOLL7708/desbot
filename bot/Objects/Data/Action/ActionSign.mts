import AbstractAction, {IActionCallback} from './AbstractAction.mts'
import DataMap from '../DataMap.mts'
import DataUtils from '../DataUtils.mts'

export default class ActionSign extends AbstractAction {
    title: string = ''
    imageSrc: string = ''
    subtitle: string = ''
    durationMs: number = 5000

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionSign(),
            tag: '📄',
            description: 'Show a pop-in message in the browser source for the widget.',
            documentation: {
                title: 'The title above the image, takes tags.',
                imageSrc: 'The image to display in the Sign pop-in, as web URL, local URL or data URL.\n\nIf left empty the avatar image will be used instead, if available.',
                subtitle: 'The subtitle beneath the image, takes tags.',
                durationMs: 'The duration for the Sign to be visible for, in milliseconds.'
            },
            types: {
                imageSrc: DataUtils.getStringFileImageRef()
            }
        })
    }

    async build(key: string): Promise<IActionCallback> {
        const runner = await import('../../../../Server/Runners/Action/ActionSignRunner.mts')
        const instance = new runner.default()
        return instance.getCallback<ActionSign>(key, this)
    }
}