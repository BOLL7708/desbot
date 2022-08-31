/**
 * Control Philips Hue lights or sockets
 */
export interface IPhilipsHueConfig {
    /**
     * Local IP address of the Philips Hue bridge, start with the protocol: `http://`
     */
    serverPath: string
    /**
     * The light numbers of all the lights you want to control.
     */
    lightsIds: number[]
}

export interface IPhilipsHueBulb {
    x: number
    y: number
}

// Response
export interface IPhilipsHueLightState {
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
export interface IPhilipsHueLightSWUpdate {
    state: string
    lastinstall: string
}
export interface IPhilipsHueLight {
    state: IPhilipsHueLightState
    swupdate: IPhilipsHueLightSWUpdate
    type: string
    name: string
    modelid: string
    manufacturername: string
    productname: string
    capabilities: IPhilipsHueLightCapabilities
    
}
export interface IPhilipsHueLightCapabilities {
    certified: boolean,
    control: IPhilipsHueLightCapabilitiesControl
    streaming: IPhilipsHueLightCapabilitiesStreaming
}
export interface IPhilipsHueLightCapabilitiesControl {
    mindimlevel: number
    maxlumen: number
    colorgamuttype: string
    colorgamut: number[][]
    ct: {
        min: number,
        max: number
    }
}
export interface IPhilipsHueLightCapabilitiesControlCT {
    min: number
    max: number
}
export interface IPhilipsHueLightCapabilitiesStreaming {
    renderer: boolean
    proxy: boolean
}