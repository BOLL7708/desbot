// Config
interface IPhilipsHueConfig {
    serverPath: string
    userName: string
    lightsToControl: number[]
    configs: IPhilipsHueRewardConfigs
}
interface IPhilipsHueRewardConfigs {
    [key:string]:IPhilipsHueColorConfig
}
interface IPhilipsHueColorConfig {
    x: number
    y: number
}
interface IPhilipsHueLightConfig {
    id: number
    rgb: boolean
}

// Response
interface IPhilipsHueLightState {
    on: boolean
    bri: number
    hue: number
    sat: number
    effect: string
    xy: number[]
    ct: number
    alert: string
    mode: string
    reachable: boolean
}
interface IPhilipsHueLightSWUpdate {
    state: string
    lastinstall: string
}
interface IPhilipsHueLight {
    state: IPhilipsHueLightState
    swupdate: IPhilipsHueLightSWUpdate
    type: string
    name: string
    modelid: string
    manufacturername: string
    productname: string
    capabilities: IPhilipsHueLightCapabilities
    
}
 interface IPhilipsHueLightCapabilities {
    certified: boolean,
    control: IPhilipsHueLightCapabilitiesControl
    streaming: IPhilipsHueLightCapabilitiesStreaming
}
interface IPhilipsHueLightCapabilitiesControl {
    mindimlevel: number
    maxlumen: number
    colorgamuttype: string
    colorgamut: number[][]
    ct: {
        min: number,
        max: number
    }
    
}
interface IPhilipsHueLightCapabilitiesControlCT {
    min: number
    max: number
}
interface IPhilipsHueLightCapabilitiesStreaming {
    renderer: boolean
    proxy: boolean
}