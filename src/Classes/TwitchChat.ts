import WebSockets from './WebSockets.js'
import Utils from '../ClassesStatic/Utils.js'
import Config from '../ClassesStatic/Config.js'
import TwitchFactory from './TwitchFactory.js'
import {ITwitchChatMessageCallback} from '../Interfaces/itwitch.js'
import DB from '../ClassesStatic/DB.js'
import {SettingTwitchTokens} from './_Settings.js'
import TwitchHelix from '../ClassesStatic/TwitchHelix.js'

export default class TwitchChat {
    private LOG_COLOR: string = 'purple'
    private _socket?: WebSockets
    private _isConnected: boolean = false
    private _userName: string = ''
    private _channel: string = ''
    init(userName?: string, channel?: string) {
        if(!userName || !channel) return console.error(`Twitch Chat: Cannot initiate without proper username (${userName}) and channel (${channel}).`)
        this._userName = userName
        this._channel = channel
        this._socket = new WebSockets(
            'wss://irc-ws.chat.twitch.tv:443',
            15,
            false,
            this.onOpen.bind(this),
            this.onClose.bind(this),
            this.onMessage.bind(this),
            this.onError.bind(this)
        )
        this._socket.init();
    }

    private _chatMessageCallback: ITwitchChatMessageCallback = (message) => { /* console.warn('Unhandled chat message callback') */ }
    registerChatMessageCallback(callback: ITwitchChatMessageCallback) {
        this._chatMessageCallback = callback
    }

    isConnected(): boolean {
        return this._isConnected
    }

    private async onOpen(evt: any) {
        const userData = await TwitchHelix.getUserByLogin(this._userName)
        const tokens = await DB.loadSettingsArray(new SettingTwitchTokens())
        const tokenData = tokens?.find((t)=>{ return t.userId === parseInt(userData?.id ?? '') })
        Utils.log(`Twitch chat connected: ${this._userName} to #${this._channel}`, this.LOG_COLOR, true, true)
        this._socket?.send(`PASS oauth:${tokenData?.accessToken}`)
        this._socket?.send(`NICK ${this._userName}`)
        this._socket?.send('CAP REQ :twitch.tv/membership twitch.tv/tags twitch.tv/commands') // Enables more info
        this._socket?.send(`JOIN #${this._channel}`)
        this._isConnected = true
    }
    private onClose(evt: any) {
        this._isConnected = false
        Utils.log(`Twitch chat disconnected: ${this._userName}`, this.LOG_COLOR, true, true)
    }
    private onMessage(evt: any) {
        let data:string|undefined = evt?.data
        if(data != undefined) {
            // Utils.log(data, this.LOG_COLOR)
            if(data.indexOf('PING') == 0) return this._socket?.send('PONG :tmi.twitch.tv\r\n')
            let messageStrings = data.split("\r\n")
            messageStrings.forEach(str => {
                if(str == null || str.length == 0) return
                let message = TwitchFactory.buildMessageCmd(str)
                this._chatMessageCallback(message)
            })
        }        
    }
    private onError(evt: any) {
        console.error(evt)
    }
    private testMessage(message: string) {
        this._chatMessageCallback(TwitchFactory.buildMessageCmd(message));
    }
    sendMessageToChannel(message: string) {
        this._socket?.send(`PRIVMSG #${this._channel} :${message}`)
    }

    sendMessageToUser(username: string, message: string) {
        this._socket?.send(`PRIVMSG #${this._channel} :/w ${username} ${message}`)
    }
}