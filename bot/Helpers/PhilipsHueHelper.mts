import DataBaseHelper from './DataBaseHelper.mts'
import {INumberDictionary} from '../Interfaces/igeneral.mts'
import {PresetPhilipsHueBulb, PresetPhilipsHuePlug} from '../Objects/Data/Preset/PresetPhilipsHue.mts'
import Utils from '../Utils/Utils.mts'
import ConfigPhilipsHue from '../Objects/Data/Config/ConfigPhilipsHue.mts'
import Color from '../Constants/ColorConstants.mts'

export default class PhilipsHueHelper {
    private static async getBaseUrl() {
        const config = await DataBaseHelper.loadMain(new ConfigPhilipsHue())
        return `${config.serverPath}/api/${config.username}`
    }
    static async loadLights(): Promise<INumberDictionary> {
        const baseUrl = await this.getBaseUrl()
        const url = `${baseUrl}/lights`
        const response = await fetch(url)
        let lightsLoaded = 0
        let lightsAdded = 0
        let plugsAdded = 0
        if(response.ok) {
            const lights = await response.json() as { [key:string]: IPhilipsHueLight }
            lightsLoaded = Object.keys(lights).length
            for(const [key, light] of Object.entries(lights)) {
                let preset: PresetPhilipsHueBulb|PresetPhilipsHuePlug|undefined = undefined
                if(
                    light.productname.toLowerCase().includes('lamp')
                    || light.productname.includes('play')
                ) {
                    lightsAdded++;
                    preset = new PresetPhilipsHueBulb()
                } else if(light.productname.includes('plug')) {
                    plugsAdded++;
                    preset = new PresetPhilipsHuePlug()
                }
                if(preset != undefined) {
                    preset.name = light.name
                    await DataBaseHelper.save(preset, key)
                }
            }
        } else {
            console.warn('PhilipsHue: Unable to load lights.')
        }
        return { deviceLoaded: lightsLoaded, lightsFound: lightsAdded, plugsFound: plugsAdded }
    }
    static runBulbs(ids: string[], brightness: number, hue: number, saturation: number) {
        for(const id of ids) {
            const num = parseInt(id)
            if(!isNaN(num)) {
                this.setLightState(num, brightness, hue, saturation).then()
            }
        }
    }
    static async setLightState(id:number, brightness: number, hue: number, saturation: number): Promise<boolean> {
        const baseUrl = await this.getBaseUrl()
        const url = `${baseUrl}/lights/${id}/state`
        const body = {
            on: true,
            bri: brightness,
            hue: hue,
            sat: saturation
        }
        const response = await fetch(url, {
            method: 'PUT',
            body: JSON.stringify(body)
        })
        if(response.ok) {
            const result = await response.json()
            let state = true
            for(const r of result) { if(r?.success === undefined) state = false }
            Utils.log(`PhilipsHue: Set light ${id} to brightness: ${brightness}, hue: ${hue}, saturation: ${saturation}`, Color.Green)
            return state
        } else {
            Utils.log(`PhilipsHue: Error setting light ${id}  to brightness: ${brightness}, hue: ${hue}, saturation: ${saturation}, ${response.statusText}`, Color.Red)
            return false
        }
    }

    static runPlugs(ids: string[], state: boolean, originalState: boolean, duration: number = 0) {
        // TODO: Use the response from the set function to see if we should retry.
        //  Possibly also use the get state to make sure it worked.
        for(const id of ids) {
            const num = parseInt(id)
            if(!isNaN(num)) {
                this.setPlugState(num, state).then()
            }
            if(duration) {
                setTimeout(() => {
                    this.setPlugState(num, originalState).then()
                }, duration*1000)
            }
        }
    }
    static async getPlugState(id: number): Promise<boolean> {
        const baseUrl = await this.getBaseUrl()
        const url = `${baseUrl}/lights/${id}`
        const response = await fetch(url)
        if(response.ok) {
            const result = await response.json()
            let state = true
            for(const r of result) { if(r?.success === undefined) state = false }
            Utils.log(`PhilipsHue: Get state for plug ${id}: ${state}`, Color.Green)
            return state
        } else {
            Utils.log(`PhilipsHue: Error getting state for plug ${id}: ${response.statusText}`, Color.Red)
            return false
        }
    }
    static async setPlugState(id: number, state: boolean): Promise<boolean> {
        const baseUrl = await this.getBaseUrl()
        const url = `${baseUrl}/lights/${id}/state`
        const body = {on: state}
        const response = await fetch(url, {
            method: 'PUT',
            body: JSON.stringify(body)
        })
        if(response.ok) {
            const result = await response.json()
            let state = true
            for(const r of result) { if(r?.success === undefined) state = false }
            Utils.log(`PhilipsHue: Attempted to set plug ${id} to ${state}`, Color.Green)
            return state
        } else {
            Utils.log(`PhilipsHue: Error setting plug ${id} to ${state}: ${response.statusText}`, Color.Red)
            return false
        }
    }

    static async registerBridge(serverPath: string): Promise<IPhilipsHueBridgeRegisterResult> {
        const response = await fetch(`${serverPath}/api`, {
            method: 'POST',
            body: JSON.stringify({devicetype: 'desbot.app'})
        })
        if(response.ok) {
            const json = await response.json()
            const first = json[0]
            if(first?.success) {
                return { username: json[0].success.username, error: ''}
            } else if (first?.error) {
                return { username: '', error: json[0].error.description }
            } else {
                return { username: '', error: 'Unknown error' }
            }
        } else {
            return { username: '', error: response.statusText }
        }
    }
}
export interface IPhilipsHueBridgeRegisterResult { username: string, error: string }

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