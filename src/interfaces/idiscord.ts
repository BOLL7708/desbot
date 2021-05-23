class IDiscordConfig {
    embedColor: number
    webhooks: IDiscordWebhookConfig[]
}
class IDiscordWebhookConfig {
    key: string
    channelId: string
    authKey: string
}