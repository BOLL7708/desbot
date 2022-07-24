class PhilipsHue {
    private _config = Config.philipshue
    private _baseUrl = `${this._config.serverPath}/api/${Config.credentials.PhilipsHueUsername}`
    constructor() {
        if(this._baseUrl.length > 0) this.loadLights()
    }
    private loadLights() { // Not used for anything except checking states
        const url = `${this._baseUrl}/lights`
        fetch(url).then(response => response.json()).then(data => {
            // console.table(data)
        })
    }
    setLightState(id:number, x:number, y:number) {
        const url = `${this._baseUrl}/lights/${id}/state`
        const body = {
            on: true,
            bri: 255,
            xy: [x,y] // Maybe use hue instead? This works though.
        }
        fetch(url, {
            method: 'PUT',
            body: JSON.stringify(body)
        })
        .then(response => response.json())
        .then(data => {
            Utils.log(`PhilipsHue: Set light ${id} to x:${x} y:${y}`, Color.Green)
        })
        .catch(error => {
            Utils.log(`PhilipsHue: Error setting light ${id} to x:${x} y:${y}: ${error}`, Color.Red)
        })
    }

    runPlugConfig(config: IPhilipsHuePlugAction) {
        this.setPlugState(config.id, config.triggerState)
        if(config.duration != undefined) {
            setTimeout(() => {
                this.setPlugState(config.id, config.originalState)
            }, config.duration*1000)
        }
    }
    setPlugState(id: number, state: boolean) {
        const url = `${this._baseUrl}/lights/${id}/state`
        const body = {on: state}
        fetch(url, {
            method: 'PUT',
            body: JSON.stringify(body)
        })
        .then(response => response.json())
        .then(data => {
            Utils.log(`PhilipsHue: Attempted to set plug ${id} to ${state}`, Color.Green)
        })
        .catch(error => {
            Utils.log(`PhilipsHue: Error setting plug ${id} to ${state}: ${error}`, Color.Red)
        })
    }
}