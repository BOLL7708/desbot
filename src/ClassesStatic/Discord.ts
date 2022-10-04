import Utils from './Utils.js'
import {
    IDiscordQueue,
    IDiscordRateLimit,
    IDiscordResponseHeaders,
    IDiscordWebookPayload
} from '../Interfaces/idiscord.js'
import Color from './colors.js'

export default class Discord {
    private static _rateLimits: Record<string, IDiscordRateLimit> = {} // Bucket, limit?
    private static _rateLimitBuckets: Record<string, string> = {} // Url, Bucket
    private static _messageQueues: Record<string, IDiscordQueue[]> = {} // URL, Payloads
    private static _messageIntervalHandle = setInterval(async ()=>{
        for(const [key, value] of Object.entries(Discord._messageQueues)) {
            if(value.length > 0) {
                const bucketName = Discord._rateLimitBuckets[key] ?? null
                const rateLimit = Discord._rateLimits[bucketName] ?? null
                const now = Date.now()
                if(rateLimit == null || (rateLimit.remaining > 1 || now > rateLimit.resetTimestamp)) {
                    const item = value.shift()
                    const result = await Discord.send(key, item?.formData ?? new FormData())
                    if(item?.callback) item.callback(result)
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
    private static enqueue(
        url: string, 
        formData: FormData, 
        callback: (success: boolean)=>void = (success)=>{ console.log(`Discord: Enqueue callback not set, success: ${success}`) }) {
        // Check if queue exists, if not, initiate it with the incoming data.
        if (!this._messageQueues.hasOwnProperty(url)) this._messageQueues[url] = [{formData: formData, callback: callback}]
        else this._messageQueues[url].push({formData: formData, callback: callback})
    }

    /**
     * Main send function that transmits messages to Discord over webhoooks.
     * @param url
     * @param formData
     */
    private static async send(url: string, formData: FormData) {
        const options = {
            method: 'post',
            body: formData
        }
        const response: Response = await fetch(url, options)
        if(response == null) return new Promise<boolean>(resolve => resolve(false))
        
        const headers: IDiscordResponseHeaders = {}
        for(const [key, header] of response.headers.entries()) {
            headers[key] = header
        }
        const bucket = headers["x-ratelimit-bucket"]
        if(bucket) {
            if(!this._rateLimitBuckets.hasOwnProperty(url)) this._rateLimitBuckets[url] = bucket
            const remaining = parseInt(headers["x-ratelimit-remaining"] ?? '')
            const reset = parseInt(headers["x-ratelimit-reset"] ?? '')
            if(!isNaN(remaining) && !isNaN(reset)) {
                const resetTimestamp = reset * 1000
                this._rateLimits[bucket] = {remaining: remaining, resetTimestamp: resetTimestamp}
            }
        }
        return new Promise<boolean>(resolve => resolve(response.ok))
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
    static enqueueMessage(
        url: string, 
        displayName: string = 'N/A',
        iconUrl: string = '', 
        message: string = '', 
        callback: (success: boolean)=>void = (success) => { console.log(`Discord: Enqueue Message callback not set, success: ${success}`)}
    ) {
        this.enqueue(url, this.getFormDataFromPayload({
            username: displayName,
            avatar_url: iconUrl,
            content: message
        }), callback)
    }

    /**
     * Used for Channel Trophy stats, Twitch clips and Steam achievements
     * @param url 
     * @param payload 
     * @returns 
     */
    static enqueuePayload(
        url: string, 
        payload: IDiscordWebookPayload, 
        callback: (success: boolean)=>void = (success) => { console.log(`Discord: Enqueue Payload callback not set, success: ${success}`)}
    ) {
        this.enqueue(url, this.getFormDataFromPayload(payload), callback)
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
    static enqueuePayloadEmbed(
        url: string, 
        imageBlob: Blob, 
        color: number, 
        description?: string,
        authorName?: string,
        authorUrl?: string,
        authorIconUrl?: string,
        footerText?: string,
        callback: (success: boolean)=>void = (success) => { console.log(`Discord: Enqueue PayloadEmbed callback not set, success: ${success}`)}) {
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
                    } : undefined
                }
            ]
        })
        formData.append('file', imageBlob, 'image.png')
        this.enqueue(url, formData, callback)
    }
}