/** OBS */
interface IObsConfig {
    password:string
    port:number
    sources: IObsSourceConfig[]
}
interface IObsSourceConfig {
    key: String
    sceneNames: string[]
    sourceName: string
    duration: number
}