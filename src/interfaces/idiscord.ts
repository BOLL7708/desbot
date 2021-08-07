class IDiscordConfig {
    remoteScreenshotEmbedColor: string
    manualScreenshotEmbedColor: string
    webhooks: IDiscordWebhookConfigs
    prefixCheer: string
    prefixReward: string
}
class IDiscordWebhookConfigs {
    [key:string]: IDiscordWebhookConfig
}
class IDiscordWebhookConfig {
    id: string
    token: string
}