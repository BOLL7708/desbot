import WebSockets from './WebSockets.js'
import Config from './Config.js'
import Utils from './Utils.js'
import Color from './ColorConstants.js'
import {TKeys} from '../_data/!keys.js'
import DataBaseHelper from './DataBaseHelper.js'
import {ConfigRelay} from '../Objects/Config/ConfigRelay.js'
import {ConfigController} from '../Objects/Config/ConfigController.js'

export default class Relay {
    private readonly _logColor = Color.ForestGreen
    private _socket: WebSockets|undefined = undefined
    private _authorized: boolean = false
    private readonly _prefix = ':::'
    private readonly _channel: string
    private readonly _password: string
    private _onMessageCallback: IOnRelayMessageCallback = (result)=>{ console.warn(`Unhandled Relay (${this._channel}) message: ${JSON.stringify(result)}`) }
    constructor(channel?: string, password?: string, onMessageCallback?: IOnRelayMessageCallback) {
        this._channel = channel ?? ''
        this._password = password ?? ''
        if(onMessageCallback) this._onMessageCallback = onMessageCallback
    }
    async init() {
        const configRelay = await DataBaseHelper.loadMain(new ConfigRelay())
        this._socket = new WebSockets(`ws://localhost:${configRelay.port}`, 10, true)
        this._socket._onOpen = this.onOpen.bind(this)
        this._socket._onClose = this.onClose.bind(this)
        this._socket._onMessage = this.onMessage.bind(this)
        this._socket._onError = this.onError.bind(this)
        const controllerConfig = await DataBaseHelper.loadMain(new ConfigController())
        if(controllerConfig.useWebsockets.relay) this._socket.init()
        else Utils.log('Relay: Will not init websockets as it is disabled in the config.', this._logColor)
    }
    setOnMessageCallback(callback: IOnRelayMessageCallback) {
        this._onMessageCallback = callback
        this.init().then()
    }

    send(message: string) {
        this._socket?.send(message)
    }

    sendJSON(data: any) {
        this.send(JSON.stringify(data))
    }

    private onOpen(evt: Event) {
        if(this._channel.length > 0) {
            Utils.log(`Relay: Connected, joining #${this._channel}...`, this._logColor)
            this._socket?.send(`${this._prefix}CHANNEL:${this._channel}`)
        }
        else Utils.log(`Relay: Entered general channel, ready for use!`, this._logColor, true)
    }
    private onMessage(evt: MessageEvent) {
        let message = evt.data as string
        if(message.startsWith(this._prefix)) {
            // Check if command
            message = message.substring(3) // Remove prefix
            const messageArr = message.split(':')
            if(messageArr.length == 3 && messageArr[1].length > 0) {
                switch(messageArr[0]) {
                    case 'SUCCESS':
                        const code = parseInt(messageArr[1])
                        if(code >= 10 && code < 20) { // Connected to channel
                            if(this._password.length > 0) {
                                Utils.log(`Relay: Entered #${this._channel}, doing authorization...`, this._logColor)
                                this._socket?.send(`${this._prefix}PASSWORD:${this._password}`)
                            } else {
                                Utils.log(`Relay: Entered #${this._channel}, ready for use!`, this._logColor, true)
                            }
                        } else if(code >= 20 && code < 30) { // Authorized
                            this._authorized = true
                            Utils.log(`Relay: Authorized for #${this._channel}, ready for use!`, this._logColor, true)
                        }
                        break
                    case 'ERROR':
                        console.warn("Relay: Error", messageArr)
                        this._authorized = false
                        this._socket?.disconnect() // Just start the flow over, hope for the best!
                        break
                    default: console.error(messageArr)
                }
            } else {
                Utils.log(`Relay: Received unhandled command response: ${message}`, Color.Red)
            }
            return
        }

        let json: any = undefined
        try {
            json = JSON.parse(message)
        } catch (e) {
            console.warn(`Relay: Got garbage: ${message}`)
        }
        if(json != undefined) {
            this._onMessageCallback(json)
        }
    }
    private onError(evt: Event) {
        // console.table(evt)
    }

    private onClose(event: Event) {
        this._authorized = false
    }
}

export interface IOnRelayMessageCallback {
    (result: any): void
}

export interface IRelayTempMessage {
    key: TKeys,
    data: string
}