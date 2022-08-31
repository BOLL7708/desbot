// Callbacks
export interface IWebsocketsOpenCallback {
    (evt: Event): void
}
export interface IWebsocketsCloseCallback {
    (evt: CloseEvent): void
}
export interface IWebsocketsMessageCallback {
    (evt: MessageEvent): void
}
export interface IWebsocketsErrorCallback {
    (evt: Event): void
}