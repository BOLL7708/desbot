class PhilipsHue {
    private _config = Config.instance.philipshue
    private _baseUrl = `${this._config.serverPath}/api/${this._config.userName}`
    constructor() {
        this.loadLights()
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
        }).then(response => response.json()).then(data => {
            // console.table(data)
        })
    }
}