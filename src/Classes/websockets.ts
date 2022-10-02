import Utils from '../widget/utils.js'
import Color from '../ClassesStatic/colors.js'
import {
    IWebsocketsCloseCallback,
    IWebsocketsErrorCallback,
    IWebsocketsMessageCallback, IWebsocketsOpenCallback
} from '../interfaces/iwebsockets.js'

export default class WebSockets {
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
        this._messageQueueing = messageQueueing
        this._onOpen = onOpen
        this._onClose = onClose
        this._onMessage = onMessage
        this._onError = onError
    }

    private _socket?: WebSocket
    private _reconnectIntervalSeconds: number = 10
    private _reconnectIntervalHandle: number = -1
    private _connected: boolean = false
    private _serverUrl: string = ''
    private _messageQueue: string[] = []
    private _messageQueueing: boolean
    _onOpen: IWebsocketsOpenCallback = () => {}
    _onClose: IWebsocketsCloseCallback = () => {}
    _onMessage: IWebsocketsMessageCallback = () => {}
    _onError: IWebsocketsErrorCallback = () => {}
    
    init() {
        this.startConnectLoop(true)
    }
    send(message:string) {
        if(this._connected) {
            this._socket?.send(message)
        } else if(this._messageQueueing) {
            this._messageQueue.push(message)
            Utils.log(`WS: ${this._serverUrl}: Not connected, adding to queue...`, this.LOG_COLOR)
        }
    }
    reconnect() {
        this._socket?.close()
        this.connect()
    }
    disconnect() {
        this._socket?.close()
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
        this._socket?.close()
        this._socket = undefined
        this._socket = new WebSocket(this._serverUrl)
	    this._socket.onopen = onOpen.bind(this)
	    this._socket.onclose = onClose.bind(this)
	    this._socket.onmessage = onMessage.bind(this)
	    this._socket.onerror = onError.bind(this)
        const self = this;

        function onOpen(evt: Event) {
            Utils.log(`WS: ${self._serverUrl}: Connected`, self.LOG_COLOR, true)
            self._connected = true
            self.stopConnectLoop()
            self._onOpen(evt)
            self._messageQueue.forEach(message => {
                self._socket?.send(message)
            });
            self._messageQueue = []
        }
        function onClose(evt: CloseEvent) {
            Utils.log(`WS: ${self._serverUrl}: Disconnected`, self.LOG_COLOR, true)
            self._connected = false
            self.startConnectLoop()
            self._onClose(evt)
        }
        function onMessage(evt: MessageEvent) {
            self._onMessage(evt)
        }
        function onError(evt: Event) {
            console.error(`WS: ${self._serverUrl}:${JSON.stringify(evt)}`)
            self._socket?.close()
            self.startConnectLoop()
            self._onError(evt)
        }
    }
}