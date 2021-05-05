class TwitchChat {
    private _socket: WebSockets
    private _messageCallback:Function = (message:TwitchMessage) => console.log(`No message callback set, missed message: ${message.text}`)
    init(messageCallback:(message:TwitchMessage)=>void) {
        this._messageCallback = messageCallback
        this._socket = new WebSockets(
            "wss://irc-ws.chat.twitch.tv:443",
            15,
            false,
            this.onOpen.bind(this),
            this.onClose.bind(this),
            this.onMessage.bind(this),
            this.onError.bind(this)
        )
        this._socket.init();
    }

    private async onOpen(evt:any) {
        let tokenData:ITwitchTokens = await Settings.loadSettings(Settings.TWITCH_TOKENS)
        let config = Config.instance.twitch
        console.log("Twitch chat connected")
        this._socket.send(`PASS oauth:${tokenData.access_token}`)
        this._socket.send(`NICK ${config.botName}`)
        // this._socket.send('CAP REQ :twitch.tv/membership twitch.tv/tags twitch.tv/commands') // TODO: Support advanced messages later
        this._socket.send(`JOIN #${config.channelName}`)
    }
    private onClose(evt:any) {
        console.log("Twitch chat disconnected")
    }
    private onMessage(evt:any) {
        let data = evt?.data
        if(data != null) {
            console.log(data)
            if(data.indexOf('PING') == 0) return this._socket.send('PONG :tmi.twitch.tv\r\n')
            let message:TwitchMessage = new TwitchMessage(data)
            this._messageCallback(message)
        }        
    }
    private onError(evt:any) {
        console.log(evt)
    }
}
class TwitchMessage {
    public data:string
    public username:string
    public type:string
    public text:string
    constructor(data:string) {
        // TODO: Expand this to support full info messages and events...
        this.data = data;
        const re = /:([\w]+)![\w]+@[\w]+\.tmi\.twitch\.tv.([\w]+).#[\w]+.:(.*)/g
        let matches:any = re.exec(data)
        if(matches != null) {
            const re2 = /^\u0001ACTION ([^\u0001]+)\u0001$/
            let matches2:any = re2.exec(matches[3])
            if(matches2 != null) {
                this.text = `${matches[1]} ${matches2[1]}`
            } else {
                this.username = matches[1]
                this.text = matches[3]
            }
            this.type = matches[2]
        }
    }
    public isOk() {
        return this.username != null && this.type != null && this.text != null
    }
}
