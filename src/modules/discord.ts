class Discord {
    _baseUrl: string = 'https://discord.com/api/webhooks'
    // Send chat log and perhaps screenshots to Discord aye?
    sendText(config: IDiscordWebhookConfig, content: string) {
        let url = `${this._baseUrl}/${config.channelId}/${config.authKey}`
        fetch(url, {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({content: content})
        }).catch(err => console.error(err))        
    }

    sendPayload(config: IDiscordWebhookConfig, content: string, imageBlob: Blob) {
        let url = `${this._baseUrl}/${config.channelId}/${config.authKey}`

        let formData = new FormData()
        formData.append('file', imageBlob, 'image.png')
        formData.append('content', content)

        const options = {
            method: 'POST',
            body: formData
        }

        fetch(url, options)
            .then(response => response.json())
            .then(response => console.log(response))
    }

    sendPayloadEmbed(config: IDiscordWebhookConfig, imageBlob: Blob, title: string = null, description: string = null, authorName: string = null, authorUrl: string = null, authorIconUrl: string = null) {
        let url = `${this._baseUrl}/${config.channelId}/${config.authKey}`
        let imageEmbed = {
            embeds: [
                {
                    image: {
                        url: 'attachment://image.png'
                    },
                    title: title,
                    description: description,
                    color: Config.instance.discord.embedColor,
                    author: {
                        name: authorName,
                        url: authorUrl,
                        icon_url: authorIconUrl
                    },
                    timestamp: new Date().toISOString()
                }
            ]
        }
        
        let formData = new FormData()
        formData.append('file', imageBlob, 'image.png')
        formData.append('payload_json', JSON.stringify(imageEmbed))
        
        const options = {
            method: 'POST',
            body: formData
        }
        
        fetch(url, options)
            .then(response => response.json())
            .then(response => console.log(response))
    }
}