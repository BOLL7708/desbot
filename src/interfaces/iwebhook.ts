interface IWebhookActionConfig {
    path?: string,
    delay?: number
}

interface IWebhookConfig extends IWebhookActionConfig{
    callback?: ITwitchActionCallback
}