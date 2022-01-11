// Config
interface IObsConfig {
    port:number
    configs: { [key:string]: IObsSourceConfig }
    filterOnScenes: string[]
    sourceScreenshotConfig: IObsSourceScreenshotConfig
}
interface IObsSourceConfig {
    sourceName: string
    sceneNames?: string[]
    durationMs?: number
    notificationImage?: string
    notificationConfig?: IPipeCustomMessage
    filterName?: string
}
interface IObsSourceScreenshotConfig {
    sourceName: string
    embedPictureFormat: string
    saveToFilePath: string
	discordDescription: string
    discordGameTitle: string
    signTitle: string
    signDurationMs: number // ms
}

// Callbacks
interface ISceneChangeCallback {
    (sceneName:string): void
}
interface ISourceScreenshotCallback {
    (img:string, data: IScreenshotRequestData): void
}