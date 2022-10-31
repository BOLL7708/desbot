import Relay from './Relay.js'
import Config from '../ClassesStatic/Config.js'

export default class StreamDeckRelay {
    private _relay: Relay|undefined
    constructor() {}
    public init() {
        if(!this._relay) {
            this._relay = new Relay(
                Config.relay.streamDeckChannel,
                Config.credentials.StreamDeckRelayPassword,
                (message)=>{
                    console.log(message)
                })
            this._relay.init()
        }
    }
}