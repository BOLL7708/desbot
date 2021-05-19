class OBS {
    private _socket: WebSockets
    private _config = Config.instance.obs;
    private _messageCounter: number = 10;
    constructor() {
        this._socket = new WebSockets(`ws://localhost:${this._config.port}`, 10, false)
        this._socket._onOpen = this.onOpen.bind(this)
        this._socket._onMessage = this.onMessage.bind(this)
        this._socket.init()
    }
    private onOpen(evt) {
        this._socket.send(this.buildRequest("GetAuthRequired", 1, {}))
    }
    private onMessage(evt) {
        let data = JSON.parse(evt.data)
		let id = parseInt(data["message-id"])
        let updateType = data['update-type'];

        switch(id) {
			case 1:
                this.sha256(this._config.password + data.salt).then(secret => {
                    this.sha256(secret + data.challenge).then(authResponse => {
                        this._socket.send(this.buildRequest("Authenticate", 2, {auth: authResponse}));
                    })
                })
				break
			case 2:
				console.log(`OBS auth: ${data.status}`)
				if(data.status != "ok") this._socket.disconnect()
				break
			default: 
                switch(updateType) {
                    case 'SwitchScenes':
                        let sceneName = data['scene-name']
                        console.log(sceneName)
                        // TODO: RETURN THE VALUE TO SOME CALLBACK HERE.
                        break
                    default:
                        console.log(evt.data)
                        break
                }
                break
		}
    }

    showSource(sourceConfig: IObsSourceConfig) {
        let type = "SetSceneItemProperties";
        let sourceName = sourceConfig.sourceName;
        sourceConfig.sceneNames.forEach(sceneName => {
            this._socket.send(this.buildRequest(type, ++this._messageCounter, {
                "scene-name": sceneName,
                "item": sourceName,
                "visible": true
            }));
            setTimeout(() => {
                this._socket.send(this.buildRequest(type, ++this._messageCounter, {
                    "scene-name": sceneName,
                    "item": sourceName,
                    "visible": false
                }));
            }, sourceConfig.duration);
        });
    }

    buildRequest(type:string, id:number, options:object) {
        let request = {
            "request-type": type,
            "message-id": `${id}`
        }
        for (const [key, value] of Object.entries(options)) {
            request[key] = value
        }
        return JSON.stringify(request)
    }

    async sha256(message:string) {
        const textBuffer = new TextEncoder().encode(message); // encode as UTF-8
        const hashBuffer = await crypto.subtle.digest('SHA-256', textBuffer); // hash the message
        const byteArray = Array.from(new Uint8Array(hashBuffer)); // convert ArrayBuffer to Array
        let base64String = btoa(String.fromCharCode(...byteArray)); // b64 encode byte array
        return base64String;
    }
}