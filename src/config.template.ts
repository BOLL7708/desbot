class Config {
    static instance: IConfig ={
        google: {
            apiKey: ""
        },
        pipe: {
            port: 8077
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
            userId: 0,
            clientId: "",
            clientSecret: "",
            channelname: "",
            botName: "",
            rewards: [
                {
                    key: "",
                    id: ""
                }
            ]
        }
    }
}