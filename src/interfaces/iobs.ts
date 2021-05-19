// Config
interface IObsConfig {
    password:string
    port:number
    sources: IObsSourceConfig[]
    filterOnScenes: string[]
}
interface IObsSourceConfig {
    key: String
    sceneNames: string[]
    sourceName: string
    duration: number
}

// Callbacks
interface ISceneChangeCallback {
    (sceneName:string): void
}