class IDiscordConfig {
    remoteScreenshotEmbedColor: string
    manualScreenshotEmbedColor: string
    webhooks: IDiscordWebhookConfigs
}
class IDiscordWebhookConfigs {
    [key:string]: IDiscordWebhookConfig
}
class IDiscordWebhookConfig {
    id: string
    token: string
}