class Discord {
    private static _rateLimits: Record<string, IDiscordRateLimit> = {} // Bucket, limit?
    private static _rateLimitBuckets: Record<string, string> = {} // Url, Bucket
    private static _messageQueues: Record<string, FormData[]> = {} // URL, Payloads
    private static _messageIntervalHandle = setInterval(()=>{
        for(const [key, value] of Object.entries(Discord._messageQueues)) {
            if(value.length > 0) {
                const bucketName = Discord._rateLimitBuckets[key] ?? null
                const rateLimit = Discord._rateLimits[bucketName] ?? null
                const now = Date.now()
                if(rateLimit == null || (rateLimit.remaining > 1 || now > rateLimit.resetTimestamp)) {
                    const formData = value.shift()
                    Discord.send(key, formData)
                } else {
                    Utils.log(`Discord: Waiting for rate limit (${rateLimit.remaining}) to reset (${rateLimit.resetTimestamp-now}ms)`, Color.Gray)
                }
            } else {
                // Remove queue if empty
                if(Discord._messageQueues.hasOwnProperty(key)) delete Discord._messageQueues[key]
            }
        }
    }, 500)
    
    /**
     * Enqueue a message to be sent to Discord.
     * @param url 
     * @param formData 
     */
    private static enqueueMessage(url: string, formData: FormData) {
        // Check if queue exists, if not, initiate it with the incoming data.
        if (!this._messageQueues.hasOwnProperty(url)) this._messageQueues[url] = [formData]
        else this._messageQueues[url].push(formData)
    }

    /**
     * Main send function that transmits messages to Discord over webhoooks.
     * @param url 
     * @param formData 
     */
    private static send(url: string, formData: FormData) {
        const options = {
            method: 'post',
            body: formData
        }
        fetch(url, options)
            .then(response => {
                const headers: IDiscordResponseHeaders = {}
                response.headers.forEach((value, key) => {
                    headers[key] = value
                })
                const bucket = headers["x-ratelimit-bucket"]
                if(bucket) {
                    if(!this._rateLimitBuckets.hasOwnProperty(url)) this._rateLimitBuckets[url] = bucket
                    const remaining = parseInt(headers["x-ratelimit-remaining"])
                    const reset = parseInt(headers["x-ratelimit-reset"])
                    if(!isNaN(remaining) && !isNaN(reset)) {
                        const resetTimestamp = reset * 1000
                        this._rateLimits[bucket] = {remaining: remaining, resetTimestamp: resetTimestamp}
                    }
                }
            }
        )
    }

    /**
     * Transform the payload into what we enqueue, FormData, as that can also contain embedded media.
     * @param payload 
     * @returns 
     */
    private static getFormDataFromPayload(payload: IDiscordWebookPayload): FormData {
        const formData = new FormData()
        formData.append('payload_json', JSON.stringify(payload))
        return formData
    }

    /*
    .#####...##..##..#####...##......######...####..
    .##..##..##..##..##..##..##........##....##..##.
    .#####...##..##..#####...##........##....##.....
    .##......##..##..##..##..##........##....##..##.
    .##.......####...#####...######..######...####..
    */

    /**
     * Used for Twitch Chat log and Twitch Reward redemptions
     * @param url 
     * @param displayName 
     * @param iconUrl 
     * @param message 
     */
    static sendMessage(url: string, displayName: string, iconUrl: string, message: string) {
        this.enqueueMessage(url, this.getFormDataFromPayload({
            username: displayName,
            avatar_url: iconUrl,
            content: message
        }))
    }

    /**
     * Used for Channel Trophy stats, Twitch clips and Steam achievements
     * @param url 
     * @param payload 
     * @returns 
     */
    static sendPayload(url: string, payload: IDiscordWebookPayload) {
        this.enqueueMessage(url, this.getFormDataFromPayload(payload))
    }

    /**
     * Used for screenshots
     * @param url 
     * @param imageBlob 
     * @param color 
     * @param description 
     * @param authorName 
     * @param authorUrl 
     * @param authorIconUrl 
     * @param footerText 
     */
    static sendPayloadEmbed(url: string, imageBlob: Blob, color: number, description: string = null, authorName: string = null, authorUrl: string = null, authorIconUrl: string = null, footerText: string = null) {
        const formData = this.getFormDataFromPayload({
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
        })
        formData.append('file', imageBlob, 'image.png')
        this.enqueueMessage(url, formData)
    }
}