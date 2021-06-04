class IDiscordConfig {
    remoteScreenshotEmbedColor: string
    manualScreenshotEmbedColor: string
    webhooks: IDiscordWebhookConfig[]
}
class IDiscordWebhookConfig {
    key: string
    id: string
    token: string
}