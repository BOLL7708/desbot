interface IConfig {
    google:IGoogleConfig,
    pipe:IPipeConfig,
    obs:IObsConfig,
    twitch:ITwitchConfig
}

/** GOOGLE */
interface IGoogleConfig {
    apiKey:string
}
interface ISentence {
    text: string,
    userName: string
}
interface IGoogleVoice {
    languageCodes: string[],
    name: string,
    ssmlGender: string,
    naturalSampleRateHertz: number
}
interface IUserVoice {
    userName: string,
    languageCode: string,
    voiceName: string,
    gender: string,
    pitch: number
}
interface IUserName {
    userName:string,
    shortName:string
}

/** PIPE */
interface IPipeConfig {
    port: number
}
interface IPipeCustomMessage {
    image: string,
    custom: boolean,
    properties: IPipeCustomProperties,
    transition: IPipeCustomTransition,
    transition2: IPipeCustomTransition
}
interface IPipeCustomProperties {
    headset: boolean,
    horizontal: boolean,
    channel: number,
    hz: number,
    duration: number,
    width: number,
    distance: number,
    pitch: number,
    yaw: number
}
interface IPipeCustomTransition {
    scale: number,
    opacity: number,
    vertical: number,
    distance: number,
    horizontal: number,
    spin: number,
    tween: number,
    duration: number
}

/** OBS */
interface IObsConfig {
    password:string,
    port:number,
    sources: IObsSourceConfig[]
}
interface IObsSourceConfig {
    key: String,
    sceneNames: string[],
    sourceName: string,
    duration: number
}

/** Twitch */
interface ITwitchConfig {
    userId: number,
    clientId: string,
    clientSecret: string,
    channelName: string,
    botName: string,
    rewards: ITwitchRewardConfig[]
}
interface ITwitchRewardConfig {
    key: string,
    id: string
}
interface IPubsubReward {
    id: string,
    callback: (data: object) => void
}
interface ITwitchTokens {
    access_token: string,
    refresh_token: string,
    updated: string
}
