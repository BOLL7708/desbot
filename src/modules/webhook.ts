class Webhook {
    private _pollHandle?: number;
    private LOG_COLOR_COMMAND: string = 'maroon'
    private _webhookTriggers: IWebhookConfig[] = []

    async init() {
        if (this._pollHandle) clearInterval(this._pollHandle)

        this._pollHandle = setInterval(this.pollQueue.bind(this), 500)
    }

    private async pollQueue() {
        fetch('wh-get')
            .then(response => response.json())
            .then(async json => {
                console.log(json)

                for (const webhookKey of json) {
                    for (const webhookTrigger of this._webhookTriggers) {
                        if (webhookTrigger.path == webhookKey) {
                            if (webhookTrigger.callback) {
                                if (webhookTrigger.delay) {
                                    setTimeout(webhookTrigger.callback.bind(this, await Actions.getEmptyUserDataForCommands()),
                                        webhookTrigger.delay * 1000)
                                } else {
                                    webhookTrigger.callback(await Actions.getEmptyUserDataForCommands())
                                }
                            }
                        }
                    }
                }
            })
    }

    registerWebhookTrigger(webhook: IWebhookConfig) {
        // Store the command
        this._webhookTriggers.push(webhook)

        // Log the command
        const message = `Registering webhook: <${webhook.path}>`
        Utils.logWithBold(message, this.LOG_COLOR_COMMAND)
    }
}