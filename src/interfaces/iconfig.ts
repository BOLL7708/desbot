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
}

interface IControllerConfig {
    pipeForAllDefault: boolean
    ttsForAllDefault: boolean
}