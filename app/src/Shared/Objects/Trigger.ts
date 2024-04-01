import Data from './Data.js'

export default abstract class Trigger extends Data {
    /**
     * @param eventKey The key for the event we are registering for.
     */
    abstract register(eventKey: string): void
}