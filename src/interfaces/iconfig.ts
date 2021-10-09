// Config
interface IConfig {
    controller: IControllerConfig
    google: IGoogleConfig
    pipe: IPipeConfig
    obs: IObsConfig
    screenshots: IScreenshotConfig
    discord: IDiscordConfig
    philipshue: IPhilipsHueConfig
    openvr2ws: IOpenVR2WSConfig
    audioplayer: IAudioPlayerConfig
    sign: ISignConfig
    run: IRunConfig
    twitch: ITwitchConfig
}

interface IControllerConfig {
    pipeForAllDefault: boolean
    ttsForAllDefault: boolean
    pingForChat: boolean
    logChatToDiscordDefault: boolean
    useGameSpecificRewards: boolean
    websocketsUsed: IConfigWebsocketsUsed
    commandReferences: IConfigCommandReferences
    commandPermissionsDefault: ICommandPermissions
    commandPermissionsReferences: IConfigCommandPermissions
    speechReferences: IConfigSpeechReferences
    rewardReferences: IConfigRewardReferences
    phpPassword: string
}

interface IConfigCommandReferences {
    [key: string]: string
}

interface IConfigSpeechReferences {
    [key: string]: string|string[]
}

interface IConfigCommandPermissions {
    [key: string]: ICommandPermissions
}

interface IConfigRewardReferences {
    [key: string]: string
}

interface IConfigWebsocketsUsed {
    twitch: boolean
    openvr2ws: boolean
    pipe: boolean
    obs: boolean
    screenshots: boolean
}