class IDiscordConfig {
    embedColor: number
    webhooks: IDiscordWebhookConfig[]
}
class IDiscordWebhookConfig {
    key: string
    id: string
    token: string
}