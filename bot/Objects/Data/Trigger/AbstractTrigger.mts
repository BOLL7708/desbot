import AbstractData from '../AbstractData.mts'

export default abstract class AbstractTrigger extends AbstractData {
    /**
     * @param eventKey The key for the event we are registering for.
     */
    abstract register(eventKey: string): void
}