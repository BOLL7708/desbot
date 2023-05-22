// Callbacks
export interface IAudioPlayedCallback {
    (nonce: string, status: number): void
}