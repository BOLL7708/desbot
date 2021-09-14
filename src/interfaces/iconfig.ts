// Config
interface IConfig {
    controller: IControllerConfig
    google: IGoogleConfig
    pipe: IPipeConfig
    obs: IObsConfig
    twitch: ITwitchConfig
    screenshots: IScreenshotConfig
    discord: IDiscordConfig
    philipshue: IPhilipsHueConfig
    openvr2ws: IOpenVR2WSConfig
    audioplayer: IAudioPlayerConfig
}

interface IControllerConfig {
    pipeForAllDefault: boolean
    ttsForAllDefault: boolean
    pingForChat: boolean
    logChatToDiscordDefault: boolean
    commandReferences: IConfigCommandReferences
    speechReferences: IConfigSpeechReferences
}

interface IConfigCommandReferences {
    [key: string]: string
}

interface IConfigSpeechReferences {
    [key: string]: string|string[]
}