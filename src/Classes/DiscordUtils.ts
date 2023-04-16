import Utils from './Utils.js'
import {IDiscordResponseHeaders, IDiscordWebookPayload} from '../Interfaces/idiscord.js'

enum EResponseState {
    OK,
    Retry,
    Skip
}

export default class DiscordUtils {
    // region Pipe
    private static _rateLimits: { [bucket: string]: IDiscordRateLimit } = {} // Bucket, limit?
    private static _rateLimitBuckets: { [url: string]: string } = {} // Url, Bucket
    private static _messageQueues: { [url: string]: DiscordQueueItem[] } = {} // URL, Payloads
    private static readonly SEND_INTERVAL_MS = 500
    private static _messageIntervalHandle = setInterval(async ()=>{
        for(const [url, queue] of Object.entries(this._messageQueues)) {
            if(queue.length > 0) {
                const bucketName = this._rateLimitBuckets[url] ?? null
                const rateLimit = this._rateLimits[bucketName] ?? null
                const now = Date.now()

                // Could be > 0 remaining and > resetTimestamp, but to avoid error instances we slow things down.
                if(rateLimit == null || (rateLimit.remaining > 1 || now > (rateLimit.resetTimestamp + DiscordUtils.SEND_INTERVAL_MS))) {
                    const item = queue.shift() ?? new DiscordQueueItem() // Fallback should not be necessary, but needed to fix the type.
                    const result = await this.send(url, item)
                    switch(result) {
                        case EResponseState.Retry:
                            queue.unshift(item) // Add item we just sent back onto the front of the queue.
                            console.log('Discord: Retry', item)
                            break
                        case EResponseState.Skip:
                            console.warn('Discord: Skipped', item)
                            break
                    }
                } else {
                    console.log(`Discord: Waiting for rate limit ${rateLimit.remaining} to reset in ${rateLimit.resetTimestamp-now}ms`)
                }
            } else {
                // Remove queue if empty
                if(this._messageQueues.hasOwnProperty(url)) delete DiscordUtils._messageQueues[url]
            }
        }
    }, DiscordUtils.SEND_INTERVAL_MS)

    /**
     * Enqueue a message to be sent to Discord.
     * @param url
     * @param formData
     * @param callback
     */
    private static enqueue(
        url: string, 
        formData: FormData,
        callback?: IDiscordQueueItemCallback
    ) {
        // Check if queue exists, if not, initiate it with the incoming data.
        const item = new DiscordQueueItem(formData, callback)
        if (!this._messageQueues.hasOwnProperty(url)) this._messageQueues[url] = [item]
        else this._messageQueues[url].push(item)
    }

    /**
     * Main send function that transmits messages to Discord over webhoooks.
     * @param url
     * @param item
     */
    private static async send(url: string, item: DiscordQueueItem): Promise<EResponseState> {
        const options = {
            method: 'post',
            body: item.data
        }
        const response: Response = await fetch(url, options)
        if(response == null) {
            console.warn('Discord: Catastrophic Failure', url, item.data)
            return EResponseState.Skip
        }
        const headers: IDiscordResponseHeaders = {}
        for(const [key, header] of response.headers.entries()) {
            headers[key] = header
        }
        if(headers['x-ratelimit-global']) {
            console.warn('Discord: ratelimit was global, this is unexpected as it usually means the server is in a bad standing!', url, item.data, headers)
        }
        const bucket = headers["x-ratelimit-bucket"]
        if(bucket) {
            if(!this._rateLimitBuckets.hasOwnProperty(url)) this._rateLimitBuckets[url] = bucket
            const remaining = Utils.ensureNumber(headers["x-ratelimit-remaining"], 0)
            const reset = Utils.ensureNumber(headers["x-ratelimit-reset"], 0)
            if(response.ok) {
                const resetTimestamp = reset * 1000
                this._rateLimits[bucket] = {remaining: remaining, resetTimestamp: resetTimestamp}
                if(item.callback) item.callback(true)
                return EResponseState.OK
            } else if(response.status == 429) {
                this._rateLimits[bucket] = {remaining: 0, resetTimestamp: (reset+1) * 1000}
                return EResponseState.Retry
            }
        }
        if(item.callback) item.callback(false)
        return EResponseState.Skip
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
    // endregion

    // region Public

    /**
     * Used for Twitch Chat log and Twitch Reward redemptions
     * @param url
     * @param displayName
     * @param iconUrl
     * @param message
     * @param callback
     */
    static enqueueMessage(
        url: string, 
        displayName: string = 'N/A',
        iconUrl: string = '', 
        message: string = '',
        callback?: IDiscordQueueItemCallback
    ) {
        this.enqueue(
            url,
            this.getFormDataFromPayload({
                username: displayName,
                avatar_url: iconUrl,
                content: message
            }),
            callback
        )
    }

    /**
     * Used for Channel Trophy stats, Twitch clips and Steam achievements
     * @param url
     * @param payload
     * @param callback
     * @returns
     */
    static enqueuePayload(
        url: string, 
        payload: IDiscordWebookPayload,
        callback?: IDiscordQueueItemCallback
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
     * @param callback
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
        callback?: IDiscordQueueItemCallback
    ) {
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
        this.enqueue(url, formData)
    }
    // endregion
}

export interface IDiscordQueueItemCallback {
    (success: boolean): void
}

// Internal
interface IDiscordRateLimit {
    remaining: number
    resetTimestamp: number
}
class DiscordQueueItem {
    constructor(data?: FormData, callback?: IDiscordQueueItemCallback) {
        if(data) this.data = data
        if(callback) this.callback = callback
    }
    data = new FormData()
    callback: IDiscordQueueItemCallback = (success: boolean)=>{}
}