class TwitchChat {
    private _socket: WebSockets
    private _isConnected: boolean = false
    init() {
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

    private _chatMessageCallback: ITwitchChatMessageCallback = (message) => { console.warn('Unhandled chat message callback') }
    registerChatMessageCallback(callback: ITwitchChatMessageCallback) {
        this._chatMessageCallback = callback
    }

    isConnected(): boolean {
        return this._isConnected
    }

    private async onOpen(evt: any) {
        let tokenData: ITwitchTokens = await Settings.pullSetting(Settings.TWITCH_TOKENS, 'type', 'tokens')
        let config: ITwitchConfig = Config.instance.twitch
        console.log("Twitch chat connected")
        this._socket.send(`PASS oauth:${tokenData.access_token}`)
        this._socket.send(`NICK ${config.botName}`)
        this._socket.send('CAP REQ :twitch.tv/membership twitch.tv/tags twitch.tv/commands') // Enables more info
        this._socket.send(`JOIN #${config.channelName}`)
        this._isConnected = true
    }
    private onClose(evt: any) {
        this._isConnected = false
        console.log("Twitch chat disconnected")
    }
    private onMessage(evt: any) {
        let data = evt?.data
        if(data != null) {
            console.log(data)
            if(data.indexOf('PING') == 0) return this._socket.send('PONG :tmi.twitch.tv\r\n')
            let messageStrings = data.split("\r\n")
            messageStrings.forEach(str => {
                if(str == null || str.length == 0) return
                let message: TwitchMessageCmd = new TwitchMessageCmd(str)
                this._chatMessageCallback(message)
            });
        }        
    }
    private onError(evt: any) {
        console.log(evt)
    }
}
class TwitchMessageCmd {
    properties: ITwitchChatMessageProperties = {
        '@badge-info': '',
        badges: '',
        'client-nonce': '',
        color: '',
        // 'custom-reward-id': '', // Not included as it should be unset to not be a reward.
        'display-name': '',
        emotes: '',
        flags: '',
        id: '',
        mod: '',
        'room-id': '',
        subscriber: '',
        'tmi-sent-ts': '',
        turbo: '',
        'user-id': '',
        'user-type': ''
    }
    message: TwitchMessage
    constructor(data:string) {
        let [props, msg] = Utils.splitOnFirst(' :', data)
        this.message = new TwitchMessage(msg)
        let rows: string[] = props.split(';')
        for(let i=0; i<rows.length; i++) {
            let row = rows[i]
            let [rowName, rowValue] = Utils.splitOnFirst('=', row)
            if(rowName != null && rowName.length > 0) this.properties[rowName] = rowValue
        }
    }
}

class TwitchMessage {
    data: string
    username: string
    channel: string
    type: string
    text: string
    isAction: boolean
    constructor(data:string) {
        this.data = data;
        const re = /([\w]+)!?.*\.tmi\.twitch\.tv\s(.+)\s#([\w]+)\s:(.*)/g
        let matches:any = re.exec(data)
        if(matches != null) {
            const re2 = /^\u0001ACTION ([^\u0001]+)\u0001$/
            let matches2:any = re2.exec(matches[4])
            this.isAction = matches2 != null
            this.username = matches[1]
            this.type = matches[2]
            this.channel = matches[3]
            this.text = this.isAction ? matches2[1] : matches[4]
        }
    }
    isOk() {
        return this.username != null && this.type != null && this.text != null
    }
}
