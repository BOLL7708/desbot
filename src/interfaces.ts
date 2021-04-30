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
    userName: string,
    userId: number
}
interface IGoogleVoice {
    languageCodes: string[],
    name: string,
    ssmlGender: string,
    naturalSampleRateHertz: number
}
interface IUserVoice {
    userId: number,
    languageCode: string,
    voiceName: string,
    gender: string,
    pitch: number
}

/** PIPE */
interface IPipeConfig {
    port: number
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

