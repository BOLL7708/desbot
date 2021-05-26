// Config
interface IPhilipsHueConfig {
    serverPath: string
    userName: string
    lightsToControl: number[]
}
interface IPhilipsHueLightConfig {
    id: number
    rgb: boolean
}