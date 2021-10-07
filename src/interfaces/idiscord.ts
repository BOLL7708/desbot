class IDiscordConfig {
    remoteScreenshotEmbedColor: string
    manualScreenshotEmbedColor: string
    webhooks: IDiscordWebhookConfig
    prefixCheer: string
    prefixReward: string
}
class IDiscordWebhookConfig {
    [key: string]: string
}