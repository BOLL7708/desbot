import Relay from './Relay.js'

export default class StreamDeckRelay {
    private _relay: Relay|undefined
    constructor() {}
    public async init() {
        if(!this._relay) {
            // const config = await DataBaseHelper.loadMain(new ConfigRelay())
            // this._relay = new Relay(
            //     config.streamDeckChannel,
            //     Config.credentials.StreamDeckRelayPassword,
            //     (rawMessage)=>{
            //     })
            // this._relay.init().then()
        }
    }
}