import Utils from './Utils.js'
import Config from './Config.js'
import Color from './ColorConstants.js'
import {IPhilipsHuePlugAction} from '../Interfaces/iactions.js'
import {ConfigPhilipsHue} from './ConfigObjects.js'
import DataBaseHelper from './DataBaseHelper.js'

export default class PhilipsHue {
    private _config = new ConfigPhilipsHue()
    private _baseUrl = ''
    constructor() {
        if(this._baseUrl.length > 0) this.loadLights()
        this.init().then()
    }
    private async init() {
        this._config = await DataBaseHelper.loadMain(new ConfigPhilipsHue())
        this._baseUrl = `${this._config.serverPath}/api/${Config.credentials.PhilipsHueUsername}`
    }
    private loadLights() { // Not used for anything except checking states
        const url = `${this._baseUrl}/lights`
        fetch(url).then(response => response.json()).then(data => {
            // console.table(data)
        })
    }
    async setLightState(id:number, x:number, y:number): Promise<boolean> {
        const url = `${this._baseUrl}/lights/${id}/state`
        const body = {
            on: true,
            bri: 255,
            xy: [x,y] // Maybe use hue instead? This works though.
        }
        const response = await fetch(url, {
            method: 'PUT',
            body: JSON.stringify(body)
        })
        if(response.ok) {
            const result = await response.json()
            let state = true
            for(const r of result) { if(r?.success === undefined) state = false }
            Utils.log(`PhilipsHue: Set light ${id} to x:${x} y:${y}`, Color.Green)
            return state
        } else {
            Utils.log(`PhilipsHue: Error setting light ${id} to x:${x} y:${y}: ${response.statusText}`, Color.Red)
            return false
        }
    }

    runPlugConfig(config: IPhilipsHuePlugAction) {
        // TODO: Use the response from the set function to see if we should retry.
        //  Possibly also use the get state to make sure it worked.
        this.setPlugState(config.id, config.triggerState).then()
        if(config.duration != undefined) {
            setTimeout(() => {
                this.setPlugState(config.id, config.originalState).then()
            }, config.duration*1000)
        }
    }
    async getPlugState(id: number): Promise<boolean> {
        const url = `${this._baseUrl}/lights/${id}`
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
    async setPlugState(id: number, state: boolean): Promise<boolean> {
        const url = `${this._baseUrl}/lights/${id}/state`
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
}