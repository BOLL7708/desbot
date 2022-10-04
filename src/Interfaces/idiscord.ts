/**
 * Settings for sending things to Discord channels.
 */
export interface IDiscordConfig {
    /**
     * Default embed highlight color for redeemed screenshots, will use the user color instead if they have spoken at least once.
     * 
     * Note: This has to be a hex color to work with Discord.
     */
    remoteScreenshotEmbedColor: string
    
    /**
     * Embed highlight color for manual screenshots.
     * 
     * Note: This has to be a hex color to work with Discord.
     */
    manualScreenshotEmbedColor: string
    
    /**
     * Prefix added to cheer messages in the log.
     * 
     * Note: This prefix should include a trailing space if you want it to be separated from the message.
     */
    prefixCheer: string
    
    /**
     * Prefix added to reward messages in the log.
     * 
     * Note: This prefix should include a trailing space if you want it to be separated from the message.
     */
    prefixReward: string
}

// https://discord.com/developers/docs/resources/webhook#execute-webhook
export interface IDiscordWebookPayload {
    content?: string // content, file or embeds
    username?: string
    avatar_url?: string
    tts?: boolean
    file?: any // // content, file or embeds
    embeds?: IDiscordEmbed[] // // content, file or embeds (up to 10)
    payload_json?: string // multipart/form-data JSON encoded body of non-file params
    allowed_mentions?: any // TODO
    components?: any // TODO
}
// https://discord.com/developers/docs/resources/channel#embed-object
export interface IDiscordEmbed {
    title?: string
    type?: string // Always "rich" for webhooks
    description?: string
    url?: string
    timestamp?: string // ISO8601 timestamp
    color?: number
    footer?: IDiscordEmbedFooter
    image?: IDiscordEmbedMedia
    thumbnail?: IDiscordEmbedMedia
    video?: IDiscordEmbedMedia // Apparently not supported by webhooks
    provider?: IDiscordEmbedProvider
    author?: IDiscordEmbedAuthor
    fields?: IDiscordEmbedField[]
}
export interface IDiscordEmbedFooter {
    text: string
    icon_url?: string
    proxy_icon_uri?: string
}
export interface IDiscordEmbedMedia {
    url: string
    proxy_url?: string
    height?: number
    width?: number
}
export interface IDiscordEmbedProvider {
    name?: string
    url?: string
}
export interface IDiscordEmbedAuthor {
    name: string
    url?: string
    icon_url?: string
    proxy_icon_url? : string
}
// https://discord.com/developers/docs/resources/channel#embed-object-embed-field-structure
export interface IDiscordEmbedField {
    name: string
    value: string
    inline?: boolean
}

// Internal
export interface IDiscordRateLimit {
    remaining: number
    resetTimestamp: number
}
export interface IDiscordQueue {
    formData: FormData,
    callback?: (success: boolean) => void
}

// Response rate-limit headers
// https://discord.com/developers/docs/topics/rate-limits
export interface IDiscordResponseHeaders {
    'content-type'?: string
    date?: string
    'x-ratelimit-bucket'?: string
    'x-ratelimit-limit'?: string
    'x-ratelimit-remaining'?: string
    'x-ratelimit-reset'?: string
    'x-ratelimit-reset-after'?: string
    'x-ratelimit-global'?: string
    'x-ratelimit-scope'?: string
    [x: string]: any
}