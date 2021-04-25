interface IConfig {
    google:IGoogleConfig,
    obs:IObsConfig,
    twitch:ITwitchConfig
}

/** GOOGLE */
interface IGoogleConfig {
    apiKey:string
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
    token: string, // TODO: Temp
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

