/**
 * Control Philips Hue lights or sockets
 */
interface IPhilipsHueConfig {
    /**
     * Local IP address of the Philips Hue bridge, start with the protocol: `http://`
     */
    serverPath: string
    /**
     * The light numbers of all the lights you want to control.
     */
    lightsIds: number[]
}

interface IPhilipsHueBulb {
    x: number
    y: number
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