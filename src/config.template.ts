class Config {
    static instance: IConfig ={
        google: {
            apiKey: ""
        },
        obs: {
            password: "",
            port: 4445,
            sources: [
                {
                    key: "",
                    sceneNames: [""],
                    sourceName: "",
                    duration: 10000
                }
            ]
        },
        twitch: {
            token: "", // TODO: Temp
            userId: 0,
            clientId: "",
            clientSecret: "",
            rewards: [
                {
                    key: "",
                    id: ""
                }
            ]
        }
    }
}