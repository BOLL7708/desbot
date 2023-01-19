import Relay from './Relay.js'
import Config from '../Classes/Config.js'
import DataBaseHelper from './DataBaseHelper.js'
import {ConfigRelay} from './ConfigObjects.js'

export default class StreamDeckRelay {
    private _relay: Relay|undefined
    constructor() {}
    public async init() {
        if(!this._relay) {
            const config = await DataBaseHelper.loadMain(new ConfigRelay())
            this._relay = new Relay(
                config.streamDeckChannel,
                Config.credentials.StreamDeckRelayPassword,
                (rawMessage)=>{
                    const message = rawMessage as IStreamDeckMessage
                    console.log(message)
                    this.handleMessage(message).then()
                })
            this._relay.init().then()
        }
    }
}