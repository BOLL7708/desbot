class WebSockets {
    constructor(
        serverUrl:string, 
        reconnectIntervalSeconds:number = 30,
        messageQueueing:boolean = true,
        onOpen:Function = () => {},
        onClose:Function = () => {},
        onMessage:Function = () => {},
        onError:Function = () => {}
    ) {
        this._serverUrl = serverUrl
        this._reconnectIntervalSeconds = reconnectIntervalSeconds
        this._messageQueueing = messageQueueing
        this._onOpen = onOpen
        this._onClose = onClose
        this._onMessage = onMessage
        this._onError = onError
    }

    private _socket: WebSocket
    private _reconnectIntervalSeconds: number
    private _reconnectIntervalHandle: number
    private _connected: boolean = false
    private _serverUrl: string
    private _messageQueue: string[] = []
    private _messageQueueing: boolean
    public _onOpen: Function
    public _onClose: Function
    public _onMessage: Function
    public _onError: Function
    
    init() {
        this.startConnectLoop(true)
    }
    send(message:string) {
        if(this._connected) {
            this._socket.send(message)
        } else if(this._messageQueueing) {
            this._messageQueue.push(message)
            console.log(`${this._serverUrl}: Not connected, adding to queue...`)
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
        this._reconnectIntervalHandle = setInterval(this.connect.bind(this), this._reconnectIntervalSeconds*1000)
        if(immediate) this.connect()
    }
    private stopConnectLoop() {
        clearInterval(this._reconnectIntervalHandle)
    }

    private connect() {
        console.log(this)
        this._socket = null
        this._socket = new WebSocket(this._serverUrl)
	    this._socket.onopen = onOpen.bind(this)
	    this._socket.onclose = onClose.bind(this)
	    this._socket.onmessage = onMessage.bind(this)
	    this._socket.onerror = onError.bind(this)

        function onOpen(evt) {
            console.log(`${this._serverUrl}: Connected`)
            this._connected = true
            this.stopConnectLoop()
            this._onOpen(evt)
            this._messageQueue.forEach(message => {
                this._socket.send(message)
            });
            this._messageQueue = []
        }
        function onClose(evt) {
            console.warn(`${this._serverUrl}: Disconnected`)
            this._connected = false
            this.startConnectLoop()
            this._onClose(evt)
        }
        function onMessage(evt) {
            this._onMessage(evt)
        }
        function onError(evt) {
            console.error(`${this._serverUrl}:${JSON.stringify(evt)}`)
            this._socket.close()
            this.startConnectLoop()
            this._onError(evt)
        }
    }
}