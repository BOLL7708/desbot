class TwitchChat {
    private LOG_COLOR: string = 'purple'
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
        let config: ITwitchConfig = Config.twitch
        Utils.log("Twitch chat connected", this.LOG_COLOR, true, true)
        this._socket.send(`PASS oauth:${tokenData.access_token}`)
        this._socket.send(`NICK ${config.botName}`)
        this._socket.send('CAP REQ :twitch.tv/membership twitch.tv/tags twitch.tv/commands') // Enables more info
        this._socket.send(`JOIN #${config.channelName}`)
        this._isConnected = true
    }
    private onClose(evt: any) {
        this._isConnected = false
        Utils.log("Twitch chat disconnected", this.LOG_COLOR, true, true)
    }
    private onMessage(evt: any) {
        let data = evt?.data
        if(data != null) {
            Utils.log(data, this.LOG_COLOR)
            if(data.indexOf('PING') == 0) return this._socket.send('PONG :tmi.twitch.tv\r\n')
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
        this._socket.send(`PRIVMSG #${Config.twitch.channelName} :${message}`)
    }

    sendMessageToUser(username: string, message: string) {
        this._socket.send(`PRIVMSG #${Config.twitch.channelName} :/w ${username} ${message}`)
    }
}