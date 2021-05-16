interface IConfig {
    google:IGoogleConfig
    pipe:IPipeConfig
    obs:IObsConfig
    twitch:ITwitchConfig
}

/** GOOGLE */
interface IGoogleConfig {
    apiKey: string
    speakerTimeoutMs: number
}
interface ISentence {
    text: string
    userName: string
    type: number
}
interface IGoogleVoice {
    languageCodes: string[]
    name: string
    ssmlGender: string
    naturalSampleRateHertz: number
}
interface IUserVoice {
    userName: string
    languageCode: string
    voiceName: string
    gender: string
    pitch: number
}
interface IUserName {
    userName:string
    shortName:string
}

/** PIPE */
interface IPipeConfig {
    port: number
}
interface IPipeCustomMessage {
    image: string
    custom: boolean
    properties: IPipeCustomProperties
    transition: IPipeCustomTransition
    transition2: IPipeCustomTransition
}
interface IPipeCustomProperties {
    headset: boolean
    horizontal: boolean
    channel: number
    hz: number
    duration: number
    width: number
    distance: number
    pitch: number
    yaw: number
}
interface IPipeCustomTransition {
    scale: number
    opacity: number
    vertical: number
    distance: number
    horizontal: number
    spin: number
    tween: number
    duration: number
}

/** OBS */
interface IObsConfig {
    password:string
    port:number
    sources: IObsSourceConfig[]
}
interface IObsSourceConfig {
    key: String
    sceneNames: string[]
    sourceName: string
    duration: number
}

/** Twitch */
interface ITwitchConfig {
    userId: number
    clientId: string
    clientSecret: string
    channelName: string
    botName: string
    usersWithTts: string[]
    usersWithTtsTriggers: string[]
    usersWithTtsIgnore: string[]
    rewards: ITwitchRewardConfig[]
}
interface ITwitchRewardConfig {
    key: string
    id: string
}
interface IPubsubReward {
    id: string
    callback: (data: object) => void
}
interface ITwitchTokens {
    access_token: string
    refresh_token: string
    updated: string
}
interface ITwitchRedemptionMessage {
    timestamp: string
    redemption: ITwitchRedemption
}
interface ITwitchRedemption {
    channel_id: string
    id: string
    redeemed_at: string
    reward: ITwitchReward
    status: string
    user: ITwitchUser
    user_input: string
}
interface ITwitchReward {
    background_color: string
    channel_id: string
    cooldown_expires_at: string
    cost: number
    default_image: any // !
    global_cooldown: any // !
    id: string
    image: string // ?
    is_enabled: boolean
    is_in_stock: boolean
    is_paused: boolean
    is_sub_only: boolean
    is_user_input_requires: boolean
    max_per_stream: any // !
    max_per_user_per_stream: any // !
    prompt: string
    redemptions_redeemed_current_stream: any // ?
    should_redemptions_skip_request_queue: boolean
    template_id: any // ?
    title: string
    update_for_indicator_at: string
}
interface ITwitchUser {
    display_name:string
    id: string
    login: string
}
