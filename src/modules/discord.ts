class Discord {
    // Send chat log and perhaps screenshots to Discord aye?
    sendMessage(url: string, displayName: string, iconUrl: string, message: string) {
        fetch(url, {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                username: displayName,
                avatar_url: iconUrl,
                content: message
            })
        }).catch(err => console.error(err))        
    }

    // TODO: This is not used anywhere
    sendMessageEmbed(url: string, displayName: string, iconUrl: string, color: string, description: string, message: string) {
        const payload: IDiscordWebookPayload = {
            username: displayName,
            avatar_url: iconUrl,
            content: description,
            embeds: [
                {
                    description: message,
                    color: Utils.hexToDecColor(color)
                }
            ]
        }
        fetch(url, {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        }).catch(err => console.error(err))
    }

    sendPayload(url: string, payload: IDiscordWebookPayload):Promise<void|Response> {
        return fetch(url, {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        }).catch(err => console.error(err))
    }

    // Generalize?
    sendPayloadEmbed(url: string, imageBlob: Blob, color: number, description: string = null, authorName: string = null, authorUrl: string = null, authorIconUrl: string = null, footerText: string = null) {
        const payload: IDiscordWebookPayload = {
            username: authorName,
            avatar_url: authorIconUrl,
            embeds: [
                {
                    image: {
                        url: 'attachment://image.png'
                    },
                    description: description,
                    color: color,
                    timestamp: Utils.getISOTimestamp(),
                    footer: footerText ? {
                        text: footerText
                    } : null
                }
            ]
        }
        
        let formData = new FormData()
        formData.append('file', imageBlob, 'image.png')
        formData.append('payload_json', JSON.stringify(payload))
        
        const options = {
            method: 'POST',
            body: formData
        }
        
        fetch(url, options).then(response => console.log(response))
    }
}