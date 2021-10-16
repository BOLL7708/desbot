// Config
interface IObsConfig {
    password:string
    port:number
    configs: IObsSourceConfigs
    filterOnScenes: string[]
    sourceScreenshotConfig: IObsSourceScreenshotConfig
}
interface IObsSourceConfigs {
    [key:string]: IObsSourceConfig
}
interface IObsSourceConfig {
    sceneNames: string[]
    sourceName: string
    duration?: number
    notificationImage?: string
}
interface IObsSourceScreenshotConfig {
    sourceName: string
    embedPictureFormat: string
    saveToFilePath: string
	discordDescription: string
    discordGameTitle: string
    signTitle: string
    signDuration: number // ms
}

// Callbacks
interface ISceneChangeCallback {
    (sceneName:string): void
}
interface ISourceScreenshotCallback {
    (img:string, data: IScreenshotRequestData): void
}