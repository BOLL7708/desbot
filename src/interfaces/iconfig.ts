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
    twitch: ITwitchConfig
}

interface IControllerConfig {
    pipeForAllDefault: boolean
    ttsForAllDefault: boolean
    pingForChat: boolean
    logChatToDiscordDefault: boolean
    commandReferences: IConfigCommandReferences
    commandPermissionsDefault: ICommandPermissions
    commandPermissionsReferences: IConfigCommandPermissions
    speechReferences: IConfigSpeechReferences
    rewardReferences: IConfigRewardReferences
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