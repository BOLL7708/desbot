// Callbacks
interface IWebsocketsOpenCallback {
    (evt: Event): void
}
interface IWebsocketsCloseCallback {
    (evt: CloseEvent): void
}
interface IWebsocketsMessageCallback {
    (evt: MessageEvent): void
}
interface IWebsocketsErrorCallback {
    (evt: Event): void
}