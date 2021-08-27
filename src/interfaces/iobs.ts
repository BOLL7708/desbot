// Config
interface IObsConfig {
    password:string
    port:number
    configs: IObsSourceConfigs
    filterOnScenes: string[]
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

// Callbacks
interface ISceneChangeCallback {
    (sceneName:string): void
}