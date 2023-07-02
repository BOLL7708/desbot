export interface IPhilipsHueBulb {
    x: number
    y: number
}

// Response
export interface IPhilipsHueLight {
    state: IPhilipsHueLightState
    swupdate: IPhilipsHueLightSWUpdate
    type: string
    name: string
    modelid: string
    manufacturername: string
    productname: string
    capabilities: IPhilipsHueLightCapabilities
    config: IPhilipsHueLightConfig
    uniqueid: string
    swversion: string
    swconfigid: string
    productid: string
}
export interface IPhilipsHueLightState {
    on: boolean
    alert: string
    mode: string
    reachable: boolean
    bri?: number
    hue?: number
    sat?: number
    effect?: string
    xy?: number[]
    ct?: number
}
export interface IPhilipsHueLightSWUpdate {
    state: string
    lastinstall: string
}
export interface IPhilipsHueLightCapabilities {
    certified: boolean,
    control: IPhilipsHueLightCapabilitiesControl
    streaming: IPhilipsHueLightCapabilitiesStreaming
}
export interface IPhilipsHueLightCapabilitiesControl {
    mindimlevel?: number
    maxlumen?: number
    colorgamuttype?: string
    colorgamut?: number[][]
    ct?: {
        min: number,
        max: number
    }
}
export interface IPhilipsHueLightCapabilitiesStreaming {
    renderer: boolean
    proxy: boolean
}
export interface IPhilipsHueLightConfig {
    archetype: string
    function: string
    direction: string
    startup: {
        mode: string
        configured: boolean
    }
}

export interface IPhilipsHueLightCapabilitiesControlCT {
    min: number
    max: number
}
