// Config
interface IPhilipsHueConfig {
    serverPath: string
    userName: string
    lightsIds: number[]
    lightConfigs: { [key:string]: IPhilipsHueColorConfig }
    plugConfigs: { [key:string]: IPhilipsHuePlugConfig }
}
interface IPhilipsHueColorConfig {
    x: number
    y: number
}
interface IPhilipsHueLightConfig {
    id: number // Id from the Philips Hue bridge
    rgb: boolean
}
interface IPhilipsHuePlugConfig {
    id: number // Id from the Philips Hue bridge
    originalState: boolean // What it is reset to
    triggerState: boolean // What it is set to when triggered
    duration?: number // Will switch back to original state if supplied
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