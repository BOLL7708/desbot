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
                let message = TwitchFactory.buildMessageCmd(str)
                this._chatMessageCallback(message)
            });
        }        
    }
    private onError(evt: any) {
        console.error(evt)
    }
    private testMessage(message: string) {
        this._chatMessageCallback(TwitchFactory.buildMessageCmd(message));
    }

}