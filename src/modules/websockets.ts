class WebSockets {
    private LOG_COLOR: string = Color.Gray

    constructor(
        serverUrl:string, 
        reconnectIntervalSeconds:number = 30,
        messageQueueing:boolean = true,
        onOpen:IWebsocketsOpenCallback = () => {},
        onClose:IWebsocketsCloseCallback = () => {},
        onMessage:IWebsocketsMessageCallback = () => {},
        onError:IWebsocketsErrorCallback = () => {}
    ) {
        this._serverUrl = serverUrl
        this._reconnectIntervalSeconds = reconnectIntervalSeconds
        this._reconnectIntervalSecondsTotal = reconnectIntervalSeconds
        this._messageQueueing = messageQueueing
        this._onOpen = onOpen
        this._onClose = onClose
        this._onMessage = onMessage
        this._onError = onError
    }

    private _socket: WebSocket
    private _reconnectIntervalSeconds: number
    private _reconnectIntervalSecondsTotal: number
    private _reconnectIntervalHandle: number
    private _connected: boolean = false
    private _serverUrl: string
    private _messageQueue: string[] = []
    private _messageQueueing: boolean
    _onOpen: IWebsocketsOpenCallback
    _onClose: IWebsocketsCloseCallback
    _onMessage: IWebsocketsMessageCallback
    _onError: IWebsocketsErrorCallback
    
    init() {
        this.startConnectLoop(true)
    }
    send(message:string) {
        if(this._connected) {
            this._socket.send(message)
        } else if(this._messageQueueing) {
            this._messageQueue.push(message)
            Utils.log(`WS: ${this._serverUrl}: Not connected, adding to queue...`, this.LOG_COLOR)
        }
    }
    reconnect() {
        this._socket.close()
        this.connect()
    }
    disconnect() {
        this._socket.close()
    }

    private startConnectLoop(immediate:boolean = false) {
        this.stopConnectLoop()
        this._reconnectIntervalHandle = setInterval(this.connect.bind(this), this._reconnectIntervalSecondsTotal*1000)
        this._reconnectIntervalSecondsTotal *= 2
        if(immediate) this.connect()
    }
    private stopConnectLoop() {
        clearInterval(this._reconnectIntervalHandle)
    }

    private connect() {
        this._socket?.close()
        this._socket = null
        this._socket = new WebSocket(this._serverUrl)
	    this._socket.onopen = onOpen.bind(this)
	    this._socket.onclose = onClose.bind(this)
	    this._socket.onmessage = onMessage.bind(this)
	    this._socket.onerror = onError.bind(this)
        const that = this;

        function onOpen(evt: Event) {
            Utils.log(`WS: ${this._serverUrl}: Connected`, that.LOG_COLOR, true)
            this._reconnectIntervalSecondsTotal = this._reconnectIntervalSeconds
            this._connected = true
            this.stopConnectLoop()
            this._onOpen(evt)
            this._messageQueue.forEach(message => {
                this._socket.send(message)
            });
            this._messageQueue = []
        }
        function onClose(evt: CloseEvent) {
            Utils.log(`WS: ${this._serverUrl}: Disconnected`, that.LOG_COLOR, true)
            this._connected = false
            this.startConnectLoop()
            this._onClose(evt)
        }
        function onMessage(evt: MessageEvent) {
            this._onMessage(evt)
        }
        function onError(evt: Event) {
            console.error(`WS: ${this._serverUrl}:${JSON.stringify(evt)}`)
            this._socket.close()
            this.startConnectLoop()
            this._onError(evt)
        }
    }
}