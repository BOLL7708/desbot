// Config
interface IObsConfig {
    password:string
    port:number
    sources: IObsSourceConfigs
    filterOnScenes: string[]
}
interface IObsSourceConfigs {
    [key:string]: IObsSourceConfig
}
interface IObsSourceConfig {
    sceneNames: string[]
    sourceName: string
    duration: number
}

// Callbacks
interface ISceneChangeCallback {
    (sceneName:string): void
}