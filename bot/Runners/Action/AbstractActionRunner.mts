import AbstractAction, {IActionCallback} from '../../../Shared/Objects/Data/Action/AbstractAction.mts'

export default abstract class AbstractActionRunner {
    abstract getCallback<T>(key: string, instance: T&AbstractAction): IActionCallback
}